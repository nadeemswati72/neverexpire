# NeverExpire V2 — E2E Testing Plan

## How to review this document
- Open this file in any text editor, or view on GitHub at:
  `github.com/nadeemswati72/neverexpire/blob/PoC-FeedBack/docs/testing-plan.md`
- Each test has a ✅ PASS / ❌ FAIL / ⚠️ PARTIAL / ⬜ NOT TESTED column
- Update the Status column as you test each item
- Notes column is for recording what went wrong
- For a tester-friendly, step-by-step checklist (not this raw table), use `docs/testing-guide.html` instead — this file is the internal tracking companion to that.

**Testing environments:**
| Platform | Tool | URL / Access |
|---|---|---|
| Web | Chrome browser | https://neverexpire-poc.vercel.app |
| iOS | Expo Go on iPhone | Scan QR from `npx expo start` (Camera app deep-links into Expo Go) |
| Android | Expo Go on Android | Scan QR from `npx expo start` using Expo Go's own in-app scanner (**not** the system Camera app) |
| API | api-tester.html | Open `api-tester.html` in browser |

**Demo credentials:** `ahmed.alrashid@neverexpire.test` / `Demo@1234` (see `docs/testing-guide.html` for the full account list — two families, four accounts, sharing scenarios already seeded between them)

**Android status:** never tested on real hardware before the 2026-07-18 mobile/web parity round. All fixes in that round are cross-platform RN code (no iOS/Android-specific branches touched), so risk is low, but every row below is genuinely `⬜ NOT TESTED` for Android until someone runs it on a real device.

---

## 1. Authentication

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 1.1 | Login with valid credentials | ⬜ | ⬜ | ⬜ | |
| 1.2 | Login with wrong password shows error | ⬜ | ⬜ | ⬜ | |
| 1.3 | Login with empty fields shows error | ⬜ | ⬜ | ⬜ | |
| 1.4 | Register new account (name, email, password, confirm) | ⬜ | ⬜ | ⬜ | |
| 1.5 | Register with mismatched passwords shows error | ⬜ | ⬜ | ⬜ | |
| 1.6 | Register with existing email shows error | ⬜ | ⬜ | ⬜ | |
| 1.7 | "Forgot password?" request shows confirmation message | ⬜ | ⬜ | ⬜ | Mobile only has the request step — see 1.9 |
| 1.8 | Reset-password email actually arrives and the link works (real-domain account only) | ⬜ | N/A | N/A | Link always opens the **web** reset page regardless of which platform requested it |
| 1.9 | On mobile, tapping "Forgot password?" navigates to the request screen and submits correctly | N/A | ⬜ | ⬜ | New this round — mobile had zero password-reset UI before |
| 1.10 | Change Password: correct current password + valid new password succeeds | ⬜ | ⬜ | ⬜ | New this round — web had no Change Password UI at all; mobile's was a non-functional stub |
| 1.11 | Change Password: wrong current password shows a real error (not a fake success) | ⬜ | ⬜ | ⬜ | |
| 1.12 | Sign out returns to login screen | ⬜ | ⬜ | ⬜ | |
| 1.13 | After sign out, back button does not return to app | ⬜ | ⬜ | ⬜ | |
| 1.14 | Reopen app after login — stays logged in (no re-login needed) | N/A | ⬜ | ⬜ | |

---

## 2. Dashboard

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 2.1 | Dashboard loads with correct total document count | ⬜ | ⬜ | ⬜ | |
| 2.2 | All 4 stat cards show correct counts (Total/Expired/Expiring/Valid) | ⬜ | ⬜ | ⬜ | Expired + Valid cards are new on mobile this round |
| 2.3 | Donut chart renders with correct colour segments | ⬜ | ⬜ | ⬜ | |
| 2.4 | Donut chart legend shows all 4 types WITH counts | ⬜ | ⬜ | ⬜ | |
| 2.5 | Clicking a stat card filters the document list to that status | ⬜ | ⬜ | ⬜ | Now works identically on both platforms |
| 2.6 | Valid Documents panel appears below Recent Documents, listing only valid docs | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 2.7 | Attention list shows expired + expiring docs | ⬜ | ⬜ | ⬜ | |
| 2.8 | Attention list is scrollable when >4 items | ⬜ | ⬜ | ⬜ | |
| 2.9 | Tapping attention doc row navigates to document detail | ⬜ | ⬜ | ⬜ | |
| 2.10 | Profile photo shows in top-right (if uploaded) | ⬜ | ⬜ | ⬜ | |
| 2.11 | Greeting shows correct time of day (morning/afternoon/evening) | ⬜ | ⬜ | ⬜ | |
| 2.12 | Pull-to-refresh updates data | N/A | ⬜ | ⬜ | Mobile only |
| 2.13 | Family member filter (sidebar/chips) filters all document sections | ⬜ | ⬜ | ⬜ | |

---

## 3. Documents List

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 3.1 | Documents list loads all documents | ⬜ | ⬜ | ⬜ | |
| 3.2 | Search by document title filters correctly | ⬜ | ⬜ | ⬜ | |
| 3.3 | Search by person name filters correctly | ⬜ | ⬜ | ⬜ | |
| 3.4 | Status filter "Expired" shows only expired docs | ⬜ | ⬜ | ⬜ | |
| 3.5 | Status filter "Expiring Soon" shows correct docs | ⬜ | ⬜ | ⬜ | |
| 3.6 | Status filter "Valid" shows correct docs | ⬜ | ⬜ | ⬜ | |
| 3.7 | Status filter "No Expiry" shows correct docs | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 3.8 | Tapping a document navigates to detail page | ⬜ | ⬜ | ⬜ | |
| 3.9 | Document icons match document type, identically across platforms | ⬜ | ⬜ | ⬜ | Icon set was unified this round — check VISA (✈️) and CERTIFICATE (🎓) specifically, they used to differ |
| 3.10 | All 13 document types are selectable/creatable | ⬜ | ⬜ | ⬜ | Mobile only supported 7 before this round; 6 types now added |
| 3.11 | Expiry countdown shown correctly (Xd left / Xd ago) | ⬜ | ⬜ | ⬜ | |
| 3.12 | Shared document badge shows sharer email + permission level | ⬜ | ⬜ | ⬜ | Mobile's badge was a generic "Shared" pill before this round |
| 3.13 | FAB "+ Add Document" button visible and tappable | N/A | ⬜ | ⬜ | Mobile only |

---

## 4. Document Detail

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 4.1 | Document title, type, person shown in dark hero card | ⬜ | ⬜ | ⬜ | |
| 4.2 | Status badge shows correct colour (red/amber/green), consistent across platforms | ⬜ | ⬜ | ⬜ | Colors were unified this round |
| 4.3 | Days remaining shown correctly, and matches web/mobile for the same document | ⬜ | ⬜ | ⬜ | The 90-day threshold bug (mobile used 30) is fixed — specifically verify a document 31-90 days from expiry shows the same status on both |
| 4.4 | Issued date and Expiry date shown in header AND details section | ⬜ | ⬜ | ⬜ | |
| 4.5 | Document number shown | ⬜ | ⬜ | ⬜ | |
| 4.6 | Issuing authority shown | ⬜ | ⬜ | ⬜ | |
| 4.7 | Watermarked document preview loads (if file was uploaded) | ⬜ | ⬜ | ⬜ | |
| 4.8 | Watermark text visible on document preview image | ⬜ | ⬜ | ⬜ | |
| 4.9 | "Watermarked copy" / "⚠️ Original copy" note shown correctly under the image | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 4.10 | Source field shows "🤖 AI Extracted" or "✏️ Manual Entry" | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 4.11 | AI extraction info shown (model name, confidence) if AI-extracted | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 4.12 | "Add Picture" quick action attaches an extra photo without full edit | N/A | ⬜ | ⬜ | New on mobile this round; N/A on web (already had this) |
| 4.13 | Access History flags unwatermarked entries with a warning | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 4.14 | Edit button opens edit mode | ⬜ | ⬜ | ⬜ | |
| 4.15 | Edit: change title and save — change persists | ⬜ | ⬜ | ⬜ | |
| 4.16 | Edit: change expiry date — date picker works correctly | ⬜ | ⬜ | ⬜ | |
| 4.17 | Delete document — confirmation shown, then deleted | ⬜ | ⬜ | ⬜ | |
| 4.18 | After delete, navigates back to documents list | ⬜ | ⬜ | ⬜ | |
| 4.19 | Back button returns to documents list | ⬜ | ⬜ | ⬜ | |
| 4.20 | Document with 2+ attached files — mobile no longer silently drops extras | ⬜ | ⬜ | ⬜ | Data-loss bug fixed this round; a full gallery/carousel UI is still not built (deferred) |

---

## 5. Add Document — Manual Entry

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 5.1 | Manual entry option available | ⬜ | ⬜ | ⬜ | |
| 5.2 | Family member selector shows all family members | ⬜ | ⬜ | ⬜ | |
| 5.3 | Document type dropdown/picker shows all 13 types | ⬜ | ⬜ | ⬜ | |
| 5.4 | Document type: "Emirates ID / ID Card" appears | ⬜ | ⬜ | ⬜ | |
| 5.5 | Issued date picker works — shows correct date | ⬜ | ⬜ | ⬜ | |
| 5.6 | Issued date picker: Done button closes picker (iOS) | N/A | ⬜ | N/A | |
| 5.7 | Issued date picker: Cancel button discards selection (iOS) | N/A | ⬜ | N/A | |
| 5.8 | Expiry date picker works | ⬜ | ⬜ | ⬜ | |
| 5.9 | Title field is required — saving without title shows error | ⬜ | ⬜ | ⬜ | |
| 5.10 | Save creates document and navigates to detail | ⬜ | ⬜ | ⬜ | |
| 5.11 | New document appears in documents list | ⬜ | ⬜ | ⬜ | |
| 5.12 | Dashboard counts update to reflect new document | ⬜ | ⬜ | ⬜ | |
| 5.13 | Attach a picture without triggering AI extraction | ⬜ | N/A | N/A | Web only — not built on mobile yet (deferred); mobile always runs AI extraction on any picked photo |

---

## 6. Add Document — AI Extraction

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 6.1 | AI extraction option available | ⬜ | ⬜ | ⬜ | |
| 6.2 | Gallery picker opens and allows photo selection | ⬜ | ⬜ | ⬜ | |
| 6.3 | Camera option available | N/A | ⬜ | ⬜ | |
| 6.4 | Camera captures and proceeds to extraction | N/A | ⬜ | ⬜ | |
| 6.5 | AI animation shows during extraction (spinning orb, scan line) | N/A | ⬜ | ⬜ | |
| 6.6 | Web upload animation shows during extraction | ⬜ | N/A | N/A | |
| 6.7 | Extracted fields pre-fill the form | ⬜ | ⬜ | ⬜ | |
| 6.8 | AI confidence level shown | ⬜ | ⬜ | ⬜ | |
| 6.9 | User can edit extracted fields before saving | ⬜ | ⬜ | ⬜ | |
| 6.10 | Saved document shows source as "AI Extracted" | ⬜ | ⬜ | ⬜ | |
| 6.11 | Uploaded file appears in document detail preview | ⬜ | ⬜ | ⬜ | |
| 6.12 | Watermark visible on preview | ⬜ | ⬜ | ⬜ | |
| 6.13 | If extraction fails — fallback to manual form shown | ⬜ | ⬜ | ⬜ | |
| 6.14 | Test with Emirates ID — check which fields are read correctly | ⬜ | ⬜ | ⬜ | Record exact extracted values; EID date misreads are a known, deferred issue |
| 6.15 | Test with Passport — check dates and document number | ⬜ | ⬜ | ⬜ | Record exact extracted values |

---

## 7. Family Management

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 7.1 | Family page loads all members | ⬜ | ⬜ | ⬜ | |
| 7.2 | Member cards show avatar (initials or photo) | ⬜ | ⬜ | ⬜ | |
| 7.3 | Member cards show a colour-coded relation-type badge, identical colour across platforms | ⬜ | ⬜ | ⬜ | Relation-type colours were unified this round; badge overlay is new on mobile |
| 7.4 | Member cards show date of birth and age | ⬜ | ⬜ | ⬜ | |
| 7.5 | Per-member document status breakdown correct (total/expired/soon), not just a flat count | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 7.6 | Clicking doc count navigates to filtered documents (web) | ⬜ | N/A | N/A | |
| 7.7 | Tapping doc count navigates to filtered documents (mobile) | N/A | ⬜ | ⬜ | |
| 7.8 | "Docs" button on mobile shows only THAT member's documents | N/A | ⬜ | ⬜ | |
| 7.9 | Add member: name, relation type, DOB — saves correctly | ⬜ | ⬜ | ⬜ | |
| 7.10 | Add member: DOB date picker/field works (mobile) | N/A | ⬜ | ⬜ | |
| 7.11 | **Edit member**: change name, DOB, and relation type — persists | ⬜ | ⬜ | ⬜ | New on mobile this round — editing a member was previously impossible on mobile |
| 7.12 | **Remove member**: confirmation shown, member removed, their documents kept | ⬜ | ⬜ | ⬜ | New on mobile this round — deleting a member was previously impossible on mobile |
| 7.13 | Primary member (Self) cannot be deleted — no delete option shown for own card | ⬜ | ⬜ | ⬜ | |
| 7.14 | Upload profile photo — tap avatar, pick photo, photo updates | ⬜ | ⬜ | ⬜ | |
| 7.15 | Profile photo shows in sidebar (web) and family cards | ⬜ | ⬜ | ⬜ | |
| 7.16 | Profile photo shows in dashboard family cards | ⬜ | ⬜ | ⬜ | |
| 7.17 | Profile photo shows in dashboard header (mobile) | N/A | ⬜ | ⬜ | |

---

## 8. Sharing

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 8.1 | Share a single document by email with a permission level (read/edit/download) | ⬜ | ⬜ | ⬜ | |
| 8.2 | Set an access expiry (7 or 30 days, or never) | ⬜ | ⬜ | ⬜ | |
| 8.3 | Toggle watermark on/off when sharing, with correct explanatory text for each state | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 8.4 | Toggle "Send as invite" | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 8.5 | Share to an email with no account — "user not found" + "Send Invitation" fallback shown | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 8.6 | Share ALL of a family member's documents (optionally including future ones) | ⬜ | ⬜ | ⬜ | |
| 8.7 | "Shared With Me" tab shows incoming shares with correct permission | ⬜ | ⬜ | ⬜ | |
| 8.8 | "Shared By Me" / outgoing tab shows a "(Pending)" label for unaccepted invites | ⬜ | ⬜ | ⬜ | New on mobile this round |
| 8.9 | "My Recipients" tab lists everyone shared with + document counts | ⬜ | ⬜ | ⬜ | New on mobile this round — tab didn't exist before |
| 8.10 | Revoke an outgoing share — recipient loses access immediately | ⬜ | ⬜ | ⬜ | |
| 8.11 | Access History updates when a recipient views/downloads (owner view) | ⬜ | ⬜ | ⬜ | Mobile polls every 15s |
| 8.12 | Downloads by recipients carry a personalized watermark naming them | ⬜ | ⬜ | ⬜ | |

---

## 9. Reminders

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 9.1 | Reminders screen/page loads a Pending section and an Already Sent section | ⬜ | ⬜ | ⬜ | Entirely new screen on mobile this round — previously faked inside Notifications |
| 9.2 | Pending reminders show correct urgency badge (EXPIRED/URGENT/SOON/UPCOMING) | ⬜ | ⬜ | ⬜ | |
| 9.3 | Dismiss a pending reminder — removed from list, persists server-side | ⬜ | ⬜ | ⬜ | |
| 9.4 | "Send Reminder Digest Now" triggers an immediate digest for your own family | ⬜ | ⬜ | ⬜ | Check Mock Inbox (web) or the real inbox for real-domain accounts |
| 9.5 | Reminder rule thresholds show 90/30/7 days consistently, matching web on both platforms | ⬜ | ⬜ | ⬜ | Confirms the 30-vs-90-day mobile bug is actually fixed |

---

## 10. Notifications

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 10.1 | Sharing activity shown with unread indicators | ⬜ | ⬜ | ⬜ | |
| 10.2 | "Mark all read" clears unread state and bell badge | ⬜ | ⬜ | ⬜ | |
| 10.3 | Tapping a notification navigates to the relevant document | ⬜ | ⬜ | ⬜ | |
| 10.4 | A link/card to the Reminders screen appears at the top (mobile) | N/A | ⬜ | ⬜ | Changed this round — reminders no longer faked inside this list |

---

## 11. Settings

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 11.1 | Change Password reachable from Settings (web) / Profile (mobile) | ⬜ | ⬜ | ⬜ | New page on web this round; web had none before |
| 11.2 | Notification toggles (Expiry Reminders, Expired Alerts) persist across screen visits | ⬜ | ⬜ | ⬜ | Mobile only |
| 11.3 | Weekly Email Digest toggle persists (still not wired to a real digest, but no longer silently reverts) | N/A | ⬜ | ⬜ | Fixed this round |

---

## 12. Cross-Cutting Concerns

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 12.1 | All navigation links/buttons work (no dead ends) | ⬜ | ⬜ | ⬜ | |
| 12.2 | Back navigation always works | ⬜ | ⬜ | ⬜ | |
| 12.3 | No documents from other users visible (cross-user isolation) | ⬜ | ⬜ | ⬜ | Login as different user and verify |
| 12.4 | App handles no-internet gracefully (error message, not crash) | ⬜ | ⬜ | ⬜ | Turn off WiFi |
| 12.5 | Long document titles display without overflow | ⬜ | ⬜ | ⬜ | |
| 12.6 | Long family member names display without overflow | ⬜ | ⬜ | ⬜ | |
| 12.7 | Status badge colours identical across web and mobile for the same document | ⬜ | ⬜ | ⬜ | Colour tokens were unified this round — this is the key regression check |
| 12.8 | Brand teal/navy identical across web and mobile | ⬜ | ⬜ | ⬜ | |
| 12.9 | Document type icons identical across web and mobile (check VISA ✈️ and CERTIFICATE 🎓 specifically) | ⬜ | ⬜ | ⬜ | |
| 12.10 | Date format consistent (DD Mon YYYY) | ⬜ | ⬜ | ⬜ | |
| 12.11 | All glassmorphic cards render correctly (no white boxes) | ⬜ | ⬜ | ⬜ | |
| 12.12 | Safe area respected — content not under notch or home bar (iOS) | N/A | ⬜ | N/A | |
| 12.13 | Safe area respected — Android status bar and nav bar (Android) | N/A | N/A | ⬜ | First-ever Android hardware pass — pay close attention here |
| 12.14 | Android back button (hardware/gesture) behaves like the in-app back button everywhere | N/A | N/A | ⬜ | Android-only concern, never verified before |
| 12.15 | Camera/photo-library permission prompts appear and work correctly (Android) | N/A | N/A | ⬜ | |
| 12.16 | On-screen keyboard doesn't cover input fields when adding/editing (Android) | N/A | N/A | ⬜ | |

---

## 13. Known Issues / Deferred (Do Not Re-Test)

| Issue | Platform | Status |
|-------|----------|--------|
| EID dates misread by AI | All | Known — prompt fix deferred |
| Emirates ID has no MRZ | All | By design — PDF417 barcode on back not supported |
| Document "Download to device" button | All | Not built — needs new native deps (`expo-file-system`/`expo-sharing`) on mobile |
| Multi-photo gallery/carousel on document detail | All | Not built — a document with 2+ files only shows the first (the underlying data-loss bug that hid extra files entirely IS fixed) |
| Manual entry with a picture but skipping AI extraction | Mobile only | Web supports this; mobile always runs AI extraction on any picked photo |
| Switching mobile's create flow to the single `upload-and-create` endpoint | Mobile only | Mobile does separate create + file-upload calls; may produce different `source` metadata in edge cases |
| Clickable donut/status-legend on dashboard | Mobile only | Web's is clickable, mobile's is a static legend |
| User-avatar dropdown menu on dashboard header | Mobile only | Web has one; mobile already has equivalent navigation via the drawer, so lower priority |
| Weekly Email Digest | All | UI toggle only — no real weekly email sent yet |
| Relation types Mother/Father/Employee | All | Deferred — needs a Railway redeploy outside this round's scope |

---

## Test Results Summary

*Fill this in after testing*

| Platform | Total | Pass | Fail | Partial | Not Tested |
|----------|-------|------|------|---------|------------|
| Web | | | | | |
| iOS | | | | | |
| Android | | | | | |

**Tester:** _______________
**Date tested:** _______________
**Branch/commit tested:** `PoC-FeedBack` @ latest (mobile/web parity round, 2026-07-18)
**Notes:** _______________
