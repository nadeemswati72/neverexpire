# NeverExpire Mobile — Project Guide for Claude Code

NeverExpire Mobile is the React Native (Expo) companion to the NeverExpire
Flask web app (`../`). It lets a user track documents that expire — passports,
Emirates IDs, driving licenses, visas, insurance, certificates — for
themselves and their family, with color-coded expiry status and reminders.
This is a **demo-mode, local-first** build: all data lives in AsyncStorage,
seeded from mock data, with no backend calls.

The UI must match the design reference at `../Sample/Mobile.jpg` (8 screens:
Login, Dashboard, Add Document, Document Details, Family Members, Family
Member Documents, Profile, Side Drawer).

## Tech stack

- **Framework:** Expo SDK ~51 (managed workflow), React 18.2.0, React Native 0.74.5
- **Navigation:** React Navigation v6 — native-stack (root), drawer, bottom-tabs
- **State:** React Context + hooks (`AuthContext`, `DataContext`) — no Redux
- **Storage:** `@react-native-async-storage/async-storage`, namespaced JSON via `src/services/StorageService.js`
- **Media:** `expo-image-picker` (camera + gallery), `expo-document-picker` (file upload)
- **Icons:** `@expo/vector-icons` — Ionicons for UI chrome, MaterialCommunityIcons for document-type icons
- **Language:** JavaScript (not TypeScript) — JSDoc comments document non-obvious shapes/decisions

## Directory map

```
mobile/
  App.js                      # GestureHandlerRootView > SafeAreaProvider > AuthProvider > DataProvider > RootNavigator
  src/
    constants/
      theme.js                 # COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOW, STATUS_COLORS, withOpacity()
      documentTypes.js          # DOCUMENT_TYPES / DOCUMENT_TYPE_LIST / getDocumentTypeMeta()
    utils/
      dateUtils.js               # EXPIRY_STATUS, daysRemaining, getExpiryStatus, formatDaysLabel, formatDate, formatExpiresOn
      validators.js              # validateLoginForm, validateDocumentForm, isValidEmail, isValidISODate, isNotEmpty
    data/                        # mockUsers.js, mockFamily.js, mockDocuments.js — seed data for AsyncStorage
    services/                    # StorageService, AuthService, FamilyService, DocumentService, PermissionService
    context/                     # AuthContext (session), DataContext (family members + documents, scoped by userId)
    components/
      common/                    # ScreenContainer, Header, Card, AppButton, AppTextInput, Avatar, Badge, IconBox, SectionHeader, EmptyState
      documents/                 # SummaryCard, DocumentListItem, SourceOptionCard
      family/                    # FamilyMemberCard
    navigation/                  # routes.js, RootNavigator, MainDrawerNavigator, MainTabNavigator, CustomTabBar, CustomDrawerContent
    screens/
      auth/LoginScreen.js
      dashboard/DashboardScreen.js
      documents/                 # AddDocumentScreen, DocumentFormScreen, DocumentDetailsScreen, MyDocumentsScreen
      family/                    # FamilyMembersScreen, FamilyMemberDocumentsScreen
      profile/ProfileScreen.js
      misc/                      # NotificationsScreen, SettingsScreen, HelpSupportScreen, AboutScreen
```

## Architecture rules (3 layers)

1. **Presentation** (`src/components`, `src/screens`) — functional components
   only, hooks (`useState`/`useEffect`/`useMemo`), no business logic. Screens
   compose components and call `useAuth()` / `useAppData()`.
2. **Business logic** (`src/services`, `src/utils`, `src/context`) — services
   are plain async functions (no React); contexts wrap services and expose
   hooks. Validation lives in `src/utils/validators.js`, never inline in
   screens.
3. **Data** (`src/data`, AsyncStorage via `StorageService`) — mock seeds are
   the source of truth on first run; everything after that is read/written
   through `DocumentService` / `FamilyService` / `AuthService`.

Never bypass a layer (e.g. a screen calling AsyncStorage directly, or a
component importing a service). Always go through context hooks.

## Coding conventions

- Functional components + hooks only — no class components.
- One component per file, default export, PascalCase filename matching the
  component name.
- Destructure props with sensible defaults; avoid `props.x` access.
- `StyleSheet.create()` at the bottom of the file. **Never hardcode hex
  colors, spacing, font sizes, or radii** — import from
  `src/constants/theme.js` (`COLORS`, `SPACING`, `RADIUS`, `FONT_SIZES`,
  `FONT_WEIGHTS`, `SHADOW`, `STATUS_COLORS`, `withOpacity`).
- Route names always come from `src/navigation/routes.js` (`ROUTES.*`) —
  never hardcode a navigation string.
- Add a short JSDoc block above a component/function only when it explains
  *why* (a non-obvious pattern, a cross-screen contract, a deliberate
  trade-off) — not what the code already says.
- See `.claude/rules/` for naming, component structure, and UI consistency
  rules, and `.claude/skills/` for step-by-step guidance on common tasks.

## Demo accounts (mock auth)

Both share password `Demo@1234` (`src/data/mockUsers.js`, matches the Flask
app's demo password):

- `nadeem.ahmad@neverexpire.test` — "Nadeem Ahmad" + family (wife, son, daughter)
- `aisha.khan@neverexpire.test` — "Aisha Khan" + family (husband)

## Expiry status (mirrors the Flask backend)

`src/utils/dateUtils.js` uses a 30-day "expiring soon" threshold
(`EXPIRING_SOON_THRESHOLD_DAYS`), matching `REMINDER_DAYS_THRESHOLD` in
`../neverexpire/config.py`. Status colors (`STATUS_COLORS` in `theme.js`):
`expired` → danger (red), `expiring_soon` → warning (orange), `valid` →
success (green), `no_expiry` → grey.

## Running it locally

Dependencies are installed (`node_modules/` present). To start:

```
cd mobile
npx expo start
```

Then open in Expo Go (Android) or an emulator. No native build config is
required for the managed workflow.

## MCP servers (`.mcp.json`)

`mobile/.mcp.json` currently has no active servers — it's a placeholder for
future integrations (OCR/field-extraction service, cloud document storage,
push notifications) so they can be wired in without restructuring config.
Add entries there (and document them here) when those integrations exist.
