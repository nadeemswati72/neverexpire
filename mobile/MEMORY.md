# NeverExpire Mobile — Design & Architecture Memory

Decisions made while building this app, kept here so future changes stay
consistent with the original intent. See `CLAUDE.md` for the project guide
and `.claude/rules/` + `.claude/skills/` for day-to-day conventions.

## Platform & language

- **Expo SDK ~51, managed workflow** — chosen so camera/gallery/file access
  (`expo-image-picker`, `expo-document-picker`) work without native module
  configuration, and the app runs on Android via Expo Go for demos without a
  build step.
- **JavaScript, not TypeScript** — faster iteration for a demo build; JSDoc
  blocks are used where a prop shape or contract isn't obvious from usage.

## Architecture

- **3-layer split**: Presentation (`src/components`, `src/screens`) →
  Business logic (`src/services`, `src/utils`, `src/context`) → Data
  (`src/data` mock seeds + AsyncStorage). Screens never touch
  AsyncStorage/services directly — always through `useAuth()` / `useAppData()`.
- **Design token system** (`src/constants/theme.js`): `COLORS`, `SPACING`,
  `RADIUS`, `FONT_SIZES`, `FONT_WEIGHTS`, `SHADOW`, `STATUS_COLORS`, and a
  `withOpacity(hexColor, alpha)` helper for tinted backgrounds (used by
  `SummaryCard`, `IconBox`, soft `Badge`s). Navy/teal/orange/red/green
  palette, matching the `Sample/Mobile.jpg` reference.
- **Expiry status model mirrors the Flask web app**: `EXPIRED` (<0 days),
  `EXPIRING_SOON` (0–30 days), `VALID` (>30 days), `NO_EXPIRY` (no
  `expiryDate`) — `EXPIRING_SOON_THRESHOLD_DAYS = 30` in
  `src/utils/dateUtils.js`, matching `REMINDER_DAYS_THRESHOLD` in
  `../neverexpire/config.py`. Status → color mapping lives in
  `STATUS_COLORS` and is used everywhere (Dashboard, lists, badges).

## Data & auth

- **Mock auth**: two demo accounts in `src/data/mockUsers.js`
  (`nadeem.ahmad@neverexpire.test`, `aisha.khan@neverexpire.test`), both with
  password `Demo@1234` — intentionally matches the Flask app's demo password
  for consistency across the two demos.
- **AsyncStorage namespace**: all keys are prefixed `@neverexpire` via
  `StorageService.js`. Family members and documents are stored as flat arrays
  with a `userId`/`familyMemberId` foreign key; `DataContext` filters both by
  the logged-in user's `id` so each demo account sees only its own family.
- Seed data from `src/data/` is written to AsyncStorage on first run only —
  after that, reads/writes go through `DocumentService`/`FamilyService`.

## Navigation structure

- `RootNavigator` (native-stack, `headerShown: false`) is the single top
  level: unauthenticated → `LoginScreen`; authenticated → a `Stack.Group`
  containing `DRAWER` (`MainDrawerNavigator` → `MainTabNavigator` with
  Dashboard/Add/Family tabs) plus all full-screen pushed detail screens
  (AddDocument, DocumentForm, DocumentDetails, MyDocuments,
  FamilyMemberDocuments, Profile, Notifications, Settings, HelpSupport,
  About). A separate "MainStackNavigator" was deliberately **not** added —
  one stack keeps the drawer/tabs and pushed screens in the same navigation
  tree, which is what the FAB and "back" buttons rely on.
- **FAB-in-tab-bar pattern**: `ROUTES.ADD_TAB` is a placeholder tab that
  renders `null`. `CustomTabBar` renders it as a raised center FAB and, on
  press, calls `navigation.getParent()?.navigate(ROUTES.ADD_DOCUMENT)` instead
  of switching tabs — keeps "Add Document" a full-screen push reachable from
  the tab bar without a real (empty) tab screen.
- **`familyMemberId` preselection**: `FamilyMemberDocumentsScreen`'s "+"
  button passes `familyMemberId` through `AddDocumentScreen` to
  `DocumentFormScreen`, which uses it as the initial family-member selection
  when creating a new document (only if there's no existing document being
  edited).

## Component conventions worth remembering

- `DocumentListItem` takes an optional `subtitle` prop (falls back to
  `document.documentNumber`). Dashboard and MyDocuments pass the family
  member's name as `subtitle`; FamilyMemberDocuments omits it so the
  document number shows instead — one component, two contexts, no "mode" prop.
- **Notifications have no separate data model** — `NotificationsScreen`
  derives its list by filtering `documents` for `EXPIRED`/`EXPIRING_SOON`
  status, sorted by `daysRemaining`. Adding a document automatically affects
  what shows here.
- **"Add Family Member" is an inline `Modal`** inside `FamilyMembersScreen`,
  not a separate route — kept scope contained since the original task list
  didn't call for a dedicated screen.

## Integrations

- `mobile/.mcp.json` is intentionally `{"mcpServers": {}}` — a placeholder
  for future OCR/field-extraction, cloud storage, or push-notification
  integrations. None are wired up yet; this is a fully local, offline demo.
