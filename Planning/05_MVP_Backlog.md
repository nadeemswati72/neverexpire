# NeverExpire — MVP Backlog v1.0

*Compiled from the actual delivered task history. Every row below shipped and was verified before hand-off — this is a record of what was built, not a forward-looking wishlist (see the Backlog section of `docs/phase-plan.md` for open/deferred items).*

| Epic | Feature | Priority | Status | Platform |
|---|---|---|---|---|
| Foundation | Flask REST API, JWT auth, DB init/seed | MVP | ✅ Done | Backend |
| Foundation | Document + family CRUD endpoints, ownership checks | MVP | ✅ Done | Backend |
| Document Management | Document list, detail, manual entry | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Document Management | Status logic — expired / expiring soon / valid / no expiry | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| AI Extraction | Photo → structured field extraction, review-before-save | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| AI Extraction | Extraction confidence + model audit trail | MVP | ✅ Done | Backend |
| Family Management | Family member CRUD, relation types incl. Domestic Help | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Family Management | Per-member document counts, avatar photo upload | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Dashboard | Family-wide summary, status donut chart, attention list | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Dashboard | Family member filter carried through to document list | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Sharing & Trust | Email-based document sharing, 3 permission levels | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Sharing & Trust | Bulk share all of a person's documents + future auto-include | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Sharing & Trust | Share expiry (1/7/30 days or none), revoke anytime | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Sharing & Trust | Personalized watermark (recipient + date, traceable) | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Sharing & Trust | Per-share watermark on/off toggle, owner-only clean download | Iteration | ✅ Done | Web |
| Sharing & Trust | Access audit trail (who viewed/downloaded, watermark state) | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Notifications | In-app bell — sharing activity, unread badge | MVP | ✅ Done | Web ✓ · Mobile ✓ |
| Notifications | Mock email inbox for live demo visibility | MVP | ✅ Done | Web |
| Reminders | Reminder rules (90/30/7/1 day thresholds) | MVP | ✅ Done | Backend |
| Reminders | Daily scheduled digest (APScheduler) + real Gmail send | MVP | ✅ Done | Backend |
| Reminders | Reminders page — per-user list, on-demand personalized send, dismiss | Iteration | ✅ Done | Web |
| Storage | Encrypted Google Drive storage for new uploads | MVP | ✅ Done | Backend |
| Mobile | Full Expo app — auth, dashboard, documents, family, sharing | MVP | ✅ Done | Mobile |
| Mobile | On-device camera AI extraction | MVP | ✅ Done | Mobile |
| Mobile | Local scheduled expiry notifications | Iteration | ✅ Done | Mobile |
| Mobile | Voice-to-document reminder creation | Iteration | ✅ Done | Mobile |
| UI/Visual System | Glassmorphic design system, teal/navy brand language | MVP | ✅ Done | Web |
| UI/Visual System | App-wide emoji-based icon system, "Emoji Nav" | Iteration | ✅ Done | Mobile |
| UI/Visual System | 3D glossy icon puck component (nav, FAB, share, notifications) | Iteration | ✅ Done | Mobile |
| UI/Visual System | Donut chart gloss/gradient/shadow polish | Iteration | ✅ Done | Web ✓ · Mobile ✓ |
| UI/Visual System | Cross-platform icon consistency pass | Iteration | ✅ Done | Web ✓ · Mobile ✓ |
| Deployment | Vercel (web) + Railway (backend) production hosting | MVP | ✅ Done | Web ✓ · Backend ✓ |
| Deployment | Realistic two-family demo dataset (49 documents, 10 sharing scenarios) | MVP | ✅ Done | Backend |

**Not started (Phase 2):** native push notifications, App Store / Play Store release, production persistent database, CI pipeline — see `docs/phase-plan.md` → Sprint 6.
