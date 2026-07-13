# Habit Tracker — Planning Package

> NeverExpire V2 · created July 2026 · status: **planned, not started**
> Concept background: [`../habit-tracker-research.html`](../habit-tracker-research.html)

Complete implementation planning for the Habit Tracker feature: 4 phases, 15 one-week sprints, 61 user stories (202 points), solo + Claude Code.

## Reading order

| # | File | What it is | Format |
|---|------|-----------|--------|
| 1 | [01-implementation-plan.html](01-implementation-plan.html) | Master plan: phases, gantt timeline, dependencies, Definition of Done, rollout | HTML |
| 2 | [02-sprint-plan.html](02-sprint-plan.html) | All 15 sprints: goals, stories, technical notes, verification checklists, exit criteria | HTML |
| 3 | [03-user-stories.html](03-user-stories.html) | 61 stories in 14 epics with acceptance criteria, points, platform tags (Jira-ready) | HTML |
| 4 | [04-status-board.html](04-status-board.html) | **Living kanban** — the only file that changes during the build | HTML |
| 5 | [05-visual-dashboard.html](05-visual-dashboard.html) | Dashboard mockup: today strip, streak hero, heatmap, category rings, charts | HTML |
| 6 | [06-visual-reminders.html](06-visual-reminders.html) | Notification mockups: Done/Snooze, batching, quiet hours, medication re-fire | HTML |
| 7 | [07-visual-streaks.html](07-visual-streaks.html) | Streak growth stages, freeze/repair/vacation mechanics, milestone celebration | HTML |
| 8 | [ai-prompts.md](ai-prompts.md) | System prompts, JSON schemas, post-filter rules, red-team suite, cost notes | MD |
| 9 | [claude-skills.md](claude-skills.md) | Proposed `.claude/skills/` for the dev workflow (story-done, sprint-close, phase-gate, ai-guardrails) | MD |
| 10 | README.md | This index | MD |

## Key decisions baked into the plan

- **Personal scope** — habits belong to the account owner (`user_id`), never family members
- **Mobile-first** — web gets a read-mostly companion view in Sprint 15 only
- **Phase gates** — Phase 1 must hit ≥40% D21 retention before Phase 2 ships; each phase earns the next
- **No medical advice, by construction** — medication data excluded from all AI paths at the query layer; post-filter on every AI output; red-team suite gates every AI story
- **Feature flag** — `habits_enabled` per user from Sprint 1
- **Streak math backend-only** — mobile/web display, never recompute

## Update workflow during the build

1. Story status changes → edit the `STORIES` array in `04-status-board.html`
2. Phase gate measured → fill the gate table in `04-status-board.html`
3. Sprint summaries → HTML comment atop `04-status-board.html` (written by the `habit:sprint-close` skill)
4. Plan changes (scope, re-sequencing) → edit `01`/`02`/`03` and note the change in the commit message
5. Jira ticket creation from stories = separate explicit step, triggered by Nadeem
