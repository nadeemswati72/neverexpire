# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# NeverExpire V2 — Claude Code Project Bible

## What this project is
Family document expiry tracker. Users log passports, visas, driving licenses, insurance, certificates, etc., track expiry dates, and get reminders. UAE-first market.

This is **Version 2** — a full redesign using glassmorphic UI (see design files in `docs/designs/`), built on the V1 Flask backend evolved into a pure REST API.

## Repository
- **GitHub**: `git@github.com:nadeemswati72/neverexpire.git`
- **Branch**: `v2-poc` (tracks `origin/main`)
- **V1 source** (reference only, do not modify): `C:\Users\Hp\NeverExpire\`

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Backend | Flask + SQLAlchemy | Evolved from V1; SQLite for dev, Postgres-ready |
| Mobile | React Native (Expo SDK 52+) | Fresh project in `mobile/` |
| Web | React + Vite | Fresh project in `web/` |
| AI extraction | Anthropic API (claude-sonnet-4-6) | Already working in V1 |
| Auth | Flask-Login + JWT for API | V1 has session auth; V2 adds JWT for mobile/web clients |

## Project Structure
```
NeverExpire-PoC/
├── CLAUDE.md                   ← This file
├── .mcp.json                   ← MCP servers (atlassian, github, sqlite, playwright)
├── .claude/
│   └── settings.json           ← Tool permissions
├── memory/                     ← Claude persistent memory files
├── docs/
│   ├── architecture.md         ← Data model, API contract, decisions
│   ├── phase-plan.md           ← Phases + Jira epic mapping
│   └── designs/                ← .html design files (drop here per task)
├── backend/                    ← Flask REST API (evolved from V1)
│   ├── neverexpire/            ← Python package
│   ├── data/                   ← SQLite DB lives here
│   ├── requirements.txt
│   └── venv/                   ← Never commit
├── mobile/                     ← React Native (Expo) — fresh project
└── web/                        ← React + Vite — fresh project
```

## V1 Backend Reference
The original Flask app is at `C:\Users\Hp\NeverExpire\neverexpire\`. Key files:
- `db/models/` — SQLAlchemy models (User, Person, Document, DocumentFile, Reminder, etc.)
- `db/repository.py` — all CRUD operations
- `db/queries.py` — dashboard/document queries with status logic
- `extractor.py` — Anthropic API document extraction (working)
- `watermark.py` — Pillow watermarking
- `web/routes/api.py` — thin existing API (to be expanded)
- `data/neverexpire.db` — live SQLite DB with seeded data

## MCP Servers
- **atlassian** — Jira at `neverexpire.atlassian.net`. V2 Jira project: TBD (new board). Auth via browser OAuth.
- **github** — Requires `GITHUB_PERSONAL_ACCESS_TOKEN` env var set before session.
- **sqlite** — Points to `backend/data/neverexpire.db` once DB is initialized.
- **playwright** — Browser automation for E2E tests.

## Key Decisions
- Backend is a **pure REST API** — no Jinja templates in V2
- Mobile and Web are **separate clients** consuming the same API
- Auth: **JWT tokens** for API clients (mobile + web)
- Database: **SQLite for dev**, schema designed to migrate to Postgres
- AI extraction: **Anthropic API** (`claude-sonnet-4-6`) — already proven in V1

## Design Files
Both glassmorphic design specs live in `docs/designs/`:
- `NeverExpire Mobile Dashboard Standalone.html` — mobile reference
- `NeverExpire Web Dashboard Standalone.html` — web reference

Open in a browser to interact with them.

## Development Commands

### Backend (Flask)
```powershell
cd backend
# Activate venv (Windows)
.\venv\Scripts\Activate.ps1
# Install deps
pip install -r requirements.txt
# Init/seed DB (first time or after schema changes)
python -m neverexpire.db.init_db
python -m neverexpire.db.seed_demo
# Run dev server (port 5000)
flask --app neverexpire run --debug
```
Env vars needed: `ANTHROPIC_API_KEY`, `SECRET_KEY` (optional in dev — defaults exist in `config.py`).

### Web (React + Vite)
```powershell
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run lint       # eslint .
```
Set `VITE_API_URL=http://localhost:5000` or use the Vite proxy. JWT token stored in `localStorage` as `ne_token`.

### Mobile (Expo)
```powershell
cd mobile
npx expo start          # opens Expo DevTools
npx expo start --android
npx expo start --ios
```
No native build needed — managed Expo workflow. Dependencies already installed (`node_modules/` present).

## Runtime Architecture

### Auth flow
Both web and mobile use JWT. Login → `POST /api/v1/auth/login` → `{ data: { token, user } }`. Token attached via `Authorization: Bearer <token>` on every subsequent request. `@jwt_required` decorator in `backend/neverexpire/web/jwt_utils.py` validates and sets `g.current_user_id`.

### Backend layers
- `neverexpire/web/routes/` — Flask blueprints, thin HTTP layer only; all blueprints registered in `routes/__init__.py`
- `neverexpire/db/repository.py` — all CRUD; `db/queries.py` — dashboard/status aggregation
- `neverexpire/db/session.py` — `get_session()` context manager (SQLAlchemy session lifecycle)
- `neverexpire/pipeline.py` + `extractor.py` — AI extraction pipeline using `claude-haiku-4-5` (set in `config.py` as `EXTRACTION_MODEL`)
- `neverexpire/config.py` — all config; `REMINDER_DAYS_THRESHOLD = 90` (must stay in sync with mobile's `EXPIRING_SOON_THRESHOLD_DAYS` in `src/utils/dateUtils.js`)

### Web layers (`web/src/`)
- `api.ts` — axios instance; auto-attaches Bearer token; redirects to `/login` on 401; defines all shared TypeScript types (`User`, `Person`, `DocumentBrief`, `DashboardSummary`, etc.)
- `apiBase.ts` — base URL resolution (`VITE_API_URL` or `/api/v1`)
- `auth.ts` — `isLoggedIn()` check used by `RequireAuth` guard in `App.tsx`
- `pages/` — route-level components; `components/` — reusable UI

### Mobile architecture
See `mobile/CLAUDE.md` for the full guide. Key points:
- Demo-mode only: all data in AsyncStorage, seeded from `src/data/mock*.js`; no backend calls yet
- 3-layer rule: screens → context hooks → services → AsyncStorage (never skip layers)
- All colors/spacing from `src/constants/theme.js`; all route strings from `src/navigation/routes.js`

## Conventions
- Branch naming: `sprint<N>-<short-description>` (current: `sprint5-mobile`)
- Commit style: imperative, present tense ("Add JWT auth endpoint")
- No Jinja templates — all UI is React/React Native
- All API responses: `{ "data": ..., "error": null }` or `{ "data": null, "error": "message" }`
- Tests: unit tests per task, E2E per phase end
