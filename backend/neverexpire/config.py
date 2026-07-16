import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

EXTRACTION_MODEL = "claude-sonnet-4-6"

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "neverexpire.db"

# When set (e.g. a Neon Postgres connection string), this is used instead of
# the local SQLite file — this is what makes real user data survive a
# redeploy, unlike the ephemeral SQLite path above. Some providers hand out
# the old `postgres://` scheme, which SQLAlchemy 1.4+ rejects; normalize it.
_raw_database_url = os.getenv("DATABASE_URL", "")
DATABASE_URL = (
    _raw_database_url.replace("postgres://", "postgresql://", 1)
    if _raw_database_url.startswith("postgres://")
    else _raw_database_url
)

UPLOAD_DIR = DATA_DIR / "uploads"
STAGING_DIR = UPLOAD_DIR / "staging"
AVATAR_DIR = DATA_DIR / "avatars"

REMINDER_DAYS_THRESHOLD = 90

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-insecure-secret-key-change-in-prod")
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:8081,https://neverexpire-poc.vercel.app"
).split(",")

# Used to build links inside emails (e.g. the password reset link).
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Gmail SMTP (PoC email reminders) — App Password, not the account password.
GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS", "")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")

# PoC safety: demo accounts use fake @neverexpire.test addresses that can't
# receive real mail, so every reminder email is redirected here instead.
REMINDER_TEST_RECIPIENT = GMAIL_ADDRESS

# Google Drive storage (new uploads only — existing local files are untouched).
STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "local")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")
GOOGLE_CLIENT_SECRET_PATH = DATA_DIR / "google_client_secret.json"
GOOGLE_TOKEN_PATH = DATA_DIR / "google_token.json"
GOOGLE_DRIVE_FOLDER_NAME = "NeverExpire Documents"
GOOGLE_DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.file"]
