# NeverExpire — Product Requirements Document v1.0

**Family Document Expiry Tracker**
Target Market: UAE Families & Households | Product Owner: Nadeem Ahmad

| Summary Item | Decision |
|---|---|
| Product Type | Family document tracker (web + mobile) |
| Primary Customer | UAE households tracking passports, visas, Emirates ID, licenses, insurance for every family member |
| MVP Core | Expiry-status dashboard, per-document detail, AI-assisted data entry |
| Main Value | Replace spreadsheets/memory with one place that shows what's expired, expiring, and valid — for the whole family |
| Primary Screen | Family Dashboard (status summary + attention list) |

## 1. Product Vision
A simple, always-current dashboard that tells a UAE household exactly which family member's document needs attention next — passport, visa, Emirates ID, driving license, insurance, certificates — before it becomes a fine, a blocked renewal, or a missed flight.

## 2. Problem Statement
UAE residency and travel documents carry real financial and legal consequences when they lapse (visa overstay fines, blocked Emirates ID transactions, refused boarding). Families currently track this in memory, notes apps, or scattered spreadsheets, with no single view across every family member — including children and domestic staff, who often hold their own visas and IDs.

## 3. Target Customer
Primary target: UAE-based families with 3-6 tracked members (self, spouse, children, domestic help), each holding multiple expiry-bound documents. Comfortable with a mobile app or web dashboard; not looking for enterprise document management.

## 4. Core Value Proposition
- **One dashboard, whole family** — every member's documents, one status view (Expired / Expiring Soon / Valid / No Expiry).
- **AI-assisted entry** — photograph a document, let extraction pre-fill the fields instead of typing.
- **Share safely** — hand a document to someone else (agent, employer, school) with a personalized watermark and a full access log, without losing control of the original.
- **Get reminded** — automatic email digest before anything expires, on a configurable threshold schedule.

## 5. MVP Scope — Core Tracking
Every document belongs to a family member (`Person`) and has: type, title, issued/expiry date, document number, issuing authority, holder name, notes, and an optional photo/file. Status is computed automatically (expired / expiring soon / valid / no expiry) against a configurable threshold (90 days).

## 6. AI-Assisted Extraction
A photographed or uploaded document is sent through an AI extraction pipeline (Anthropic Claude) that pre-fills title, dates, document number, and issuing authority. The user reviews and confirms before saving — extraction never saves silently.

## 7. Family Management
Family members (`Person`) support relation types: Self, Spouse, Child, Parent, Sibling, Domestic Help, Other. Each member has an avatar (photo or initials), a document count, and a per-member status breakdown, filterable from the dashboard.

## 8. Sharing & Trust
Owners can share a single document or all of a family member's documents with another registered user, at one of three permission levels (Read / Edit / Download), optionally time-limited, optionally sent as an invite requiring acceptance.

**Watermarking is a deliberate trust control, not a formality.** By default every shared copy is personalized — recipient email and date baked into the image — so a leaked copy is traceable back to who it was shared with. The owner may explicitly turn this off per share (e.g. sharing with a spouse who is effectively a co-owner), but the default always protects.

## 9. Access Audit Trail
Every view and download of a shared document is logged with who, when, and whether the copy they received was watermarked — visible to the owner on the document's own page, so trust is verifiable, not assumed.

## 10. Notifications & Reminders
Reminder rules fire at configurable thresholds before expiry (90 / 30 / 7 / 1 day). A user can trigger their own family's digest on demand from the Reminders page, or let the daily scheduled job handle it automatically. An in-app notification bell covers sharing activity (new share, revoked access) in real time.

## 11. Mobile Parity
The mobile app (React Native / Expo) is a first-class client of the same backend and accounts — not a demo shell. Dashboard, documents, family, sharing, and notifications all work against real data, including AI extraction from the phone camera.

## 12. Explicitly Deferred to Phase 2 / Future
Native push notifications (APNs/FCM); App Store / Play Store release; multi-tenant business/enterprise accounts; billing/subscriptions; MRZ passport barcode parsing; production-grade persistent database (current PoC uses ephemeral storage by design); advanced document types beyond the UAE-common set; screenshot/OS-level capture prevention (watermarking is the deliberate mitigation instead — capture prevention is not reliably enforceable on the web).

## 13. Product Definition in One Sentence
A family-wide, AI-assisted document expiry tracker for UAE households that replaces scattered spreadsheets and memory with one trustworthy dashboard, safe sharing, and automatic reminders.

## 14. Recommended Next Step
See `02_Project_Plan.md` for the delivery roadmap actually followed, `03_Solution_Architecture.md` for the technical design, and `04_UI_Wireframes_and_Screen_Evolution.md` for how the interface evolved from first concept to the shipped design.
