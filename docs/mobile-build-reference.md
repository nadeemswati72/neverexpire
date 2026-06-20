# NeverExpire Mobile Build Reference
*Generated after Web MVP completion (Sprints 0–4). Use this as the definitive reference when building the React Native Expo app in Sprint 5.*

---

## Backend API — Base URL
- **Dev:** `http://localhost:5000/api/v1`
- **Prod:** `https://neverexpire-backend.up.railway.app/api/v1` (set after Railway deploy)

---

## Authentication

**Flow:** Email + password → JWT token → store in SecureStore (not AsyncStorage — Expo SecureStore for tokens)

| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/auth/login` | POST | `{email, password}` | `{data: {token, user}}` |
| `/auth/register` | POST | `{email, password, full_name}` | `{data: {token, user}}` |
| `/auth/me` | GET | — | `{data: {id, email, full_name}}` |

**All protected endpoints require:** `Authorization: Bearer <token>` header.

**Auto-logout:** On 401 response, clear token and redirect to login screen.

---

## API Response Envelope
Every response follows this shape:
```json
{ "data": <payload or null>, "error": <string or null> }
```
Never access `.data.data` directly — always unwrap `.data` from axios, then `.data` from the envelope.

---

## All Endpoints

### Document Types
| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `GET /document-types` | GET | ✅ | Returns 12 system types |

**Response shape:**
```json
[{ "id": 1, "code": "PASSPORT", "name": "Passport" }]
```

**Document type codes:** `PASSPORT, VISA, DRIVING_LICENSE, VEHICLE_REGISTRATION, HEALTH_INSURANCE, INSURANCE, WARRANTY, MEDICATION, FOOD_ITEM, CERTIFICATE, SUBSCRIPTION, OTHER`

---

### Family
| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `GET /family` | GET | ✅ | All members for logged-in user |
| `POST /family` | POST | ✅ | Add family member |
| `GET /family/:id` | GET | ✅ | Member detail with relations |
| `PUT /family/:id` | PUT | ✅ | Update name, DOB, relation_type |
| `DELETE /family/:id` | DELETE | ✅ | Soft delete (is_active=false) |
| `GET /family/relation-types` | GET | ✅ | 6 relation type codes |
| `POST /family/:id/photo` | POST | ✅ | Upload avatar (multipart) |
| `GET /family/:id/photo` | GET | ✅ | Serve avatar (JWT in header) |
| `DELETE /family/:id/photo` | DELETE | ✅ | Remove avatar |

**Member shape (from GET /family list):**
```json
{
  "id": 2,
  "full_name": "Alice Johnson",
  "relation_type": "SELF",
  "is_primary": true,
  "date_of_birth": "1990-04-11",
  "photo_path": "/abs/path/or/null"
}
```

**Relation types:** `SELF, SPOUSE, CHILD, PARENT, SIBLING, OTHER`

**Avatar serving — CRITICAL:** `GET /family/:id/photo` requires Bearer token in the Authorization header. React Native `<Image source={{uri}}/>` CANNOT send custom headers. Use `expo-file-system` or `fetch()` + base64 to load avatars, same pattern as web's `AuthenticatedImage` component.

---

### Documents
| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `GET /documents` | GET | ✅ | All docs; `?status=expired/expiring_soon/valid/no_expiry` + `?person_id=X` |
| `POST /documents` | POST | ✅ | Manual create |
| `GET /documents/:id` | GET | ✅ | Full detail with files + extraction runs |
| `PUT /documents/:id` | PUT | ✅ | Update fields |
| `DELETE /documents/:id` | DELETE | ✅ | Hard delete |
| `POST /documents/extract` | POST | ✅ | Upload file → AI extraction only (no save) |
| `POST /documents/upload-and-create` | POST | ✅ | Upload + extract + save in one shot |

**Document brief shape (from GET /documents list):**
```json
{
  "id": 6,
  "title": "Bob Passport",
  "document_type": { "id": 1, "code": "PASSPORT", "name": "Passport" },
  "person_id": 3,
  "person": { "id": 3, "full_name": "Bob Johnson", "is_primary": false },
  "status": "expired",
  "expiry_date": "2026-06-10",
  "issued_date": "2024-06-20",
  "days_remaining": -10,
  "document_number": "B98765432",
  "source": "manual"
}
```

**Status values:** `expired | expiring_soon | valid | no_expiry`
- `expired` — expiry_date in the past
- `expiring_soon` — expiry_date within 90 days
- `valid` — expiry_date more than 90 days away
- `no_expiry` — no expiry_date set

**days_remaining:** negative = already expired (e.g. -10 = expired 10 days ago)

**POST /documents (manual):**
```json
{
  "person_id": 2,
  "title": "Alice Passport",
  "document_type_code": "PASSPORT",
  "document_number": "P12345",
  "issued_date": "2020-01-01",
  "expiry_date": "2030-01-01",
  "issuing_authority": "UAE Ministry",
  "holder_name": "Alice Johnson",
  "notes": "Optional notes"
}
```

**POST /documents/extract (multipart):**
```
file: <image/pdf>
```
Returns extracted fields for user to confirm. Does NOT save. `staging_file` in response is the temp filename.

**POST /documents/upload-and-create (multipart):**
```
file: <image/pdf>
person_id: 2
title: Alice Passport (optional — AI fills if blank)
document_type_code: PASSPORT (optional)
issued_date: 2020-01-01 (optional)
expiry_date: 2030-01-01 (optional)
document_number: P12345 (optional)
issuing_authority: ... (optional)
holder_name: ... (optional)
notes: ... (optional)
```
Sets `source = "ai_extracted"` on the saved document.

**File serving — CRITICAL:** `GET /api/v1/files/:file_id` requires Bearer token. React Native Image tag cannot send headers. Use `expo-file-system` to download to cache, then load from local URI.

---

### Dashboard
| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `GET /dashboard/summary` | GET | ✅ | Counts + 5 upcoming expiries |

**Response:**
```json
{
  "total": 8,
  "expired": 1,
  "expiring_soon": 3,
  "valid": 3,
  "no_expiry": 1,
  "upcoming": [ ...DocumentBrief[] ]
}
```

---

## Design System

### Colors
```
Background gradient: #dde4f0 → #c8d3e8 (135deg)
Brand/teal:          #34c9ba / #22a99c
Glass card:          rgba(255,255,255,0.60)
Glass dark card:     rgba(21,32,58,0.90)
Text primary:        #15203a
Text secondary:      #4a5568
Text muted:          #8a9ab5

Status colors:
  expired:       #e53e3e  bg: rgba(229,62,62,0.12)
  expiring_soon: #d97706  bg: rgba(217,119,6,0.12)
  valid:         #38a169  bg: rgba(56,161,105,0.12)
  no_expiry:     #718096  bg: rgba(113,128,150,0.12)

Relation colors:
  SELF:    #34c9ba
  SPOUSE:  #e879a0
  CHILD:   #f6ad55
  PARENT:  #68d391
  SIBLING: #76e4f7
  OTHER:   #b794f4
```

### Typography
```
Font: System default (-apple-system / San Francisco on iOS)
Heading large:  22px weight 800
Heading medium: 18px weight 700
Heading small:  15px weight 700
Body:           14px weight 400/500
Caption:        12px weight 400
Micro:          11px weight 600 (labels, badges)
```

### Border radius
```
Cards:   16–18px
Buttons: 10–12px
Badges:  99px (pill)
Avatars: 50% (circle)
Icons:   12–14px
```

---

## Key Components to Build for Mobile

### 1. AuthenticatedImage
React Native equivalent of the web `AuthenticatedImage` component:
```ts
// Use expo-file-system to download with token, then load local URI
import * as FileSystem from 'expo-file-system'

async function fetchProtectedImage(url: string, token: string): Promise<string> {
  const dest = FileSystem.cacheDirectory + encodeURIComponent(url)
  const result = await FileSystem.downloadAsync(url, dest, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return result.uri  // local file URI safe for <Image source={{uri}} />
}
```

### 2. StatusBadge
Same logic, use `View` + `Text` with the status color system above.

### 3. MemberAvatar
- Show photo if available (use AuthenticatedImage pattern)
- Fall back to initials in colored circle
- Relation emoji badge overlaid bottom-right
- On family management screen: tap to upload (use `expo-image-picker`)

### 4. DonutChart
Use `react-native-svg` — same SVG arc math as the web component.

### 5. GlassmorphicCard
React Native doesn't support `backdrop-filter`. Use:
- `BlurView` from `expo-blur` for the blur effect
- Semi-transparent background + subtle border

---

## Camera + AI Extraction Flow (Mobile — Sprint 5)
This is the killer mobile feature:

1. User taps "Scan Document" → `expo-camera` or `expo-image-picker`
2. Upload to `POST /documents/extract` (multipart)
3. Show extraction animation (spinner / lottie)
4. Display pre-filled form for user to confirm/edit
5. Submit to `POST /documents/upload-and-create`

**AI model:** `claude-haiku-4-5` (fast, cheap, already working in backend)
**Confidence field:** response includes `"confidence": "high/medium/low"` — show warning if low

---

## Seed Data (Demo Accounts)
After deployment, the DB is seeded with:

| Account | Password | Family |
|---|---|---|
| `alice@neverexpire.test` | `Demo@1234` | Alice (Self), Bob (Spouse), Emma (Child) |
| `demoadmin@neverexpire.test` | `Demo@1234` | Admin account |

Bob has 1 expired passport. Alice has expiring car registration + health insurance. Emma has 1 valid document. Good for demos.

---

## Architecture Decisions (Don't Repeat in Mobile)
- JWT stored in SecureStore (not AsyncStorage — SecureStore is encrypted on device)
- All API calls through a single axios/fetch wrapper that injects the token
- Ownership enforced server-side — never trust client-side person_id filtering
- Watermark is applied server-side, clients never see original files
- `days_remaining` is pre-calculated by the backend — don't recalculate on client
- `status` is pre-calculated by the backend — don't re-derive on client

---

## File Paths (Backend)
```
Uploads:    backend/data/uploads/
Staging:    backend/data/uploads/staging/   (temp before confirm)
Avatars:    backend/data/avatars/
Watermarks: same dir as original, suffix _wm (e.g. abc123_wm.jpg)
```
