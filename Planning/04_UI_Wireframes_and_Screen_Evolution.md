# NeverExpire — UI Wireframes & Screen Evolution v1.0

**Low-fidelity concept sketches showing how each core screen evolved before reaching the shipped glassmorphic design.**
These are reconstructed concept mockups for planning/review purposes — not literal historical screenshots — but they represent the real evolution: every screen went through a plain structural pass before the visual design system (glassmorphic cards, teal/navy branding, status color language) was layered on, and several went through further rounds of icon and polish iteration after that (see `02_Project_Plan.md`, Round 3 — UI Iteration).

## 1. Screen Inventory

| ID | Screen | Primary User | Objective | Status |
|---|---|---|---|---|
| S-01 | Login | All | Authenticate, quick demo-account access | ✅ Shipped |
| S-02 | Dashboard | All | Family-wide status at a glance, drill into what needs attention | ✅ Shipped |
| S-03 | Documents List | All | Browse/search/filter every tracked document | ✅ Shipped |
| S-04 | Document Detail | Owner / Recipient | Full record, watermarked preview, sharing, access history | ✅ Shipped |
| S-05 | Family | Owner | Manage members, per-member status breakdown | ✅ Shipped |
| S-06 | Sharing | Owner / Recipient | Manage outgoing/incoming shares | ✅ Shipped |
| S-07 | Reminders | Owner | Personal reminder list, on-demand digest send, dismiss | ✅ Shipped |
| S-08 | Mock Inbox | Owner (demo) | Live visibility into sharing + reminder emails for stakeholder walkthroughs | ✅ Shipped |

## 2. Evolution Pattern

Every core screen followed the same two-stage pattern before further icon/visual polish rounds:

1. **Concept sketch** — structural layout only: where the navigation sits, what data groups exist, what the primary action is. No color system, no branding, no real content — the point is to validate information architecture before investing in visual design.
2. **Refined pass** — the glassmorphic design system applied: teal/navy brand language, card-based layout, status color coding (red/amber/green), real iconography. This is much closer to what shipped, though still a simplified concept rendering rather than the pixel-exact production build.

From there, the shipped product went through additional rounds not re-illustrated here in full: an app-wide icon system pass, a 3D "glossy puck" treatment for primary navigation chrome, donut-chart gloss/shadow refinement, and a cross-platform icon consistency pass (all listed in `05_MVP_Backlog.md`).

## 3. Login

| Stage | File |
|---|---|
| Concept sketch | `screens/01_login_iteration1_concept.svg` |
| Refined pass | `screens/01_login_iteration2_refined.svg` |

Key decision validated at concept stage: a single centered card, minimal fields, with quick demo-account access below the fold — kept all the way through to what shipped.

## 4. Dashboard

| Stage | File |
|---|---|
| Concept sketch | `screens/02_dashboard_iteration1_concept.svg` |
| Refined pass | `screens/02_dashboard_iteration2_refined.svg` |

Key decision validated at concept stage: sidebar + stat row + "needs attention" band + full table, in that vertical order — the "attention" band became the dark hero card that carries through the shipped design.

## 5. Document Detail

| Stage | File |
|---|---|
| Concept sketch | `screens/03_document_detail_iteration1_concept.svg` |
| Refined pass | `screens/03_document_detail_iteration2_refined.svg` |

Key decision validated at concept stage: two-column layout (details + notes + access history on the left, file preview on the right) — this structure is exactly what made the later trust features (watermark labeling, access history) easy to add without a redesign.

## 6. Family

| Stage | File |
|---|---|
| Concept sketch | `screens/04_family_iteration1_concept.svg` |
| Refined pass | `screens/04_family_iteration2_refined.svg` |

Key decision validated at concept stage: a summary strip above a grid of per-member cards, each carrying its own status counts — this is what let the dashboard's member-filter behavior stay consistent with the Family page itself.

## 7. Why This Matters for the Roadmap

Screens that reached a stable structure at the concept stage (Dashboard, Document Detail, Family) absorbed every later feature — sharing, watermarking, access history, reminders — without a structural rebuild. That's the direct payoff of validating information architecture before visual polish, and it's why the same pattern is the recommended approach for any new screen going forward (e.g. a future native push-notifications settings screen, or the Sprint 6 mobile store-readiness work).
