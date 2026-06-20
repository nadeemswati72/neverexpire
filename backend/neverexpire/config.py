import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise RuntimeError("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.")

EXTRACTION_MODEL = "claude-haiku-4-5"

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "neverexpire.db"
UPLOAD_DIR = DATA_DIR / "uploads"
STAGING_DIR = UPLOAD_DIR / "staging"
AVATAR_DIR = DATA_DIR / "avatars"

REMINDER_DAYS_THRESHOLD = 90

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-insecure-secret-key-change-in-prod")
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8081").split(",")
