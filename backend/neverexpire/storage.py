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


def get_storage_backend() -> StorageBackend:
    """
    Factory function to get the appropriate storage backend.
    Reads STORAGE_BACKEND env var (default: 'local').
    """
    backend_type = os.getenv("STORAGE_BACKEND", "local").lower()

    if backend_type == "local":
        return LocalStorageBackend()
    elif backend_type == "gdrive":
        # TODO: Implement Google Drive backend
        raise NotImplementedError("Google Drive backend not yet implemented")
    else:
        raise ValueError(f"Unknown storage backend: {backend_type}")
