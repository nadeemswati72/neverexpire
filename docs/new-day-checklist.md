# NeverExpire V2 — New Day Checklist

Run through this at the start of every working session.

---

## 1. Verify Live Deployments (30 seconds)

| Check | URL | Expected |
|-------|-----|----------|
| Web app | https://neverexpire-poc.vercel.app | Login page loads |
| Backend health | https://neverexpire-backend-production.up.railway.app/api/v1/health | `{"data":{"status":"ok"}}` |
| Railway dashboard | https://railway.app/dashboard | Service shows "Active" |
| Vercel dashboard | https://vercel.com/never-expire/neverexpire-poc | Latest deployment "Ready" |

---

## 2. Start Local Services (if doing development)

```powershell
# Terminal 1 — Backend
cd C:\Users\Hp\projects\NeverExpire-PoC\backend
.\venv\Scripts\python run.py
# Verify: http://localhost:5000/api/v1/health

# Terminal 2 — Web
cd C:\Users\Hp\projects\NeverExpire-PoC\web
npm run dev
# Verify: http://localhost:5173

# Terminal 3 — Mobile (only if doing mobile work)
cd C:\Users\Hp\projects\NeverExpire-PoC\mobile
npx expo start --clear
# Scan QR with Expo Go on phone
```

---

## 3. Git Status Check

```powershell
cd C:\Users\Hp\projects\NeverExpire-PoC
git status
git branch          # confirms which branch you're on
git log --oneline -5  # last 5 commits
```

**Current branches:**
- `v2-poc` — deployed to Vercel + Railway. Do NOT break this.
- `sprint5-mobile` — mobile app, not yet merged. Development happens here.

---

## 4. Tool Connections

| Tool | How to verify | Action if broken |
|------|--------------|-----------------|
| GitHub MCP | Check if `mcp__github__*` tools are available | Set `GITHUB_PERSONAL_ACCESS_TOKEN` env var and restart |
| Jira/Atlassian MCP | Check if `mcp__atlassian__*` tools are available | Login pending — run `mcp__atlassian__authenticate` |
| SQLite MCP | Points to `backend/data/neverexpire.db` | Start backend first so DB exists |

---

## 5. Review Yesterday's Open Items

Check `docs/phase-plan.md` backlog section for:
- Any items moved to "in progress" that need follow-up
- Anything blocked that might be unblocked

---

## 6. Constraints Reminder

⚠️ **Railway redeploy is BLOCKED** during PoC phase. Do not push backend changes that require redeploy.

⚠️ **sprint5-mobile not merged yet** — mobile development goes to `sprint5-mobile`, NOT `v2-poc`.

⚠️ **No model change** — currently on `claude-sonnet-4-6` (haiku revert blocked by Railway freeze).

---

## 7. Sleep Mode (before leaving for extended periods)

```powershell
# Disable sleep (for long unattended sessions)
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0

# Restore sleep when done
powercfg /change standby-timeout-ac 30
powercfg /change standby-timeout-dc 15
```
