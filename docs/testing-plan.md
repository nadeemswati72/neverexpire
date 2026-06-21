# NeverExpire V2 — E2E Testing Plan

## How to review this document
- Open this file in any text editor, or view on GitHub at:
  `github.com/nadeemswati72/neverexpire/blob/v2-poc/docs/testing-plan.md`
- Each test has a ✅ PASS / ❌ FAIL / ⚠️ PARTIAL / ⬜ NOT TESTED column
- Update the Status column as you test each item
- Notes column is for recording what went wrong

**Testing environments:**
| Platform | Tool | URL / Access |
|---|---|---|
| Web | Chrome browser | https://neverexpire-poc.vercel.app |
| iOS | Expo Go on iPhone | Scan QR from `npx expo start` |
| Android | Expo Go on Android | Scan QR from `npx expo start` |
| API | api-tester.html | Open `api-tester.html` in browser |

**Demo credentials:** `alice@neverexpire.test` / `Demo@1234`

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
| 1.7 | "Forgot password?" shows correct demo message | ⬜ | ⬜ | ⬜ | |
| 1.8 | Sign out returns to login screen | ⬜ | ⬜ | ⬜ | |
| 1.9 | After sign out, back button does not return to app | ⬜ | ⬜ | ⬜ | |
| 1.10 | Reopen app after login — stays logged in (no re-login needed) | N/A | ⬜ | ⬜ | |

---

## 2. Dashboard

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 2.1 | Dashboard loads with correct total document count | ⬜ | ⬜ | ⬜ | |
| 2.2 | Stat cards show correct counts (Total/Expired/Expiring/Valid) | ⬜ | ⬜ | ⬜ | |
| 2.3 | Donut chart renders with correct colour segments | ⬜ | ⬜ | ⬜ | |
| 2.4 | Donut chart legend shows all 4 types WITH counts | ⬜ | ⬜ | ⬜ | |
| 2.5 | Clicking "Expired" stat card filters document list to expired only | ⬜ | N/A | N/A | Web only |
| 2.6 | Tapping "Expired" tile navigates to Documents (expired filter) | N/A | ⬜ | ⬜ | Mobile only |
| 2.7 | Attention list shows expired + expiring docs | ⬜ | ⬜ | ⬜ | |
| 2.8 | Attention list is scrollable when >4 items | ⬜ | ⬜ | ⬜ | |
| 2.9 | Tapping attention doc row navigates to document detail | ⬜ | ⬜ | ⬜ | |
| 2.10 | Profile photo shows in top-right (if uploaded) | ⬜ | ⬜ | ⬜ | |
| 2.11 | Greeting shows correct time of day (morning/afternoon/evening) | ⬜ | ⬜ | ⬜ | |
| 2.12 | Pull-to-refresh updates data | N/A | ⬜ | ⬜ | Mobile only |
| 2.13 | Family member filter in sidebar filters all document sections | ⬜ | N/A | N/A | Web only |

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
| 3.7 | Tapping a document navigates to detail page | ⬜ | ⬜ | ⬜ | |
| 3.8 | Document icons match document type (🛂 passport, 🪪 ID card, etc.) | ⬜ | ⬜ | ⬜ | |
| 3.9 | Expiry countdown shown correctly (Xd left / Xd ago) | ⬜ | ⬜ | ⬜ | |
| 3.10 | FAB "+ Add Document" button visible and tappable | N/A | ⬜ | ⬜ | Mobile only |
| 3.11 | "+ Add Document" button navigates correctly | ⬜ | ⬜ | ⬜ | |

---

## 4. Document Detail

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 4.1 | Document title, type, person shown in dark hero card | ⬜ | ⬜ | ⬜ | |
| 4.2 | Status badge shows correct colour (red/amber/green) | ⬜ | ⬜ | ⬜ | |
| 4.3 | Days remaining shown correctly | ⬜ | ⬜ | ⬜ | |
| 4.4 | Issued date and Expiry date shown in header AND details section | ⬜ | ⬜ | ⬜ | |
| 4.5 | Document number shown | ⬜ | ⬜ | ⬜ | |
| 4.6 | Issuing authority shown | ⬜ | ⬜ | ⬜ | |
| 4.7 | Watermarked document preview loads (if file was uploaded) | ⬜ | ⬜ | ⬜ | |
| 4.8 | Watermark text visible on document preview image | ⬜ | ⬜ | ⬜ | |
| 4.9 | AI extraction info shown (model name, confidence) if AI-extracted | ⬜ | ⬜ | ⬜ | |
| 4.10 | Edit button opens edit mode | ⬜ | ⬜ | ⬜ | |
| 4.11 | Edit: change title and save — change persists | ⬜ | ⬜ | ⬜ | |
| 4.12 | Edit: change expiry date — date picker works correctly | ⬜ | ⬜ | ⬜ | |
| 4.13 | Delete document — confirmation shown, then deleted | ⬜ | ⬜ | ⬜ | |
| 4.14 | After delete, navigates back to documents list | ⬜ | ⬜ | ⬜ | |
| 4.15 | Back button returns to documents list | ⬜ | ⬜ | ⬜ | |

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
| 6.14 | Test with Emirates ID — check which fields are read correctly | ⬜ | ⬜ | ⬜ | Record exact extracted values |
| 6.15 | Test with Passport — check dates and document number | ⬜ | ⬜ | ⬜ | Record exact extracted values |

---

## 7. Family Management

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 7.1 | Family page loads all members | ⬜ | ⬜ | ⬜ | |
| 7.2 | Member cards show avatar (initials or photo) | ⬜ | ⬜ | ⬜ | |
| 7.3 | Member cards show relation type badge | ⬜ | ⬜ | ⬜ | |
| 7.4 | Member cards show date of birth and age | ⬜ | ⬜ | ⬜ | |
| 7.5 | Document counts per member correct (Total/Expired/Expiring/Valid) | ⬜ | ⬜ | ⬜ | |
| 7.6 | Clicking doc count navigates to filtered documents (web) | ⬜ | N/A | N/A | |
| 7.7 | Tapping doc count navigates to filtered documents (mobile) | N/A | ⬜ | ⬜ | |
| 7.8 | "Docs" button on mobile shows only THAT member's documents | N/A | ⬜ | ⬜ | |
| 7.9 | Add member: name, relation type, DOB — saves correctly | ⬜ | ⬜ | ⬜ | |
| 7.10 | Add member: DOB date picker works (mobile) | N/A | ⬜ | ⬜ | |
| 7.11 | Edit member: change name and relation type | ⬜ | ⬜ | ⬜ | |
| 7.12 | Remove member: confirmation shown, member removed | ⬜ | ⬜ | ⬜ | |
| 7.13 | Primary member (Self/Alice) cannot be deleted | ⬜ | ⬜ | ⬜ | |
| 7.14 | Upload profile photo — tap avatar, pick photo, photo updates | ⬜ | ⬜ | ⬜ | |
| 7.15 | Profile photo shows in sidebar (web) and family cards | ⬜ | ⬜ | ⬜ | |
| 7.16 | Profile photo shows in dashboard family cards | ⬜ | ⬜ | ⬜ | |
| 7.17 | Profile photo shows in dashboard header (mobile) | N/A | ⬜ | ⬜ | |

---

## 8. Cross-Cutting Concerns

| # | Test | Web | iOS | Android | Notes |
|---|------|-----|-----|---------|-------|
| 8.1 | All navigation links/buttons work (no dead ends) | ⬜ | ⬜ | ⬜ | |
| 8.2 | Back navigation always works | ⬜ | ⬜ | ⬜ | |
| 8.3 | No documents from other users visible (cross-user isolation) | ⬜ | ⬜ | ⬜ | Login as different user and verify |
| 8.4 | App handles no-internet gracefully (error message, not crash) | ⬜ | ⬜ | ⬜ | Turn off WiFi |
| 8.5 | Long document titles display without overflow | ⬜ | ⬜ | ⬜ | |
| 8.6 | Long family member names display without overflow | ⬜ | ⬜ | ⬜ | |
| 8.7 | Status badge colours consistent across all screens | ⬜ | ⬜ | ⬜ | |
| 8.8 | Date format consistent (DD Mon YYYY or DD/MM/YYYY) | ⬜ | ⬜ | ⬜ | |
| 8.9 | All glassmorphic cards render correctly (no white boxes) | ⬜ | ⬜ | ⬜ | |
| 8.10 | Safe area respected — content not under notch or home bar (iOS) | N/A | ⬜ | N/A | |
| 8.11 | Safe area respected — Android status bar and nav bar (Android) | N/A | N/A | ⬜ | |

---

## 9. Known Issues (Do Not Re-Test)

| Issue | Platform | Status |
|-------|----------|--------|
| EID dates misread by AI | All | Known — prompt fix deferred to Sprint 6 |
| Emirates ID has no MRZ | All | By design — PDF417 barcode on back not supported |
| Model on haiku revert blocked | Backend | Blocked — Railway redeploy freeze |
| Relation types Mother/Father/Employee | All | Deferred — needs Railway redeploy |

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
**Expo build used:** sprint5-mobile @ b03b586
**Notes:** _______________
