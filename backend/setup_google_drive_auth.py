#!/usr/bin/env python3
"""
One-time interactive setup: grants NeverExpire access to your Google Drive.

Run this once locally:
    python setup_google_drive_auth.py

It opens your browser, you log in and click Allow, and the resulting token
(including a refresh token) is saved to backend/data/google_token.json so
the backend never needs your browser again.

Requires backend/data/google_client_secret.json (downloaded from the
Google Cloud Console — see docs/phase-plan.md for the setup steps).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from google_auth_oauthlib.flow import InstalledAppFlow

from neverexpire import config


def main():
    if not config.GOOGLE_CLIENT_SECRET_PATH.exists():
        print(f"Missing {config.GOOGLE_CLIENT_SECRET_PATH}")
        print("Download it from Google Cloud Console → APIs & Services → Credentials")
        print("and save it at that exact path first.")
        sys.exit(1)

    flow = InstalledAppFlow.from_client_secrets_file(
        str(config.GOOGLE_CLIENT_SECRET_PATH), config.GOOGLE_DRIVE_SCOPES
    )
    creds = flow.run_local_server(port=0)

    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    config.GOOGLE_TOKEN_PATH.write_text(creds.to_json())

    print(f"\nSuccess! Token saved to {config.GOOGLE_TOKEN_PATH}")
    print("The backend can now upload/read encrypted files in your Google Drive.")


if __name__ == "__main__":
    main()
