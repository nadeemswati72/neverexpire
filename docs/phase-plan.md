# NeverExpire V2 — Phase Plan

## Overview
| Phase | Name | Duration | Focus |
|-------|------|----------|-------|
| 0 | Foundation | 1 week | Repo structure, backend API skeleton, DB setup |
| 1 | Auth + Core API | 1 week | JWT auth, all CRUD endpoints working |
| 2 | Mobile MVP | 2 weeks | React Native screens matching glassmorphic design |
| 3 | Web MVP | 2 weeks | React + Vite dashboard matching design |
| 4 | Advanced Features | 2 weeks | Push notifications, AI extraction in mobile/web, reminders |
| 5 | Polish + Deploy | 1 week | CI/CD, TestFlight, Play Console internal, web hosting |

## Jira
- Site: neverexpire.atlassian.net
- V2 Project: TBD (new board to be created)
- V1 Project: SCRUM (do not add V2 tickets here)

## Phase 0 Tasks (Foundation)
- [ ] P0-1: Copy V1 backend package, strip Jinja routes, keep core logic
- [ ] P0-2: Create `requirements.txt`, venv, DB init script
- [ ] P0-3: API blueprint skeleton (`/api/v1/`) with health check
- [ ] P0-4: Initialize fresh Expo project in `mobile/`
- [ ] P0-5: Initialize React + Vite project in `web/`
- [ ] P0-6: GitHub Actions CI workflow (lint + test on push)
