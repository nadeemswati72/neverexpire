---
description: Pull current sprint from Jira and summarise Done / In Progress / Blocked against the phase plan
---

# Sprint Status

Summarise the current sprint status across Jira, code, and docs.

## Steps

1. Query Jira for all tickets in the current sprint using JQL:
   ```
   project = SCRUM AND sprint in openSprints() ORDER BY status ASC
   ```

2. Group tickets by status: Done / In Progress / In Review / To Do / Blocked

3. Read `docs/phase-plan.md` to cross-check what the sprint plan says vs what Jira shows.

4. Report a concise summary:
   - What is Done this sprint
   - What is In Progress
   - What is blocked or not started
   - Any tickets in Jira that don't appear in the phase plan (or vice versa)

5. Flag any ticket that is marked Done in Jira but missing the platform tracking line in its description.

## Output format

```
SPRINT 6 — [date]

✅ Done (N)
  - SCRUM-XX: [title]

🔄 In Progress (N)
  - SCRUM-XX: [title]

⏳ To Do (N)
  - SCRUM-XX: [title]

⚠ Gaps / Issues
  - [any mismatches or missing platform notes]
```
