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

| # | Item | Why it's a blocker at this scale | Solution | Effort |
|---|---|---|---|---|
| A1 | Database persistence | Railway's current SQLite is ephemeral — wipes on every redeploy/restart. A handful of real families losing real documents on day one is unacceptable, regardless of scale. | Migrate to Postgres on **Neon** (neon.tech) — genuine ongoing free tier, not a trial credit. SQLAlchemy already abstracts the schema; this is a connection-string + driver change, not a rewrite. Confirm current free-tier limits on Neon's pricing page before wiring up (limits can shift). | Small–Medium |
| A2 | Self-registration security | Registration stays open to the public URL, so it must be genuinely secure, not just functional. | Rate limiting on login/register (`flask-limiter`), a real email-based password reset flow (token + email, not the current stub alert), confirm production `SECRET_KEY` is a real value and not the insecure code-level default. | Medium |
| A3 | Reminder email routing | Every reminder currently routes to one test inbox regardless of whose data it is — real families need their own reminders in their own inbox. | Fix the recipient logic so each family's digest goes to their own real email address. Can stay on Gmail SMTP for now at this volume — the routing logic is the fix, not the provider. | Small |
| A4 | Mobile web responsiveness | Confirmed broken: the sidebar takes ~64% of a phone screen width. Invited families will very likely open the web app on a phone before the native app is ready. | Collapsible/hamburger sidebar below ~768px. | Medium |
| A5 | Minimal privacy note | Real families' passport/Emirates ID/visa numbers are being stored; some disclosure is warranted even for a private beta. | One short paragraph: what's stored, why, that it's a private beta. Not a full legal ToS (that's Phase B, see Section 3). | Small |
| A6 | TestFlight setup | Mobile testing needs to reach real families, not just Nadeem's own device. | Apple Developer Program enrollment ($99/year), build submission, external-tester invite. Apple's external-tester review typically takes 1–2 days (can vary) — this has a real lead time, unlike the other items above. | Medium (+ external review wait) |

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
| A1 | Real data lost on redeploy | Critical | Planned — Phase A |
| A2 | Account takeover / lockout with no recovery | High | Planned — Phase A |
| A3 | Reminders not reaching real families | High | Planned — Phase A |
| A4 | Broken mobile web experience | Medium–High | Planned — Phase A |
| A5 | No disclosure of data handling | Medium | Planned — Phase A |
| A6 | Mobile testing limited to one device | Medium | Planned — Phase A (TestFlight) |
| B1–B4 | Storage/email vendor maturity, observability, scheduler scaling | Low at this scale | Deferred — Phase B |
| — | Social login absent | Low (evaluated, deliberately deferred) | Noted — Section 4 |

*No infrastructure or code changes have been made as a result of this document — it records the go-live plan as discussed and agreed. Each Phase A item still requires its own explicit go-ahead before implementation begins.*
