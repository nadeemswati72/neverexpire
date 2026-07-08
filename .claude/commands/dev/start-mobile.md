---
description: Start the Expo dev server and load the mobile app on iPhone via Expo Go
---

# Start Mobile

Start the Expo development server for the React Native mobile app.

## Steps

1. Run in PowerShell:
```powershell
cd C:\Users\Hp\projects\NeverExpire-PoC\mobile
npx expo start
```

2. A QR code appears in the terminal.

3. On the iPhone:
   - Open the **Camera app**
   - Point at the QR code
   - Tap the banner that appears
   - The app loads in **Expo Go** (install from App Store if not present)

4. Phone and laptop must be on the **same WiFi network**. If venue WiFi blocks device-to-device traffic, use iPhone hotspot and connect the laptop to it.

## Important facts about the mobile app

- The mobile app is in **demo mode** — all data is seeded from `src/data/mock*.js` via AsyncStorage. It does NOT call the backend.
- No backend server is needed to demo the mobile app.
- SDK: **Expo SDK 54** (React 19.1, RN 0.81.5). Managed workflow — no native build needed.
- Before writing any Expo/RN code, read `mobile/AGENTS.md` which points to versioned Expo docs.

## Common issues

- If QR code scan does nothing: ensure Expo Go is installed, not just the Camera app
- If the app crashes on load: run `npx expo start --clear` to clear the Metro bundler cache
- If modules are missing: run `npm install` in `mobile/`
