# Habit Tracker — Claude Code Skills for the Dev Workflow

> Planning package 9/10 · NeverExpire V2 · July 2026
> Proposed skills to add under `.claude/skills/` once the build starts.
> They encode the working agreements from `01-implementation-plan.html` §6 (Definition of Done)
> so quality checks are one command instead of remembered discipline.

The project already has `dev:*`, `pm:*`, `review:*`, `test:*` skills. These four are habit-feature-specific additions; naming follows the same pattern.

---

## 1. `habit:story-done` — close out a single story

**Trigger:** "story HT-xxx is done", "/habit:story-done HT-204"

**What it does (checklist the skill walks through):**
1. Re-read the story's acceptance criteria in `docs/habit-tracker/03-user-stories.html` and confirm each one explicitly.
2. Variable-scope check on every touched React/RN component (no parent-scope variables without props — the blank-page bug class).
3. `npm run build` (web-touching stories) / Metro bundles clean (mobile) — then **render the actual screen** and check the console. Build passing ≠ runtime working.
4. Backend stories: `pytest` for the touched modules; API smoke via the `{data, error}` envelope.
5. Update `docs/habit-tracker/04-status-board.html` — set the story's `status` in the `STORIES` array to `done`.
6. If Jira tickets exist: transition with platform note `Platforms: iOS ✓ | Android ✓ | Web ✗` (only tick platforms actually verified).
7. Commit reminder: ≤ 4–5 files per commit for new components.

**Skill file sketch:**

```markdown
---
name: story-done
description: Close out a Habit Tracker story — AC check, scope check, build+render, board update, Jira note
---
Given a story ID (HT-xxx):
1. Open docs/habit-tracker/03-user-stories.html, locate the story, list its AC.
2. For each AC state PASS/FAIL with evidence (file, screen, test name).
3. Run the variable-scope check on all components changed for this story.
4. Run the build for affected platforms AND verify runtime render + clean console.
5. Edit docs/habit-tracker/04-status-board.html: set status:"done" for the ID.
6. If a Jira ticket exists, use pm:jira-update with the platform template.
Never mark done with any AC failing — report the gap instead.
```

---

## 2. `habit:sprint-close` — end-of-sprint gate

**Trigger:** "/habit:sprint-close 3", end of a sprint week

**What it does:**
1. Pull the sprint's story list from `02-sprint-plan.html`; verify every story is `done` on the status board (or explicitly carried over).
2. Run the sprint's **verification checklist** from the sprint card (device matrix tests, airplane-mode test, notification cap check — whatever that sprint defines).
3. Full `pytest` + `npm run build` + on-device render pass.
4. Merge the sprint branch; confirm clean `git status`.
5. Write a 5-line sprint summary (done / carried / learned) — appended as an HTML comment at the top of `04-status-board.html` so history lives with the board.
6. Remind: if this sprint ends a phase, run `habit:phase-gate` next.

---

## 3. `habit:phase-gate` — measure a phase gate before the next phase ships

**Trigger:** "/habit:phase-gate 1"

**What it does:**
1. Read the gate criterion from `01-implementation-plan.html` §3.
2. Query the metrics (SQLite MCP → events tables; e.g. D21 retention cohort for Phase 1).
3. Fill the measured value into the gate table in `04-status-board.html` with PASS/FAIL.
4. On FAIL: produce a short findings note (where users drop off, per the funnel events) instead of green-lighting the next phase.
5. Phases 2+: also run `habit:ai-guardrails` — a gate cannot pass with a red guardrail suite.

---

## 4. `habit:ai-guardrails` — run the red-team suite

**Trigger:** "/habit:ai-guardrails", automatically part of any AI-story close (HT-701/703/704/707/1002/1203)

**What it does:**
1. Run the pytest red-team suite implementing `ai-prompts.md` §7 (R1–R10) against the live dev backend.
2. Run post-filter fixture tests (§6 patterns, both reject and allow cases).
3. Verify the audit log wrote one row per call with correct verdicts.
4. Check the medication-exclusion invariant: a seeded medication habit must be absent from every AI input builder's output (query-layer test, not prompt test).
5. Report a one-screen PASS/FAIL table; any FAIL blocks the story/phase from closing.

---

## Existing skills that plug in (no new work needed)

| Existing skill | Where it's used in this feature |
|---|---|
| `dev:start-backend` / `dev:start-mobile` / `dev:start-web` | Every sprint's dev loop |
| `dev:check-build` | Step 3 of `habit:story-done` for web stories |
| `pm:jira-update` | Called by `habit:story-done` once Jira tickets exist |
| `pm:sprint-status` | Weekly status vs. this package's sprint plan |
| `review:review-api` | Before merging Sprint 1, 4, 6 backend branches |
| `review:review-mobile` | Before merging Sprint 2, 3, 9–12 mobile branches |
| `test:run-tests` | Inside `habit:sprint-close` |
| `test:feature-check` | At phase ends — plan vs. actual code gap scan |

---

## Suggested build order

Create `habit:story-done` and `habit:ai-guardrails` first (Sprint 1 — they shape daily work).
`habit:sprint-close` before the first sprint ends. `habit:phase-gate` any time before Sprint 4 closes.
