---
description: Activate Python venv and start the Flask development server on port 5000
---

# Start Backend

Activate the Python virtual environment and start the Flask development server.

## Steps

1. Run these commands in PowerShell:
```powershell
cd C:\Users\Hp\projects\NeverExpire-PoC\backend
.\venv\Scripts\Activate.ps1
flask --app neverexpire run --debug
```

2. Confirm the server is running on **http://localhost:5000**

3. Remind the user:
   - `ANTHROPIC_API_KEY` must be set in the environment for AI extraction to work
   - `SECRET_KEY` has a dev default in `config.py` — no action needed for local dev
   - The SQLite DB is at `backend/data/neverexpire.db`
   - Railway redeploy is **BLOCKED** during PoC — do not push schema changes that require DB migration without user confirmation

## Common issues

- If `venv` activation fails: check that `venv/` exists; if missing, run `python -m venv venv` then `pip install -r requirements.txt`
- If port 5000 is in use: `netstat -ano | findstr :5000` to find the PID, then kill it
- If DB is missing: run `python -m neverexpire.db.init_db` then `python -m neverexpire.db.seed_demo`
