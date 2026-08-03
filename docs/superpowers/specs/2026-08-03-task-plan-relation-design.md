# Task ↔ Plan relation (API-first)

**Date:** 2026-08-03  
**Status:** Approved for planning  
**Product:** Ritmo API (`apps/api`)  
**Slice:** A — model + API only (UI `/planes` stays mock until a later slice)

## Problem

1. Product UI treats **planes** (study goals, habits, exams) as containers of tasks (`/planes`, former “proyectos”), but the backend has **no `Plan` model**.
2. Frontend `stores/projects.ts` holds mock plans and mock tasks with `projectId`; real `Task` in Prisma only relates to `User`, `Category`, and `WorkSession`.
3. API route constants still mention `/projects` with no module implementation.
4. “Plan” is overloaded elsewhere (WFITNESS weekly training, study-plan pages). This spec covers **only** the goal/container Plan for tasks.

## Goals

- Introduce first-class **`Plan`** entity owned by a user.
- Optional **`Task.planId`**: a task may be free-standing or belong to one plan; a plan has many tasks.
- Keep **`Category` independent** of Plan (task may have either, both, or neither).
- Soft-delete a plan **and** soft-delete its tasks in one transaction.
- CRUD API under `/plans` plus list tasks by plan; extend task create/update/list with optional `planId`.
- Compute plan progress/stats on read (do not store denormalized progress on `Plan`).

## Non-goals

- Wiring `/planes` UI or replacing the Pinia mock store.
- Task ↔ Plan N:N, plan hierarchy, plan members/sharing.
- Changing WFITNESS weekly training plans or study-plan pages.
- Hard-delete, restore/undelete of plans or tasks.
- Soft-deleting or mutating `WorkSession` rows when cascading task soft-delete.
- Replacing or removing `Category`.

## Decisions (locked)

| Topic | Choice |
|--------|--------|
| Approach | New `Plan` model + module; optional `Task.planId` |
| Canonical name | **Plan** (routes `/plans`; not Project) |
| Cardinality | Plan 1 → N Task; `planId` optional on Task |
| Category | Independent of Plan |
| Delete | Soft-delete plan **and** its non-deleted tasks |
| First slice | Model + API only |
| Progress | Derived: `totalTasks`, `pendingTasks`, `progress` from non-deleted tasks |
| Orphan API constants | Rename/replace `PROJECTS` → `PLANS` |

## Data model

### `Plan` (`plans`)

| Field | Notes |
|--------|--------|
| `id` | `cuid` |
| `userId` | Owner; cascade with user |
| `name` | Required, `VarChar(255)` |
| `description` | Optional |
| `status` | Enum `PlanStatus`: `planned \| active \| paused \| completed` |
| `color` | Optional hex / token for future UI |
| `icon` | Optional icon key for future UI |
| `isDeleted`, `deletedAt` | Soft-delete |
| `createdAt`, `updatedAt` | Standard |

Indexes: `[userId, isDeleted]`, `[userId, status]`.

### `Task` change

- Add `planId String?` → `Plan?` relation.
- Prisma FK `onDelete: SetNull` (safety if a hard delete ever occurs).
- Application soft-delete cascade is authoritative for product behavior.

### Stats (response-only, not columns)

For each plan in list/detail:

- `totalTasks` — count of tasks with `planId` and `isDeleted: false`
- `pendingTasks` — subset where `status !== completed` (same notion as UI “pending”; `cancelled` counts as pending for this counter unless we later split archives)
- `progress` — integer 0–100 = `floor(100 * completedCount / totalTasks)` where `completedCount` is `status === completed`; `0` if `totalTasks === 0`

## API

Auth required; all queries scoped to authenticated `userId`.

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/plans` | List non-deleted plans + stats |
| `POST` | `/plans` | Create plan |
| `GET` | `/plans/:id` | Detail + stats; 404 if missing/foreign/deleted |
| `PATCH` | `/plans/:id` | Update plan fields |
| `DELETE` | `/plans/:id` | Soft-delete plan and its tasks (transaction) |
| `GET` | `/plans/:id/tasks` | Non-deleted tasks for that plan |

### Task endpoints (existing)

- Create / update accept optional `planId`.
- Validate: plan exists, same user, `isDeleted: false` → else 404. Malformed body fields → 400 via existing DTO validation.
- `FrontendTask` includes `planId?: string | null`. Do not add `planName` in slice A.
- List endpoints continue to exclude `isDeleted: true` tasks (including those cascade-deleted via plan).

### Module layout

`apps/api/src/modules/plans/` — controller → service → Prisma, mirroring `tasks`.

## Soft-delete cascade

In one transaction:

1. Load plan for user with `isDeleted: false`; else 404.
2. Set plan `isDeleted = true`, `deletedAt = now`.
3. Soft-delete all tasks where `planId = plan.id` and `isDeleted = false`.
4. Do not modify `WorkSession` rows.

## Error handling

| Case | Result |
|------|--------|
| Plan not found / other user / already deleted | 404 |
| Assign task to invalid/foreign/deleted plan | 404 |
| Malformed request body | 400 (DTO validation) |
| Unauthorized | existing auth middleware |

## Testing

DB integration tests (Vitest + real Postgres), same style as `task.service.db.test.ts`:

- Plan CRUD and ownership isolation
- Cascade soft-delete hides plan tasks from `getTasks` / `getPlanTasks`
- Task `planId` assign/clear; reject bad plan
- Stats match non-deleted tasks
- Cross-user plan access returns 404

## Out of scope follow-ups

- Replace web mock store and `/planes` pages with API.
- Selector de plan en Today/Task edit UI.
- Undelete / archive-without-deleting-tasks policy change.
