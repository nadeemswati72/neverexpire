import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise RuntimeError(
        "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key."
    )

EXTRACTION_MODEL = "claude-haiku-4-5"

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "neverexpire.db"
UPLOAD_DIR = DATA_DIR / "uploads"
STAGING_DIR = UPLOAD_DIR / "staging"

STATIC_DIR = BASE_DIR / "neverexpire" / "web" / "static"
AVATAR_DIR = STATIC_DIR / "avatars"

REMINDER_DAYS_THRESHOLD = 30

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-insecure-secret-key")
