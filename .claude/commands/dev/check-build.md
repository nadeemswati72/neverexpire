---
description: Run npm run build then verify the web app actually renders in the browser with no console errors
---

# Check Build

Run a full build verification for the web app and confirm runtime rendering. Use after any batch of component or logic changes.

## Steps

1. Run the TypeScript + Vite build:
```powershell
cd C:\Users\Hp\projects\NeverExpire-PoC\web
npm run build
```

2. If the build fails: fix the reported errors before proceeding. Do not skip.

3. If the build passes: start the dev server and open the browser:
```powershell
npm run dev
```
Navigate to **http://localhost:5173** and confirm the page actually renders — a clean build can still produce a blank page if there is a runtime ReferenceError.

4. Open browser DevTools → Console. There must be zero red errors.

## Why this matters

`npm run build` catches syntax and import errors but does NOT catch runtime variable scope bugs. A sub-component using a variable from a parent scope without it being passed as a prop will build cleanly but crash the page silently at runtime. The only way to catch it is to open the browser.

## Batch size rule

Maximum 4–5 files changed per commit when writing new components. Run this check after each batch before writing more files.
