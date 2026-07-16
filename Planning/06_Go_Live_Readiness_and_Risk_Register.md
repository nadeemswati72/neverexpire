# NeverExpire — Go-Live Readiness & Risk Register v1.0

**Scope decision (confirmed with Product Owner):** a private beta for a handful of personally-invited real families — not a public launch. Web goes live for real use; mobile goes to real families via TestFlight. Free at launch. Budget: ~$100/month available for new infrastructure, though Phase A is expected to cost far less than that at this scale.

## 1. What "Go Live" Means Here

| Dimension | Decision |
|---|---|
| Audience | A handful of invited real families (not public) |
| Web | Goes live for real use |
| Mobile | Real testing via TestFlight, not App Store/Play Store yet |
| Monetization | Free — no billing required at launch |
| Registration | Self-registration stays open, must be fully secure (not manual/invite-only onboarding) |
| Social login (Google/Facebook/Apple) | Evaluated, **deferred** — see Section 4 |
| Data-loss tolerance | Zero — real families' documents must not be lost, hence the DB migration is in Phase A, not deferred |

## 2. Phase A — Required Before Go-Live

| # | Item | Solution | Status |
|---|---|---|---|
| A1 | Database persistence | Migrate to Postgres on **Neon** (neon.tech, free tier). Code-side support built and verified (SQLite fallback intact, Postgres connection path proven). | 🟡 Code ready — waiting on a Neon connection string |
| A2 | Self-registration security | Rate limiting on login/register (`flask-limiter`), real email-based password reset flow (token + email), production `SECRET_KEY` audited. | 🟢 Done — verified end-to-end |
| A3 | Reminder email routing | Each family's digest now goes to their own real email address; demo accounts still redirect safely to the test inbox. | 🟢 Done — verified end-to-end |
| A4 | Mobile web responsiveness | Collapsible/hamburger sidebar below ~768px, verified at both breakpoints. | 🟢 Done — verified end-to-end |
| A5 | Minimal privacy note | Short private-beta disclosure added to Login and Register pages. | 🟢 Done |
| A6 | TestFlight setup | Apple Developer Program enrollment ($99/year), build submission, external-tester invite. | 🔴 Waiting on Apple Developer account enrollment |

## 3. Phase B — Deferred Until Beyond This Group

Not required for a handful of personally-invited families; revisit before any wider rollout.

| Item | Why it can wait here |
|---|---|
| Move file storage off personal Google Drive to a cloud bucket (S3/R2/GCS) | Legal/liability exposure is much lower with people the Product Owner personally knows and invited, versus the general public |
| Switch reminder email off personal Gmail SMTP to a transactional API | Current volume is far under personal Gmail's sending limits |
| Sentry / structured logging | With a handful of users, issues can be caught by direct contact with the Product Owner; still cheap to add early if time allows |
| Fix APScheduler's single-worker limitation | Irrelevant until running more than one gunicorn worker, which isn't needed at this scale |
| Full legal-reviewed Privacy Policy / Terms of Service | The Phase A one-paragraph note covers a private beta of known people; real legal review is needed before any wider audience |
| Email verification on registration | Lower priority while the group is small and personally known to the Product Owner; revisit alongside wider rollout |

## 4. Social Login (Google / Facebook / Apple) — Noted, Not Built for This Launch

Evaluated at the Product Owner's request; deliberately deferred rather than scoped into Phase A, because it is realistically its own small project rather than a quick add:

- **Google Sign-In** — straightforward, roughly a day of work including testing.
- **Apple Sign In** — important constraint to remember when this is picked back up: Apple's App Store review guidelines **require** offering "Sign in with Apple" if any other third-party social login (Google/Facebook) is offered on an iOS app. Since mobile is heading toward TestFlight and eventually the App Store, adding Google or Facebook login later means Apple Sign In effectively comes with it, not as a separate optional item.
- **Facebook Login** — standard OAuth, but Meta's app review can add lead time depending on requested permissions.
- Each provider needs its own developer console registration, a backend token-exchange endpoint, and separate frontend flows for web and mobile (mobile OAuth redirect handling is more involved than web).

**Recommendation when revisited:** treat all three as one combined workstream (not three independent quick adds), and schedule it after email/password registration has been live and stable for the initial family group.

## 5. Operational Readiness (Not a Customer Manual)

A traditional user manual has low value for a family-facing consumer app — real users don't read them. What matters instead:

- A short in-app explanation of the sharing/watermark trust model at first use — the one genuinely non-obvious, differentiating feature.
- Mobile already has a real Help/FAQ screen; worth mirroring the same content to web.
- **Higher priority than either of the above**: an internal ops runbook for the Product Owner — how to restore the database from a Neon backup, how to manually trigger a reminder digest, how to reset a locked-out user directly if the self-service flow ever fails, how to rotate credentials (Gmail app password, JWT secret, Google OAuth token). At this scale, the Product Owner is the only operator, and this is what actually reduces operational risk during and after launch.

## 6. Summary Risk Table

| ID | Risk | Severity | Status |
|---|---|---|---|
| A1 | Real data lost on redeploy | Critical | 🟡 Code ready — waiting on Neon connection string |
| A2 | Account takeover / lockout with no recovery | High | 🟢 Resolved |
| A3 | Reminders not reaching real families | High | 🟢 Resolved |
| A4 | Broken mobile web experience | Medium–High | 🟢 Resolved |
| A5 | No disclosure of data handling | Medium | 🟢 Resolved |
| A6 | Mobile testing limited to one device | Medium | 🔴 Waiting on Apple Developer enrollment |
| B1–B4 | Storage/email vendor maturity, observability, scheduler scaling | Low at this scale | Deferred — Phase B |
| — | Social login absent | Low (evaluated, deliberately deferred) | Noted — Section 4 |

*Updated after implementation: four of six Phase A items are built, verified end-to-end, and merged. The remaining two (A1, A6) are ready on the code/process side and are waiting on two account-creation steps only the Product Owner can perform (a Neon signup, and Apple Developer Program enrollment).*
