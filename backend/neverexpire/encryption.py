"""App-wide symmetric encryption for files stored outside our own disk (Google Drive)."""
from cryptography.fernet import Fernet

from . import config


def _fernet() -> Fernet:
    if not config.ENCRYPTION_KEY:
        raise RuntimeError("ENCRYPTION_KEY not configured — set it in backend/.env")
    return Fernet(config.ENCRYPTION_KEY.encode())


def encrypt_bytes(data: bytes) -> bytes:
    return _fernet().encrypt(data)


def decrypt_bytes(data: bytes) -> bytes:
    return _fernet().decrypt(data)
