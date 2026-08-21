Status: Complete
Commit: df46be7e feat(web): generate persisted training weeks with AI
Tests: 5 files, 9 tests passed (modal, page, store, mapper, /plans regression)
Format: Prettier check passed for all Task 9 files
Type-check: repository-wide check remains blocked by pre-existing unrelated errors; no Task 9 errors matched
Concern: task-9-brief.md is stale and describes ExerciseProgressSheet, so the direct task description was used
Push: Not pushed
Path: .superpowers/sdd/task-9-report.md

## High finding follow-up

Status: Complete
Fix: Generated previews remain local to the modal; `store.week` changes only after Apply.
Discard: Back and close clear the local preview without changing the active week.
Tests: 2 files, 3 tests passed (modal preview isolation and training page).
Push: Not pushed
