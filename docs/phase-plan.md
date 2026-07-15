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

## Sprint 4 — Web Family + Complete Web MVP ✅ DONE
**Goal:** Family management UI, complete web MVP ready for user testing.

| Task | Status |
|------|--------|
| Family page (`/family`) — member cards with initials avatar + relation badge | ✅ |
| Add member modal — name, relation type, DOB | ✅ |
| Edit member modal — name, relation type, DOB (backend updates relationship record) | ✅ |
| Delete member — confirmation dialog, soft-delete (documents preserved) | ✅ |
| 3-dot menu per card — Edit / Remove / Add Document | ✅ |
| Menu closes on outside click | ✅ |
| Doc stat tiles clickable → filtered documents for that person + status | ✅ |
| Add Document from family card pre-selects the person | ✅ |
| Dark hero summary strip — total members + all-docs counts | ✅ |
| Family nav item active in sidebar (removed Soon badge) | ✅ |

---

## Sprint 5 — React Native Mobile ✅ DONE (device testing in progress)
**Branch:** `sprint5-mobile` — NOT yet merged to v2-poc
**Goal:** Expo SDK 54 app with auth, dashboard, documents, family.

| Task | Status |
|------|--------|
| Expo SDK 54 (React 19.1, RN 0.81.5, iOS safe area) | ✅ |
| LoginScreen + RegisterScreen + Forgot password alert | ✅ |
| Dashboard: profile photo, stat tiles (tap→filter), donut chart, all-attention scroll | ✅ |
| Dashboard legend: 2-col grid with counts | ✅ |
| Documents list: search, status filter pills, person filter, FAB | ✅ |
| Document detail: dark hero card, dates, watermarked file preview | ✅ |
| Add Document: AI extraction + camera/gallery, animated Claude orb | ✅ |
| Add Document: ModalPicker (doc type), DatePickerField (iOS Modal pattern) | ✅ |
| Family: member cards, avatar + photo upload (tap to change), add/remove | ✅ |
| Family Docs button filters documents by that person | ✅ |
| Photo picker: fixed deprecated MediaTypeOptions → ['images'] array | ✅ |
| Web: /register page + Forgot password link + Create account on login | ✅ |

**Still to verify on device:**
- Document photo preview in detail screen
- AI extraction end-to-end on mobile (camera → extract → save)
- Register flow (web + mobile)
- Android device testing

---

## PoC Feedback Round — Web (branch `PoC-FeedBack`) ✅ DONE
**Goal:** Address CIO feedback from PoC round 1 — document sharing, storage safety, watermark fix. Kept on a separate branch from `v2-poc` at Nadeem's request so the base MVP isn't disturbed. Committed to `PoC-FeedBack`; **not deployed to Railway** (redeploy blocked during PoC).

| Task | Status |
|------|--------|
| Email-based document sharing (read / edit / download permissions) | ✅ |
| Bulk share all of a person's documents, with optional future-doc auto-include | ✅ |
| Revoke sharing anytime; re-share allowed for `edit`-permission holders | ✅ |
| Share expiry (1 / 7 / 30 days or no expiry), auto-revokes access | ✅ |
| Mock email service (console + `data/mock_emails.log`) for share/revoke notices | ✅ |
| Mock email inbox viewer page (`/mock-inbox`) for live demo | ✅ |
| In-app notification bell (unread badge, dropdown, mark read/all-read) | ✅ |
| "Shared by X · PERMISSION" badges in the documents list | ✅ |
| Access audit trail — who viewed/downloaded a shared document, shown on owner's document page | ✅ |
| Personalized watermark for shared docs (recipient email + date baked in, traceable if leaked) | ✅ |
| Manual entry: optional picture attach without AI extraction | ✅ |
| "Add Picture" button on document detail page (owner only) | ✅ |
| Permission-correct action buttons (Delete=owner only; Edit/Share=`edit`; Download=`download`/`edit`) | ✅ |
| Fixed: notification dropdown clipped behind Dashboard cards (z-index/stacking) — now uses a React portal | ✅ |
| Fixed: Safari `-webkit-backdrop-filter` prefix missing on ~29 glass panels across 12 files | ✅ |
| Email reminders via Gmail SMTP (App Password) — 90/30/7/1 day thresholds, daily APScheduler job + manual trigger, single digest email routed to Nadeem's real Gmail for PoC | ✅ See `backend/reminder_service.py`, `reminder_email.py` |
| Google Drive storage + encryption for new document uploads (existing local files untouched) | ✅ OAuth2 (personal Google account) + Fernet encryption. Verified: uploads land in Drive encrypted (raw bytes unreadable, not a valid JPEG), download+decrypt+watermark round-trips correctly. See `backend/storage.py` (`GDriveStorageBackend`), `setup_google_drive_auth.py`. |
| Screenshot / OS-level capture prevention for read-only shares | ⏸ Deferred — not technically preventable on web; watermark is the real mitigation |
| Mobile responsiveness (sidebar breaks below ~480px) | 🔴 Found, not fixed |
| Realistic multi-family demo dataset for management presentation | ✅ Al Rashid family (5, Ahmed+Fatima logins) + Khan family (6, Imran+Sara logins), 49 documents with generated specimen images, generated avatars, 10 sharing scenarios covering every permission/expiry/invite/revoke/cross-family case. See `backend/seed_rich_demo.py`. |
| `Domestic Help` family relation type | ✅ Done — additive seed row, no migration needed |

---

## PoC Feedback Round 2 — Mobile Wired to Real Backend (branch `PoC-FeedBack`) ✅ DONE
**Goal:** Bring the Expo mobile app from demo-mode (AsyncStorage) to full parity with the web app on the shared Flask backend, verified on Nadeem's iPhone via Expo Go.

| Task | Status |
|------|--------|
| Upgrade Expo SDK 51 → 54 (React 19, RN 0.81, Reanimated 4 + worklets, React Navigation v7) | ✅ Required by current Expo Go; v6 drawer crashed with Reanimated 4 |
| JWT ApiService + Auth/Family/Document/Extraction services on `/api/v1` | ✅ AsyncStorage demo dataset removed |
| Flask bound to `0.0.0.0` so phones on the Wi-Fi can reach it | ✅ `flask --app run run --host=0.0.0.0` |
| AI extraction from camera/gallery on device | ✅ Verified on iPhone (passport scan → pre-filled form) |
| Dashboard: status donut chart + family member filter chips | ✅ react-native-svg |
| Family member documents screen: per-member status donut | ✅ |
| Document details: full (uncropped) watermarked picture | ✅ Backend now sends `files` in the list payload (`document_brief`) |
| MyDocuments filter chip strip height bug | ✅ `flexGrow: 0` fix |
| Sharing: ShareModal (permission + expiry), share-all per member, revoke | ✅ |
| Sharing screen: Shared with Me / Shared by Me tabs | ✅ |
| Access history on owned documents (15s poll) | ✅ |
| Notifications: backend sharing activity + expiry reminders, live bell badge | ✅ |
| Register screen (POST /auth/register) linked from login | ✅ |
| Family member photo avatars (authenticated endpoint) | ✅ |
| Testing guide refreshed (in-app screen + `docs/testing-guide.html`) | ✅ |

**Still open (mobile):** Change Password / Settings toggles are UI-only; document download/save-to-phone not built; Android device untested.

---

## Sprint 6 — Mobile Polish + Deploy ⬜ NOT STARTED
**Goal:** Merge mobile, push notifications, TestFlight/Play Store build.

| Task | Status |
|------|--------|
| Merge sprint5-mobile → v2-poc after testing complete | ⬜ |
| Push notification reminders (APNs + FCM) | ⬜ |
| EID extraction improvement (prompt for UAE docs) | ⬜ |
| Relation types: Mother, Father, Employee (needs Railway redeploy) | ⬜ |
| Expo build — TestFlight (iOS) + Play Console internal (Android) | ⬜ |
| GitHub Actions CI | ⬜ |

---

## Backlog — Deferred / Open Items
*All discussed items recorded here regardless of accept/reject status.*

### Deferred (do not implement during PoC phase)

| Item | Status | Notes |
|------|--------|-------|
| **Railway redeploy** | 🚫 Blocked | Do NOT redeploy Railway until PoC phase is closed. Demo data must be preserved. All backend changes requiring redeploy are blocked. |
| **Relation types: Mother, Father, Employee** | ⏸ Deferred | Requires Railway redeploy. Proposed: MOTHER 👩, FATHER 👨, EMPLOYEE 💼. Keep PARENT in DB, hide in UI. Migrate existing PARENT→FATHER. |
| **EID extraction prompt improvement** | ⏸ Deferred | Discussed, not yet implemented. See EID Analysis section below. |
| **Model revert to haiku** | ⏸ Blocked | Requested but blocked by Railway redeploy freeze. Currently on claude-sonnet-4-6. |
| **Screenshot / OS-level capture prevention** | ⏸ Deferred | Not technically possible to block OS-level screenshots (Print Screen etc.) from a website. Browser-level deterrents (right-click, devtools keys, text-select) are in place; personalized watermark is the real mitigation — see PoC Feedback Round section. |

**Done, formerly deferred:** Email reminders (Gmail SMTP) and Google Drive storage + encryption — see PoC Feedback Round section above.

### Open Items — Under Discussion

| Item | Status | Notes |
|------|--------|-------|
| **E2E Testing Plan** | 📋 Created | See `docs/testing-plan.md`. Covers web, iOS, Android, API. Review before Sprint 6 merge. |
| **Document photo upload (manual entry)** | ✅ Done (PoC-FeedBack) | Manual entry now has an optional picture attach; new `POST /documents/:id/files` endpoint, no AI extraction. |
| **Web mobile responsiveness** | 🔴 Confirmed broken | Sidebar is a fixed 240px on all viewports — on a 375px phone it eats 64% of the screen width, leaving ~135px for content. Needs a collapsible/hamburger sidebar below ~768px. Not yet fixed. |
| **App icon + splash screen** | 💬 Discussed | Currently using clock emoji. Proper PNG icons needed before App Store submission. |
| **Privacy policy URL** | 💬 Discussed | Required by App Store + Play Store before submission. |
| **Database persistence for production** | 💬 Discussed | Railway SQLite is ephemeral (data lost on redeploy). Need persistent volume or PostgreSQL before production launch. Fine for PoC. |
| **Multiple account cache on device** | 💬 Discussed | If user signs out and in as different user, cached photos may show wrong data. Needs investigation. |
| **Mobile member-photo upload UI** | ⏸ Deferred | Backend (`POST /api/v1/family/:id/photo`) and web already support this; mobile's `Avatar` displays a photo when one exists but has no picker UI to add/change one. Nadeem asked to backlog rather than build now. |
| **Offline behaviour** | 💬 Discussed | No offline handling. Friendly error message at minimum. |
| **Navigation architecture review** | 💬 Discussed | Before adding Budgeting/Games features, review mobile navigation (bottom tabs vs stack). |
| **MRZ parsing for passports** | 💬 Discussed | Passports have MRZ (2 lines of OCR-B at bottom). Python `mrz` library could parse reliably. Emirates ID does NOT have MRZ — has PDF417 barcode on back instead. |
| **Web "Reminders" page (un-stub the "Soon" nav item)** | ⏸ Parked for demo | Backend `POST /api/v1/admin/run-reminder-check` already exists ("for demoing the email flow on demand" per its own docstring); APScheduler job, email templates, Gmail SMTP all done. Just needs a page + button. Parked 2026-07-15 — Nadeem chose the compliance-score widget and PDF export instead for the management demo. |
| **Live Google Drive storage proof for demo** | ⏸ Parked for demo | GDriveStorageBackend + encryption already implemented and OAuth-consented earlier this session. Nothing to build — just confirm the OAuth token is still valid and add it to the demo script. Parked 2026-07-15 alongside the Reminders page. |

### Future Features (noted, not planned)

| Feature | Notes |
|---------|-------|
| Budgeting | Separate module, own DB tables, new nav section |
| Expense Tracking | Could integrate with Budgeting |
| Daily Puzzle Games | Completely different domain — review architecture impact before committing |
| Multiple logins per family | Primary + family member accounts with access levels |
| NFC chip reading for Emirates ID | Newer EIDs (post-2017) have NFC chip. Requires native Expo module. High effort. |

---

## EID Analysis — Open Item (Detailed)

**Card analysed:** UAE Resident Identity Card belonging to Nadeem Ahmad Muhammad Anwar

**Fields extracted manually (ground truth):**
| Field | Value | Format |
|---|---|---|
| ID Number | 784-1972-0313816-5 | 784-{birth year}-{sequence}-{check} |
| Name | Nadeem Ahmad Muhammad Anwar | English |
| Date of Birth | 03/08/1972 | DD/MM/YYYY = 3 Aug 1972 |
| Nationality | Pakistan | |
| Issuing Date | 08/08/2025 | DD/MM/YYYY = 8 Aug 2025 |
| Expiry Date | 07/08/2027 | DD/MM/YYYY = 7 Aug 2027 ← **must get this right** |
| Sex | M | |

**Does Emirates ID have MRZ?**
**No.** Emirates ID uses a **PDF417 2D barcode** on the back (not standard ICAO MRZ). Newer cards (post-2017) have an NFC chip readable by NFC-enabled phones via the ICA UAE app. The MRZ approach that works for passports cannot be applied here.

**Why AI misreads this card — root causes identified:**
1. **Holographic starburst** — gold/rainbow security element sits directly over the Expiry Date text bottom-left. Highest-impact interference.
2. **Date ambiguity** — 03/08/1972 and 07/08/2027 are both DD/MM/YYYY. AI may assume MM/DD/YYYY and swap day/month.
3. **Two dates problem** — AI must choose between Issuing Date and Expiry Date. The label is small and close to another date (DOB).
4. **Arabic text proximity** — Arabic equivalents of each field printed immediately adjacent, confusing field-to-value mapping.
5. **Security background** — Pink guilloche geometric pattern reduces text contrast.
6. **Perspective distortion** — Card photographed at slight angle.

**Proposed prompt fix (to discuss and implement after PoC):**
```
"This is a UAE Emirates ID (Resident Identity Card) issued by the 
Federal Authority for Identity, Citizenship, Customs & Port Security.
- ALL dates are in DD/MM/YYYY format (day first, then month, then year)
- The ID number format is 784-YYYY-XXXXXXX-X where YYYY is the birth year
- There are THREE dates: Date of Birth, Issuing Date, Expiry Date
- Extract ONLY the Expiry Date (labelled 'Expiry Date / تاريخ الانتهاء')
- Use the ENGLISH text only — ignore the Arabic text on the right side
- The expiry date will be in the future (after today)"
```

**Improvement tiers (discussed, not yet prioritised):**
- Tier 1: UAE-specific prompt additions (above) — no code change, highest ROI
- Tier 2: Image pre-processing (Pillow contrast/sharpen/deskew) + per-field confidence
- Tier 3: Dedicated OCR pre-step (Google Vision/AWS Textract) + document classification

---

## Sprint 6 — Mobile Polish + Deploy ⬜ NOT STARTED
**Goal:** Merge mobile, push notifications, TestFlight/Play Store build.
**Prerequisite:** Complete E2E testing (see testing-plan.md), close PoC phase.

| Task | Status |
|------|--------|
| Complete E2E testing on iOS, Android, Web | ⬜ |
| Merge sprint5-mobile → v2-poc | ⬜ |
| Android device testing and fixes | ⬜ |
| Push notification reminders (APNs + FCM) | ⬜ |
| EID extraction prompt improvement | ⬜ |
| Relation types: Mother, Father, Employee (Railway redeploy OK after PoC) | ⬜ |
| Expo build — TestFlight (iOS) + Play Console internal (Android) | ⬜ |
| App icon + splash screen (proper PNG) | ⬜ |
| Privacy policy URL | ⬜ |
| Database persistence (persistent volume or PostgreSQL) | ⬜ |
| GitHub Actions CI | ⬜ |

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
- Backend URL: `http://localhost:5000` (dev), `https://neverexpire-backend-production.up.railway.app` (prod)
- **Railway redeploy BLOCKED during PoC phase** — demo data must be preserved
- All discussed items logged in phase-plan.md regardless of accept/reject status
