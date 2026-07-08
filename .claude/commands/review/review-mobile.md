---
description: Review React Native / Expo code for SDK 54 compatibility, 3-layer architecture, and touch interaction safety
---

# Review Mobile

Review React Native / Expo code for correctness, SDK 54 compatibility, and project conventions.

## Before reviewing any Expo/RN code

Read `mobile/AGENTS.md` — it points to the exact versioned Expo SDK 54 docs. Never rely on general RN knowledge for Expo APIs; they change between SDK versions.

## What to check

### Architecture (3-layer rule)
- Screens → context hooks → services → AsyncStorage (never skip layers)
- No direct AsyncStorage calls from screens — must go through a service
- No business logic inside screens — screens are display only

### Expo SDK 54 specifics
- SDK: Expo 54, React 19.1, React Native 0.81.5
- `MediaTypeOptions` must be passed as an array (not a single value) — known breaking change in SDK 54
- `@react-native-community/datetimepicker` pinned to 8.4.4 — do not upgrade
- `@react-native-picker/picker` pinned to 2.11.1 — do not upgrade
- Managed workflow — no `android/` or `ios/` native folders should be modified

### Navigation
- All route strings come from `src/navigation/routes.js` — never hardcode a string route name
- Navigation calls use `navigation.navigate(ROUTES.SCREEN_NAME)` pattern

### Styling
- All colors and spacing from `src/constants/theme.js`
- No hardcoded hex colors or pixel values in component files
- Dark/light theme support via `useTheme()` hook

### Touch interactions (critical — device-only bugs)
- Any feature involving touch, drag, swipe, or PanResponder must be marked ⚠ until confirmed on a real device or simulator
- PanResponder coordinate bugs (locationX vs pageX) are invisible in code review — always flag for device test
- Double tap window is 280ms — verify this is consistent with existing Cell components

### Data
- Demo mode: all data from `src/data/mock*.js` via AsyncStorage — no backend calls
- `EXPIRING_SOON_THRESHOLD_DAYS` in `src/utils/dateUtils.js` must match `REMINDER_DAYS_THRESHOLD = 90` in backend `config.py`

## Steps

1. Ask the user which file(s) to review, or read the diff.
2. Check each item above.
3. Flag any touch/gesture feature as ⚠ requiring device test before marking complete.
4. Report findings: Critical → Correctness → Convention. Do not rewrite unless asked.
