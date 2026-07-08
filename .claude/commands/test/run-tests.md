---
description: Run the backend pytest suite and report failures with root cause analysis
---

# Run Tests

Run the backend test suite and report results.

## Steps

1. Run backend tests:
```powershell
cd C:\Users\Hp\projects\NeverExpire-PoC\backend
.\venv\Scripts\Activate.ps1
pytest
```

2. Report:
   - Total tests: passed / failed / skipped
   - Any failing tests: show the test name, the assertion that failed, and the line number
   - If all pass: confirm "All tests passing"

3. If any test fails:
   - Read the failing test file to understand what it covers
   - Read the source file it tests
   - Explain the root cause before suggesting a fix
   - Do not modify the test to make it pass — fix the source code

## What the tests cover

- JWT authentication (`test_auth.py`)
- Document CRUD endpoints (`test_documents.py`)
- Person management (`test_persons.py`)
- AI extraction pipeline (`test_extraction.py`)
- Dashboard queries (`test_dashboard.py`)
- Status logic: expired / expiring_soon / valid / no_expiry

## Running specific tests

```powershell
pytest tests/test_auth.py -v          # one file
pytest -k "test_login" -v             # by test name pattern
pytest --tb=short                     # shorter tracebacks
```

## Notes

- Tests run against the SQLite DB at `backend/data/neverexpire.db`
- If the DB schema has changed since last run, re-run `python -m neverexpire.db.init_db` first
- Do not run tests against the Railway production DB
