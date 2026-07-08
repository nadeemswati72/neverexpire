---
description: Review Flask backend routes for REST conventions, JWT auth, input validation, and security
---

# Review API

Review Flask backend route files for correctness, security, and project conventions.

## What to check

### REST conventions
- Routes use correct HTTP verbs: GET for reads, POST for creates, PUT/PATCH for updates, DELETE for deletes
- URL structure follows `/api/v1/<resource>/<id>` pattern
- All responses use the standard envelope: `{ "data": ..., "error": null }` or `{ "data": null, "error": "message" }`
- HTTP status codes are correct: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorised, 404 Not Found, 500 Server Error

### Authentication
- Protected routes use `@jwt_required` decorator from `neverexpire/web/jwt_utils.py`
- Routes read `g.current_user_id` — never trust user ID from request body
- Login endpoint (`POST /api/v1/auth/login`) is the only route without `@jwt_required`

### Input validation
- User-supplied strings are validated (not empty, within length limits) before hitting the DB
- File uploads check MIME type and extension before saving
- No raw SQL — all DB access goes through `db/repository.py` or `db/queries.py`

### Error handling
- Exceptions are caught at the route level and returned as `{ "data": null, "error": "..." }`
- No stack traces exposed to the client
- 404 returned when a resource is not found AND belongs to a different user (prevents enumeration)

### Project-specific rules
- All blueprint routes are registered in `routes/__init__.py`
- DB access only through `get_session()` context manager from `db/session.py`
- AI extraction uses `EXTRACTION_MODEL` from `config.py` — never hardcode a model name
- `REMINDER_DAYS_THRESHOLD = 90` in `config.py` must stay in sync with `mobile/src/utils/dateUtils.js`

## Steps

1. Ask the user which file(s) to review, or read the diff of the current branch.
2. Check each item in the list above.
3. Report findings grouped by: Critical (security/data bug) → Correctness → Convention.
4. Do not rewrite code unless the user asks — report findings only.
