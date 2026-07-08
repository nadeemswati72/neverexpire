---
description: Full pre-demo checklist — backend, web, mobile, AirPlay mirroring, and projector setup
---

# Demo Prep

Pre-demo checklist. Run through this before any management or stakeholder presentation.

## Backend

- [ ] Flask server running on http://localhost:5000
  ```powershell
  cd C:\Users\Hp\projects\NeverExpire-PoC\backend
  .\venv\Scripts\Activate.ps1
  flask --app neverexpire run --debug
  ```
- [ ] `ANTHROPIC_API_KEY` is set (needed for AI document extraction demo)
- [ ] Demo data is seeded — open http://localhost:5000/api/v1/dashboard in browser, should return JSON with documents
- [ ] If DB is empty: `python -m neverexpire.db.seed_demo`

## Web

- [ ] Vite dev server running on http://localhost:5173
  ```powershell
  cd C:\Users\Hp\projects\NeverExpire-PoC\web
  npm run dev
  ```
- [ ] Log in with demo credentials and confirm dashboard loads
- [ ] Browser console has zero red errors
- [ ] Browser window is maximised and zoom is at 100%

## Mobile (iPhone)

- [ ] Expo Go app is installed on iPhone
- [ ] Phone and laptop are on the same WiFi (or laptop is connected to iPhone hotspot)
- [ ] Expo server running:
  ```powershell
  cd C:\Users\Hp\projects\NeverExpire-PoC\mobile
  npx expo start
  ```
- [ ] App loads on phone via QR code scan
- [ ] 5KPlayer is open on laptop with AirPlay receiver enabled (for screen mirroring to projector)
- [ ] iPhone Screen Mirroring → laptop name selected in Control Centre

## Projector

- [ ] Laptop connected to projector via HDMI
- [ ] Display mode: Extend (not Mirror) so you can see your notes on laptop while projector shows the app
- [ ] Test that projector shows the correct screen before the meeting starts

## Presentation order (suggested)

1. Open `docs/product-roadmap.html` in browser — walk through current features and roadmap
2. Switch to web app — show dashboard, document list, AI extraction
3. Switch to iPhone mirror (5KPlayer) — show mobile app, same data in demo mode
4. Return to roadmap HTML — walk through planned sprints and future vision

## Risks

- **Venue WiFi blocks AirPlay**: use iPhone hotspot → connect laptop to it
- **Railway backend is live** but SQLite is ephemeral — do NOT redeploy during demo as data will be lost. Use local Flask server for the demo.
