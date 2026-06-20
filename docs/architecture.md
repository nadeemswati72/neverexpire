# NeverExpire V2 — Architecture

## Data Model (inherited from V1, unchanged)
- **User** — login credentials, linked to one Person
- **Person** — family member (name, DOB, nationality, photo)
- **Document** — expiry-tracked record (type, expiry_date, issue_date, holder, number, notes, status)
- **DocumentFile** — uploaded file + watermarked copy paths
- **DocumentType** — configurable types (Passport, Visa, DL, Insurance, etc.)
- **Reminder** — scheduled notification per document
- **ExtractionRun** — AI extraction audit trail

## API Contract (to be built in Phase 0-1)
Base URL: `http://localhost:5000/api/v1`

All responses: `{ "data": <payload>, "error": null }` or `{ "data": null, "error": "<message>" }`

Auth: Bearer JWT in `Authorization` header.

### Planned Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Returns JWT |
| POST | /auth/register | New user |
| GET | /auth/me | Current user profile |
| GET | /documents | List documents (filterable) |
| POST | /documents | Create document |
| GET | /documents/:id | Document detail |
| PUT | /documents/:id | Update document |
| DELETE | /documents/:id | Delete document |
| POST | /documents/:id/upload | Upload file + trigger extraction |
| GET | /family | List family members |
| POST | /family | Add family member |
| GET | /family/:id | Person detail |
| PUT | /family/:id | Update person |
| DELETE | /family/:id | Remove person |
| GET | /dashboard/summary | Health summary counts |
| GET | /document-types | List all document types |

## Status Logic
- **expired** — expiry_date < today
- **expiring_soon** — expiry_date within 90 days
- **valid** — expiry_date >= today + 90 days
- **no_expiry** — no expiry_date set

## File Storage
- Uploads: `backend/data/uploads/<user_id>/<document_id>/`
- Watermarked copies: same folder, `*_wm.<ext>`
- Avatars: `backend/data/avatars/`
