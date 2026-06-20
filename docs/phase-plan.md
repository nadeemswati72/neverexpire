# NeverExpire V2 — Sprint Plan

## Status Legend
- ✅ Done
- 🔄 In Progress
- ⬜ Not started

---

## Sprint 0 — Backend Foundation ✅ DONE
**Goal:** Flask REST API running, DB initialised, auth working, health check live.

| Task | Status |
|------|--------|
| Copy V1 backend, strip Jinja routes, keep core logic | ✅ |
| Create `requirements.txt`, venv, DB init + seed scripts | ✅ |
| Config module (`config.py`) with env var support | ✅ |
| Context-managed SQLAlchemy sessions (`get_session`) | ✅ |
| Flask app factory (`create_app`) with CORS | ✅ |
| JWT auth (`jwt_utils.py`) — login, register, /me | ✅ |
| `GET /api/v1/health` — version check endpoint | ✅ |
| Demo seed data — Alice (primary), Bob (spouse), Emma (child) | ✅ |
| `.env` with real Anthropic API key (gitignored) | ✅ |

---

## Sprint 1 — Core CRUD API ✅ DONE
**Goal:** All document and family endpoints working. AI extraction endpoints ready.

| Task | Status |
|------|--------|
| `GET /api/v1/document-types` — 12 types | ✅ |
| `GET /api/v1/family` — list with relation_type | ✅ |
| `POST /api/v1/family` — add member | ✅ |
| `GET/PUT/DELETE /api/v1/family/:id` | ✅ |
| `GET /api/v1/family/relation-types` | ✅ |
| `GET /api/v1/documents` — with status + person_id filters | ✅ |
| `POST /api/v1/documents` — manual create | ✅ |
| `GET/PUT/DELETE /api/v1/documents/:id` | ✅ |
| `POST /api/v1/documents/extract` — AI extraction preview (no save) | ✅ |
| `POST /api/v1/documents/upload-and-create` — upload + extract + save | ✅ |
| `GET /api/v1/dashboard/summary` — counts + 5 upcoming | ✅ |
| `serializers.py` — status logic, days_remaining, brief/detail shapes | ✅ |
| Cross-user access denied (ownership check on all endpoints) | ✅ |
| `api-tester.html` — visual API test page | ✅ |

---

## Sprint 2 — Web Dashboard ✅ DONE
**Goal:** React + Vite web app — login + dashboard with real data, glassmorphic design.

| Task | Status |
|------|--------|
| React + Vite + TypeScript scaffold in `web/` | ✅ |
| Tailwind CSS + design system CSS variables | ✅ |
| Vite proxy `/api` → `http://localhost:5000` | ✅ |
| `api.ts` — axios instance with JWT interceptor + auto-logout on 401 | ✅ |
| `auth.ts` — login, register, logout, fetchMe | ✅ |
| Login page — glassmorphic card, teal branding, error handling | ✅ |
| Protected route — redirect to /login if no token | ✅ |
| Sidebar — brand, navigation, family member filter | ✅ |
| Stat cards — Total / Expired / Expiring Soon / Valid | ✅ |
| Hero dark card — attention documents with status + countdown | ✅ |
| All documents table — filterable by person (sidebar click) | ✅ |
| Family member cards — per-member doc counts + status pills | ✅ |
| Valid documents panel | ✅ |
| Family member filter working (sidebar click → filtered view) | ✅ |

---

## Sprint 3 — Web Documents ✅ DONE
**Goal:** Document list page, document detail, add document with AI extraction.

| Task | Status |
|------|--------|
| Documents list page (`/documents`) with search + status filter | ✅ |
| Document detail page (`/documents/:id`) with dark hero card | ✅ |
| Add document — manual entry form | ✅ |
| Add document — AI extraction flow (upload → animation → preview → confirm) | ✅ |
| AI extraction animation — scan line, step dots, progress bar | ✅ |
| Sidebar on all pages (detail + add) | ✅ |
| Dates in both header card AND Document Details section | ✅ |
| Watermarked file preview (fetch+blob, authenticated) | ✅ |
| Tiled watermark pattern matching reference sample | ✅ |
| Dashboard rows clickable → navigate to document detail | ✅ |
| `GET /api/v1/files/:id` — watermarked file serve endpoint | ✅ |
| family list API returns relation_type per member | ✅ |

---

## Sprint 4 — Web Family + Complete Web MVP 🔄 IN PROGRESS
**Goal:** Family management UI, complete web MVP ready for user testing.

| Task | Status |
|------|--------|
| Family page (`/family`) — list + add + edit + delete | ⬜ |
| Empty states and loading skeletons | ⬜ |
| Responsive layout (tablet support) | ⬜ |
| Web MVP user testing with demo data | ⬜ |

---

## Sprint 5 — React Native Mobile ⬜ NOT STARTED
**Goal:** Expo app — auth, dashboard, documents list.

| Task | Status |
|------|--------|
| Fresh Expo SDK 52+ project in `mobile/` | ⬜ |
| Auth screens (login) | ⬜ |
| Mobile dashboard (stat cards + attention list) | ⬜ |
| Documents list screen | ⬜ |
| Camera upload + AI extraction flow | ⬜ |

---

## Sprint 6 — Mobile Family + Reminders + Deploy ⬜ NOT STARTED
**Goal:** Complete mobile MVP, reminders, CI/CD, deploy.

| Task | Status |
|------|--------|
| Family management screens | ⬜ |
| Push notification reminders | ⬜ |
| GitHub Actions CI (lint + test) | ⬜ |
| Backend deploy (Railway / Render) | ⬜ |
| Web deploy (Vercel / Netlify) | ⬜ |
| Expo build (TestFlight + Play Console internal) | ⬜ |

---

## Jira
- Site: neverexpire.atlassian.net
- V2 Project: TBD (new board — login issue pending resolution)
- V1 Project: SCRUM (do not add V2 tickets here)

## Key Decisions
- Sprint = ~1 week
- Web first, then mobile
- AI extraction: MVP must-have (already working in backend)
- Auth: Email + password only (no social login for V2)
- Backend URL: `http://localhost:5000` (dev), TBD (prod)
