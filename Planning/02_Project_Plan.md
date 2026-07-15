# NeverExpire — Project Plan v1.0

**Full Delivery Roadmap, Sprint History, Workstreams and Risk Register**
Version 1.0 | Prepared for Management Review | Owner: Nadeem Ahmad

| Planning Driver | Decision |
|---|---|
| Primary target customer | UAE families tracking documents across every member — self, spouse, children, domestic help |
| Product strategy | Web + mobile clients sharing one backend and one account system, so no data lives in only one place |
| MVP center of gravity | The dashboard is the product: family-wide expiry status, first glance tells you what needs attention |
| Delivery model | Solo product owner + AI-assisted engineering pair (Claude Code), iterative sprint delivery, direct hands-on testing after every sprint |
| Release approach | Web MVP first, mobile brought to full parity once the backend contract stabilized, then a dedicated feedback round for sharing/trust/notifications |

## 1. Delivery Roadmap — What Actually Shipped

| Sprint | Theme | Status | Main Deliverable |
|---|---|---|---|
| Sprint 0 | Backend Foundation | ✅ Done | Flask REST API, DB init/seed, JWT auth, health check |
| Sprint 1 | Core CRUD API | ✅ Done | Documents + family endpoints, AI extraction endpoints, ownership checks |
| Sprint 2 | Web Dashboard | ✅ Done | React + Vite web app, glassmorphic login/dashboard, real data |
| Sprint 3 | Web Documents | ✅ Done | Document list/detail, AI-extraction upload flow, watermarked preview |
| Sprint 4 | Web Family + MVP Complete | ✅ Done | Family management UI, full web MVP ready for user testing |
| Sprint 5 | Mobile (Expo) | ✅ Done | Full mobile app — auth, dashboard, documents, family, AI extraction on-device |
| PoC Feedback Round 1 | Sharing, Trust & Storage | ✅ Done | Email-based sharing with permissions, personalized watermarking, access audit trail, notifications, Gmail reminders, encrypted Google Drive storage, realistic multi-family demo data |
| PoC Feedback Round 2 | Mobile ↔ Backend Parity | ✅ Done | Mobile moved off local demo storage onto the real backend; sharing, notifications, and access history at full parity with web |
| Round 3 — UI Iteration | Visual System Overhaul | ✅ Done | App-wide icon system, 3D glossy icon puck component, donut chart polish, consistent color language across web + mobile |
| Round 4 — Trust Refinement | Watermark Control & Reminders UI | ✅ Done | Per-share watermark toggle (owner choice, defaults safe-on), owner-always-gets-clean-original rule, dedicated Reminders page with on-demand personalized digest send |
| Sprint 6 | Mobile Store Readiness | ⬜ Not started | Push notifications, TestFlight/Play Store builds, CI |

*Sprint numbering reflects delivery sequence, not fixed calendar durations — typical of a fast-moving PoC built with an AI engineering pair rather than a multi-person team on fixed iteration lengths.*

## 2. Workstreams

| ID | Workstream | Scope |
|---|---|---|
| W1 | Product & UX | Feature scope decisions, screen design, iteration based on direct usage feedback |
| W2 | Backend & Data | Flask/SQLAlchemy API, data model, ownership & permission enforcement |
| W3 | AI Extraction | Anthropic-powered document photo → structured field pipeline |
| W4 | Trust & Security | Sharing permissions, personalized watermarking, access audit trail |
| W5 | Notifications | In-app bell, email digests, scheduled + on-demand reminder triggers |
| W6 | Web Client | React + Vite glassmorphic UI, all core screens |
| W7 | Mobile Client | React Native / Expo, full backend parity, on-device camera extraction |
| W8 | Deployment & Demo | Vercel (web) + Railway (backend) hosting, realistic seeded demo data for stakeholder walkthroughs |

## 3. Release Gates

| Gate | Acceptance Criteria |
|---|---|
| Gate 1 — Core Loop Demo | Add a document by photo, see it appear correctly on the dashboard with the right status color |
| Gate 2 — Family Breadth | Every relation type (including Domestic Help) tracked, filtered, and summarized correctly |
| Gate 3 — Trust Loop | Share a document, recipient sees the correct permission level and watermark behavior, owner sees it in the access log |
| Gate 4 — Reminder Loop | A due reminder can be triggered on demand and the resulting digest is visible in-app for verification |
| Gate 5 — Cross-Platform Parity | The same account, same data, same sharing state is correct on both web and mobile |
| Gate 6 — Stakeholder Demo Pack | Two realistic multi-member families seeded with real-looking documents, sharing scenarios, and reminder states, ready to walk through live |

## 4. Staffing Model

| Role | Responsibility | Involvement |
|---|---|---|
| Product Owner | Vision, prioritization, acceptance, direct hands-on testing after every change | Full involvement throughout |
| AI Engineering Pair (Claude Code) | Implementation, architecture decisions within scope, verification before hand-off, deployment execution under explicit approval | Full involvement throughout |
| QA | Owner-led manual testing on real device (iPhone via Expo Go) + live browser verification before every deploy | Every sprint |

*This is a deliberately lean, two-party delivery model — a solo product owner paired with an AI engineering partner — chosen to move from concept to a demo-ready, cross-platform product without a multi-person team overhead.*

## 5. Risks, Challenges and Mitigation

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Ephemeral database on current hosting (Railway free tier has no persistent volume) | High | High | Known and accepted for PoC stage; production launch requires a persistent Postgres volume before real user data is stored |
| R2 | Reminder emails currently route to a single test inbox, not each real user | High | Low (PoC-only) | Deliberate PoC shortcut — demo accounts use fake addresses; digest content already labels which account each reminder belongs to |
| R3 | Watermark-off sharing removes leak traceability | Medium | Medium | Off by default; only the document owner can choose it, per share, with a visible warning at the point of choice |
| R4 | Mobile app store approval adds unplanned timeline | Medium | Medium | Deferred to Sprint 6, after core product-market validation from the PoC demo round |
| R5 | AI extraction accuracy varies by document quality/type | Medium | Medium | User always reviews and confirms extracted fields before save; manual entry remains fully supported as a fallback |
| R6 | Solo-plus-AI delivery model has no second reviewer | Medium | Medium | Mitigated by verifying every change against a running local server before deployment, not just reading code |

## 6. Context
UAE visa, Emirates ID, and vehicle registration lapses carry direct fines and blocked government-service transactions — this is the core motivation for a family-wide, always-current tracker rather than a general-purpose reminders app.
