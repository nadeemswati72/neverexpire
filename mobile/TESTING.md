# NeverExpire Mobile — Testing Guide

Temporary instructions for this testing round. The **canonical, combined
guide for testers** (website + mobile, in one shareable page) is the
website's "Testing Guide" page (`/testing`, linked in the site nav). This
file and the in-app **Testing Guide** (side drawer → "Testing Guide") are
developer-facing references with the same information.

## 1. Start the apps (developer machine)

```powershell
cd mobile
npx expo start
```

This starts the Metro bundler and prints a QR code + a URL like
`exp://<your-ip>:8081`.

The Flask backend must also be running with `--host 0.0.0.0` (see
`.claude/skills/dev-server/SKILL.md`) so the website is reachable from the
tester's phone/browser and the mobile app's AI document scan
(`/api/extract`) can reach it.

## 2. Open it on a phone (tester)

1. Install **Expo Go** from the Google Play Store.
2. Make sure the phone is on the **same Wi-Fi network** as the dev machine.
3. Either:
   - Scan the QR code shown in the terminal with the phone's camera, or
   - In Expo Go, tap **"Enter URL manually"** and type the `exp://<ip>:8081`
     URL shown in the terminal (e.g. `exp://192.168.1.182:8081`).
4. The JS bundle compiles on first connect — this can take a minute.

## 3. Log in

Either demo account, password **`Demo@1234`** for both:

| Name | Email |
|---|---|
| Nadeem Ahmad | `nadeem.ahmad@neverexpire.test` |
| Aisha Khan | `aisha.khan@neverexpire.test` |

The login screen has a "demo accounts" card — tap an account to auto-fill
the email.

## 4. What to test

- **Dashboard** — greeting, "Expiring Soon"/"All Documents" summary cards
  (tap through to My Documents with the right filter), recent documents list
- **Add Document** (center FAB) — Take Photo, Choose from Gallery, or Upload
  File: the picked image is sent to the Flask backend's AI extraction
  (same as the website) and the form is pre-filled — review/edit, then
  save. "Enter details manually" skips the AI step. Confirm saved documents
  appear in the lists.
- **Document Details** — view, edit (pencil icon), delete (with confirm)
- **My Documents** — search box, status filter chips (All / Expiring Soon /
  Expired / Valid)
- **Family** — member list with doc counts, add a new member (person-add
  icon), open a member's documents
- **Family Member Documents** — "+" button preselects that member when
  adding a document
- **Profile** — edit account details, "Change Password" (UI-only success
  message), Log Out
- **Notifications** (bell icon) — lists documents that are expiring soon or
  expired
- **Side drawer** (hamburger icon) — Settings, Help & Support, About,
  Testing Guide, Logout

## 5. Known limitations

- Family members and documents are stored on-device (AsyncStorage) — this
  demo dataset isn't shared with the website.
- The AI document scan calls the Flask backend's `/api/extract` endpoint —
  needs the phone and dev machine on the same Wi-Fi network. If it can't
  reach the server, you'll see a message and can fill in the form manually.
- Camera capture needs a real device; most emulators don't have a working
  camera.
- "Change Password" and the notification toggles in Settings are UI-only —
  nothing is persisted or sent anywhere.
- Reinstalling the app or clearing its storage resets documents/family
  members back to the seed data.

## 6. Troubleshooting

**`_ExpoFontLoader.default.getLoadedFonts is not a function`** on first
load — caused by an `expo-font` version mismatch with the Expo SDK. Already
fixed in this project (`expo-font` pinned to `~12.0.10` for SDK 51 in
`package.json`). If you re-clone and see this again, run:

```powershell
cd mobile
npx expo install --fix
npx expo start -c
```

**"Project is incompatible with this version of Expo Go"** — the Expo Go
app version on the phone doesn't support SDK 51. Use an Expo Go build that
matches SDK 51, or ask the dev for an updated build.

---

Once testing wraps up, remove this file along with the temporary
**Testing Guide** screen (`src/screens/misc/TestingGuideScreen.js`,
`ROUTES.TESTING_GUIDE`, and its drawer entry in `CustomDrawerContent.js`).
