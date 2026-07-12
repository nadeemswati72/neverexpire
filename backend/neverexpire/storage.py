"""
Storage abstraction layer for document files.

Supports multiple backends:
- Local filesystem (default for PoC)
- Google Drive (future, requires credentials)
"""

import os
from pathlib import Path
from typing import Optional
from abc import ABC, abstractmethod


def gdrive_cache_path(storage_id: str, suffix: str) -> Path:
    """
    Deterministic local path for the decrypted working copy of a Drive-stored
    file — needed because the watermark pipeline (Pillow) operates on real
    paths on disk. This is a transient cache, not the source of truth; the
    encrypted original lives in Drive.
    """
    from . import config

    file_id = storage_id.removeprefix("gdrive:")
    return config.STAGING_DIR / f"gdrive_cache_{file_id}{suffix}"


class StorageBackend(ABC):
    """Abstract base class for storage backends."""

    @abstractmethod
    def save_file(self, file_path: str, file_name: str) -> str:
        """Save file and return storage identifier."""
        pass

    @abstractmethod
    def get_file(self, storage_id: str) -> bytes:
        """Retrieve file content as bytes."""
        pass

    @abstractmethod
    def delete_file(self, storage_id: str) -> bool:
        """Delete file, return True if successful."""
        pass

    @abstractmethod
    def file_exists(self, storage_id: str) -> bool:
        """Check if file exists."""
        pass


class LocalStorageBackend(StorageBackend):
    """Local filesystem storage backend."""

    def __init__(self, base_path: Optional[str] = None):
        """Initialize with optional custom base path."""
        if base_path is None:
            base_path = os.path.join(os.path.dirname(__file__), "..", "data", "uploads")
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_path: str, file_name: str) -> str:
        """
        Save file from temp location to storage.
        Returns the relative path for storage in database.
        """
        source = Path(file_path)
        if not source.exists():
            raise FileNotFoundError(f"Source file not found: {file_path}")

        dest = self.base_path / source.name
        dest.parent.mkdir(parents=True, exist_ok=True)

        # Copy file to storage
        import shutil
        shutil.copy2(source, dest)

        # Return path relative to base, or absolute (depends on config)
        return str(dest)

    def get_file(self, storage_id: str) -> bytes:
        """Retrieve file from storage."""
        file_path = Path(storage_id)
        if not file_path.exists():
            raise FileNotFoundError(f"File not found in storage: {storage_id}")

        with open(file_path, "rb") as f:
            return f.read()

    def delete_file(self, storage_id: str) -> bool:
        """Delete file from storage."""
        file_path = Path(storage_id)
        if file_path.exists():
            file_path.unlink()
            return True
        return False

    def file_exists(self, storage_id: str) -> bool:
        """Check if file exists in storage."""
        return Path(storage_id).exists()


class GDriveStorageBackend(StorageBackend):
    """
    Google Drive storage backend. Files are encrypted (Fernet) before upload,
    so they're unreadable if opened directly in Drive, and decrypted on read.
    Requires a one-time interactive OAuth consent — see setup_google_drive_auth.py.
    """

    _folder_id: Optional[str] = None  # cached per-process

    def __init__(self):
        from . import config
        self._config = config
        self._service = self._build_service()

    def _build_service(self):
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build

        config = self._config
        if not config.GOOGLE_TOKEN_PATH.exists():
            raise RuntimeError(
                "Google Drive not authorized yet — run `python setup_google_drive_auth.py` "
                "once to grant access (see backend/data/google_token.json)."
            )

        creds = Credentials.from_authorized_user_file(
            str(config.GOOGLE_TOKEN_PATH), config.GOOGLE_DRIVE_SCOPES
        )
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            config.GOOGLE_TOKEN_PATH.write_text(creds.to_json())

        return build("drive", "v3", credentials=creds)

    def _folder(self) -> str:
        if GDriveStorageBackend._folder_id:
            return GDriveStorageBackend._folder_id

        name = self._config.GOOGLE_DRIVE_FOLDER_NAME
        query = (
            f"name = '{name}' and mimeType = 'application/vnd.google-apps.folder' "
            "and trashed = false"
        )
        results = self._service.files().list(q=query, fields="files(id)").execute()
        files = results.get("files", [])
        if files:
            folder_id = files[0]["id"]
        else:
            folder = self._service.files().create(
                body={"name": name, "mimeType": "application/vnd.google-apps.folder"},
                fields="id",
            ).execute()
            folder_id = folder["id"]

        GDriveStorageBackend._folder_id = folder_id
        return folder_id

    def save_file(self, file_path: str, file_name: str) -> str:
        from googleapiclient.http import MediaIoBaseUpload
        import io
        from .encryption import encrypt_bytes

        source = Path(file_path)
        if not source.exists():
            raise FileNotFoundError(f"Source file not found: {file_path}")

        encrypted = encrypt_bytes(source.read_bytes())
        media = MediaIoBaseUpload(io.BytesIO(encrypted), mimetype="application/octet-stream")
        uploaded = self._service.files().create(
            body={"name": file_name, "parents": [self._folder()]},
            media_body=media,
            fields="id",
        ).execute()

        return f"gdrive:{uploaded['id']}"

    def get_file(self, storage_id: str) -> bytes:
        import io
        from googleapiclient.http import MediaIoBaseDownload
        from .encryption import decrypt_bytes

        file_id = storage_id.removeprefix("gdrive:")
        request = self._service.files().get_media(fileId=file_id)
        buffer = io.BytesIO()
        downloader = MediaIoBaseDownload(buffer, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()

        return decrypt_bytes(buffer.getvalue())

    def delete_file(self, storage_id: str) -> bool:
        from googleapiclient.errors import HttpError

        file_id = storage_id.removeprefix("gdrive:")
        try:
            self._service.files().delete(fileId=file_id).execute()
            return True
        except HttpError as exc:
            if exc.resp.status == 404:
                return False
            raise

    def file_exists(self, storage_id: str) -> bool:
        from googleapiclient.errors import HttpError

        file_id = storage_id.removeprefix("gdrive:")
        try:
            self._service.files().get(fileId=file_id, fields="id").execute()
            return True
        except HttpError as exc:
            if exc.resp.status == 404:
                return False
            raise


def get_storage_backend() -> StorageBackend:
    """
    Factory function for where NEW files get written.
    Reads STORAGE_BACKEND env var (default: 'local').
    """
    backend_type = os.getenv("STORAGE_BACKEND", "local").lower()

    if backend_type == "local":
        return LocalStorageBackend()
    elif backend_type == "gdrive":
        return GDriveStorageBackend()
    else:
        raise ValueError(f"Unknown storage backend: {backend_type}")


def get_storage_backend_for_id(storage_id: str) -> StorageBackend:
    """
    Dispatch for READING an existing file, based on how it's referenced —
    so old local-path documents keep working even after switching new
    uploads over to Google Drive.
    """
    if storage_id.startswith("gdrive:"):
        return GDriveStorageBackend()
    return LocalStorageBackend()
