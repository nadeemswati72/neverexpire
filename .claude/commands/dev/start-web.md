---
description: Start the React + Vite web dev server on http://localhost:5173
---

# Start Web

Start the React + Vite web development server.

## Steps

1. Run in PowerShell:
```powershell
cd C:\Users\Hp\projects\NeverExpire-PoC\web
npm run dev
```

2. The app opens at **http://localhost:5173**

3. The web app talks to the backend at `http://localhost:5000`. Confirm the backend is also running (`/dev:start-backend`), otherwise login will fail.

4. JWT token is stored in `localStorage` as `ne_token`. If the app shows a blank screen or redirects to `/login` unexpectedly, open DevTools → Application → Local Storage and check the token is present.

## After any component change

Always do all three:
1. `npm run build` — catches TypeScript/import errors
2. Open the browser and confirm the page actually renders
3. Check the browser console — a clean build with a blank page means a runtime ReferenceError (variable scope bug)

## Common issues

- `npm install` first if `node_modules` is missing
- If port 5173 is in use, Vite will automatically try 5174 — watch the terminal output
