# NeverExpire — Solution Architecture & Data Model v1.0

## 1. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | Flask + SQLAlchemy | REST API, JWT-authenticated, `{data, error}` response envelope |
| Web Client | React + Vite + TypeScript | Glassmorphic design system, deployed to Vercel |
| Mobile Client | React Native (Expo SDK 54) | Same backend/account system as web, deployed via Expo Go for pilot testing |
| Database | SQLite (dev/PoC) → PostgreSQL (production path) | Schema designed to migrate without structural rework |
| AI Extraction | Anthropic Claude (`claude-haiku-4-5`) | Document photo → structured fields |
| Email | Gmail SMTP (App Password) | Reminder digests; mock-inbox mirror for in-app demo visibility |
| File Storage | Local disk + Google Drive (encrypted, Fernet) | New uploads land in encrypted Drive storage; existing local files untouched |
| Hosting | Vercel (web) + Railway (backend) | Production-style deployment for stakeholder demos |

## 2. High-Level Architecture

```
                    ┌─────────────────┐        ┌──────────────────┐
                    │   Web (Vercel)   │        │ Mobile (Expo Go)  │
                    │  React + Vite    │        │  React Native     │
                    └────────┬─────────┘        └─────────┬─────────┘
                             │        JWT Bearer            │
                             └──────────────┬───────────────┘
                                            │
                                  ┌─────────▼──────────┐
                                  │  Flask REST API     │
                                  │  (Railway)           │
                                  │  /api/v1/*           │
                                  └──┬───────┬──────┬───┘
                                     │       │      │
                    ┌────────────────┘   ┌───▼──┐  ┌▼──────────────┐
                    │                    │  DB   │  │ Anthropic API  │
             ┌──────▼──────┐             │(SQLite│  │ (extraction)   │
             │ Gmail SMTP   │             │/PgSQL)│  └────────────────┘
             │ (reminders)  │             └───────┘
             └──────────────┘
                    │
             ┌──────▼──────────┐
             │ Google Drive     │
             │ (encrypted files)│
             └──────────────────┘
```

## 3. Data Model

| Entity | Purpose |
|---|---|
| `User` | Login identity — email, password hash, JWT subject |
| `Person` | Family member — name, relation type, DOB, photo |
| `Document` | Expiry-tracked record — type, title, dates, number, authority, holder, notes, status |
| `DocumentFile` | Uploaded file reference — local path or `gdrive:` reference |
| `DocumentType` | Configurable type catalogue (Passport, Visa, Emirates ID, Driving License, Insurance, Certificate, ...) |
| `DocumentShare` | Single-document share — recipient, permission level, watermark choice, expiry, invite state |
| `PersonShareGrant` | Bulk share of all of a person's documents, with optional auto-include of future documents |
| `DocumentAccessLog` | Every view/download of a shared document — who, when, action, whether watermarked |
| `ReminderRule` | Global threshold configuration (90/30/7/1 days before expiry) |
| `DocumentReminder` | One per (document, rule) pair — due date, status (pending/sent/dismissed) |
| `Notification` | In-app bell entries — sharing activity, read/unread |
| `ExtractionRun` | AI extraction audit — model used, confidence, linked document |

## 4. API Surface (representative)

| Area | Example Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| Documents | `GET/POST /documents`, `GET/PUT/DELETE /documents/:id`, `POST /documents/:id/files` |
| Family | `GET/POST /family`, `GET/PUT/DELETE /family/:id`, `POST/GET/DELETE /family/:id/photo` |
| Dashboard | `GET /dashboard/summary` |
| Sharing | `POST /documents/:id/share`, `POST /persons/:id/share-all`, `DELETE /shares/:id`, `GET /sharing/incoming`, `GET /sharing/outgoing` |
| Files | `GET /files/:id` — serves watermarked or clean original depending on ownership + share settings |
| Reminders | `GET /reminders`, `PUT /reminders/:id/dismiss`, `POST /admin/run-reminder-check` |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read` |
| Mock Inbox | `GET /mock-inbox` — demo visibility into sharing + reminder emails |

## 5. Security & Trust Design

- **Ownership enforcement** — every endpoint checks `Person.user_id` against the authenticated caller before returning or mutating data; shared access is checked separately via `DocumentShare` / `PersonShareGrant`, never implicit.
- **Personalized watermarking** — the file-serving endpoint decides at request time, per viewer, whether to serve the clean original or a recipient-tagged watermarked copy. The owner's own document is only ever clean on an explicit download; their in-app preview stays watermarked as a screen-glance safeguard.
- **Access audit trail** — every non-owner view/download is logged with the actual watermark state that was served, so the owner's trust in a share is verifiable, not assumed.
- **JWT-scoped API** — every request is tied to a specific authenticated user; there is no session state shared across accounts.

## 6. Deployment Topology

- **Web**: Vercel project `neverexpire-poc`, framework Vite, `rootDirectory: web`, production branch tracked, deployment protection disabled for open stakeholder access.
- **Backend**: Railway service `neverexpire-backend`, Gunicorn + Flask, SQLite on ephemeral storage (by design for PoC — resets and reseeds on every deploy via `start.sh`).
- **CORS**: explicit origin allowlist covering the Vercel production domain and local dev hosts.
