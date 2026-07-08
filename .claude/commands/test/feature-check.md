---
description: Cross-check the phase plan against actual code to find gaps — features listed as done but not implemented
---

# Feature Check

Compare the feature list in `docs/product-roadmap.html` and `docs/phase-plan.md` against the actual code to find gaps, missing implementations, or things marked done that aren't.

## Steps

1. Read `docs/phase-plan.md` — extract all features listed as Done in Sprints 0–5.

2. For each feature, verify it exists in the code:

   **Backend** (`backend/neverexpire/`):
   - Routes exist in `web/routes/`
   - DB models exist in `db/models/`
   - Relevant functions exist in `db/repository.py`

   **Web** (`web/src/`):
   - Page/component exists in `pages/` or `components/`
   - API call wired up in `api.ts`

   **Mobile** (`mobile/src/`):
   - Screen or component exists
   - Uses correct service/context layer (not direct AsyncStorage)

3. Report findings in three buckets:
   - ✅ **Confirmed**: feature exists in code as described
   - ⚠ **Partial**: backend done but web/mobile missing (or vice versa)
   - ❌ **Missing**: listed as done in plan but not found in code

4. Also flag any features found in code that are NOT in the plan or roadmap (undocumented work).

## Focus areas for Sprint 5 (most recently completed)

- Photo upload in manual document entry
- AI extraction with confidence scoring
- Watermarked file storage (`_wm` suffix)
- JWT auth on all protected routes
- Dashboard summary endpoint
- Mobile demo mode with seeded AsyncStorage data
