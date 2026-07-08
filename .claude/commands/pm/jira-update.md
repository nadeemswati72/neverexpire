---
description: Transition Jira tickets and add platform tracking notes — use immediately when any task is done
---

# Jira Update

Transition one or more Jira tickets and add platform tracking notes. Use immediately when a task is completed — never batch at end of session.

## Project details

- **Workspace**: neverexpire.atlassian.net
- **Project key**: SCRUM
- **Cloud ID**: 62fb70db-e788-45fe-a6cd-5d7b46eb7ea2
- **Transition IDs**: To Do=11 | In Progress=21 | In Review=31 | Done=41

## Steps

1. Ask the user: which ticket(s) and which status?

2. For each ticket, call `transitionJiraIssue` with the appropriate transition ID.

3. Add a comment or update the description with the platform tracking line:
   ```
   Platforms: Web ✓ | iOS ✓ | Android ✓
   ```
   Only mark a platform ✓ if it has actually been tested. Use ⚠ for built-but-unverified, ✗ for not built.

4. A ticket is NOT Done until it works on ALL targeted platforms.

## Rules

- Close tickets immediately when work is done — never batch
- Every new feature needs a ticket created AND closed in the same session
- Sprint 6 tickets (SCRUM-76 to SCRUM-86) are the current active sprint
