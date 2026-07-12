# NeverExpire Mobile — Project Guide for Claude Code

NeverExpire Mobile is the React Native (Expo) companion to the NeverExpire
Flask backend (`../backend/`). It lets a user track documents that expire —
passports, Emirates IDs, driving licenses, visas, insurance, certificates —
for themselves and their family, with color-coded expiry status, AI
extraction, sharing between accounts, and notifications.

**The app talks to the real backend** at `/api/v1` with JWT auth. It shares
accounts and data with the React web app (`../web/`). There is no local
demo-mode dataset anymore — AsyncStorage only caches the JWT and the current
user profile.

The UI must match the design reference at `../Sample/Mobile.jpg` plus the
glassmorphic spec in `../docs/designs/NeverExpire Mobile Dashboard
Standalone.html`.

## Tech stack

- **Framework:** Expo SDK ~54 (managed workflow), React 19.1, React Native 0.81
- **Navigation:** React Navigation v7 — native-stack (root), drawer, bottom-tabs
- **Animation/gestures:** react-native-reanimated 4 + react-native-worklets + gesture-handler 2.28
- **Charts:** react-native-svg (status donut chart)
- **State:** React Context + hooks (`AuthContext`, `DataContext`) — no Redux
- **Storage:** AsyncStorage via `src/services/StorageService.js` — JWT + cached user only
- **Media:** `expo-image-picker` (camera + gallery), `expo-document-picker` (file upload)
- **Icons:** `@expo/vector-icons` — Ionicons for UI chrome, MaterialCommunityIcons for document-type icons
- **Language:** JavaScript (not TypeScript) — JSDoc comments document non-obvious shapes/decisions

## Backend connectivity

- `src/constants/api.js` derives the Flask host from Expo's `hostUri` — the
  phone and the dev machine must be on the same Wi-Fi. Flask must run with
  `--host=0.0.0.0` (see `/dev:start-backend`), else the phone can't reach it.
- `src/services/ApiService.js` is the single fetch wrapper: attaches
  `Authorization: Bearer <jwt>`, unwraps the `{data, error}` envelope,
  clears the token on 401, throws `ApiError`.
- Authenticated images (`<Image>`/`Avatar`) don't go through ApiService —
  pass `headers: authHeader(token)` on the source, with `token` from
  `useAuth()`.

## Directory map

```
mobile/
  App.js                      # GestureHandlerRootView > SafeAreaProvider > AuthProvider > DataProvider > RootNavigator
  src/
    constants/
      theme.js                 # COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOW, STATUS_COLORS, withOpacity()
      documentTypes.js          # DOCUMENT_TYPES (mobile EMIRATES_ID = backend ID_CARD; DocumentService translates)
      api.js                    # API_BASE_URL / API_V1_URL from Expo hostUri
    utils/
      dateUtils.js               # EXPIRY_STATUS, daysRemaining, getExpiryStatus, formatDaysLabel, formatDate
      validators.js              # validateLoginForm, validateDocumentForm, isValidEmail, ...
    data/mockUsers.js            # Demo-account shortcuts for the login screen (REAL backend accounts)
    services/                    # ApiService, AuthService, DocumentService, FamilyService,
                                 # SharingService, NotificationService, ExtractionService, StorageService
    context/                     # AuthContext (session + token), DataContext (family + documents)
    components/
      common/                    # ScreenContainer, Header, Card, AppButton, AppTextInput, Avatar, Badge, IconBox, ...
      documents/                 # SummaryCard, DocumentListItem, DonutChart, StatusOverview, ShareModal, SourceOptionCard
      family/                    # FamilyMemberCard
    navigation/                  # routes.js, RootNavigator, MainDrawerNavigator, MainTabNavigator, CustomTabBar, CustomDrawerContent
    screens/
      auth/                      # LoginScreen, RegisterScreen
      dashboard/DashboardScreen.js   # member filter chips + donut + recents
      documents/                 # AddDocumentScreen, DocumentFormScreen, DocumentDetailsScreen, MyDocumentsScreen
      sharing/SharingScreen.js   # Shared with Me / Shared by Me
      family/                    # FamilyMembersScreen, FamilyMemberDocumentsScreen
      profile/ProfileScreen.js
      misc/                      # NotificationsScreen, SettingsScreen, HelpSupportScreen, AboutScreen, TestingGuideScreen (temp)
```

## Architecture rules (3 layers)

1. **Presentation** (`src/components`, `src/screens`) — functional components
   only, hooks, no business logic. Screens compose components and call
   `useAuth()` / `useAppData()` (services may be called directly for
   screen-local server state like shares/notifications).
2. **Business logic** (`src/services`, `src/utils`, `src/context`) — services
   are plain async functions (no React) that call the backend via ApiService
   and translate payloads to app shapes; contexts wrap the core shared state
   (session, family, documents).
3. **Data** — the Flask backend is the source of truth. AsyncStorage holds
   only the JWT + cached user profile.

Never bypass a layer (e.g. a screen calling `fetch` directly). Backend field
names (`person_id`, `holder_name`, `document_type.code`) are translated to
app names (`familyMemberId`, `fullName`, `documentType`) in the services —
screens never see raw backend payloads.

## Feature map (backend endpoint → screen)

| Feature | Service call | Screen |
|---|---|---|
| Login / register | `AuthService.login/register` | LoginScreen, RegisterScreen |
| Documents CRUD | `DocumentService.*` | Dashboard, MyDocuments, DocumentForm, DocumentDetails |
| AI extraction | `ExtractionService.extractDocumentDetails` | DocumentFormScreen (auto-fills on new image) |
| Share doc / share-all | `SharingService.shareDocument/shareAllForMember` | ShareModal (from DocumentDetails / FamilyMembers) |
| Incoming/outgoing shares | `SharingService.getIncoming/getOutgoingShares` | SharingScreen, DocumentDetails "Shared With" |
| Access history | `SharingService.getAccessLog` | DocumentDetails (15s poll while owner views) |
| Notifications | `NotificationService.*` | NotificationsScreen, Dashboard bell badge |
| Member photos | `FamilyService.photoUrlFor` + auth headers | FamilyMembers, MemberDocuments, Dashboard chips |

## Coding conventions

- Functional components + hooks only; one component per file, default export,
  PascalCase filename.
- `StyleSheet.create()` at the bottom. **Never hardcode hex colors, spacing,
  font sizes, or radii** — import from `src/constants/theme.js`.
- Route names always come from `src/navigation/routes.js` (`ROUTES.*`).
- JSDoc blocks only for *why* (cross-screen contracts, deliberate trade-offs).
- See `.claude/rules/` and `.claude/skills/` for detailed guidance.

## Demo accounts (real backend accounts)

Seeded by `../backend/seed_rich_demo.py`; all share password `Demo@1234`:

- `ahmed.alrashid@neverexpire.test` / `fatima.alrashid@neverexpire.test` — Al Rashid family
- `imran.khan@neverexpire.test` / `sara.khan@neverexpire.test` — Khan family

The login screen's "Demo accounts" card autofills these.

## Expiry status (mirrors the Flask backend)

`src/utils/dateUtils.js` uses a 30-day "expiring soon" threshold
(`EXPIRING_SOON_THRESHOLD_DAYS`). Status colors via `STATUS_COLORS` in
theme.js: expired → danger, expiring_soon → warning, valid → success,
no_expiry → grey.

## Running it locally

```
# Backend first (must bind to all interfaces for the phone to reach it):
cd ../backend && .\venv\Scripts\Activate.ps1
flask --app run run --host=0.0.0.0 --port=5000 --debug

# Then Metro:
cd mobile && npx expo start
```

Open in Expo Go by scanning the QR (phone on the same Wi-Fi). To verify the
bundle compiles without a device: `npx expo export --platform ios`.

## Gotchas

- **SDK upgrades:** react-navigation v7 is required by reanimated 4 — v6's
  drawer calls removed reanimated APIs and crashes at render.
- `react-native-worklets` must be a *direct* dependency (expo-doctor checks).
- The backend documents LIST endpoint intentionally includes `files`,
  `holder_name`, `issuing_authority`, `notes` (see `serializers.document_brief`)
  because detail screens render from the cached list without a per-doc fetch.
- Documents shared *with* the user arrive in the same list with
  `is_owner: false` → mapped to `doc.isOwner` — gate edit/delete/share UI on it.
