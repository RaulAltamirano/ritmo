# Today Tasks Sync & Quality Refactor — Design Spec

**Date:** 2026-04-20  
**Scope:** `apps/web` — Today page task management  
**Approach:** Pinia store migration + bug fixes + edge-case tests

---

## Problem Statement

The `pages/today/index.vue` task system has 9 confirmed bugs spanning data loss on update, incorrect API synchronization, broken type exports, and unreachable UI actions. The root architectural issue is that `useActivities()` creates a new `ref<Activity[]>` on every call, making shared state impossible and tests unreliable.

---

## Architecture

### New: `stores/activities.ts` — `useActivitiesStore`

A Pinia setup-store (same pattern as `stores/projects.ts`) backed by the real REST API.

**State:**

```ts
const activities = ref<Activity[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetched = ref<Date | null>(null)
```

**Getters (computed):**

- `todayActivities` — alias of `activities` when populated via `fetchToday`; no client-side re-filter to avoid timezone double-dipping
- `pendingActivities` — `!isCompleted`
- `completedActivities` — `isCompleted`
- `highPriorityActivities` — `priority.toLowerCase() === 'high' || priority.toLowerCase() === 'urgent'`

**Actions:**

- `fetchToday()` — `GET /activities/today`, replaces `activities`
- `create(data)` — `POST /activities`, pushes returned item
- `update(id, data)` — `PUT /activities/:id`, replaces item in array by id; no mutation on API failure
- `remove(id)` — `DELETE /activities/:id`, filters array; no mutation on API failure
- `markCompleted(id, completed?)` — thin wrapper over `update`
- `reset()` — clears all state (used by logout and tests)

**Error contract:** every action returns `{ success: boolean; error?: string; data?: T }`. The store sets `error` ref AND returns the result so callers can branch without reading store state.

### Backward-compat shim: `composables/tasks/useActivities.ts`

The file becomes a one-liner that re-exports the store so existing component imports continue to work without change during migration:

```ts
export const useActivities = () => useActivitiesStore()
```

This shim is intentionally temporary; it can be removed once all consumers import directly from the store.

---

## Bug Fixes

### Critical — data loss / crashes

| #   | Location                                   | Bug                                                                           | Fix                                                                      |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | `useActivities`                            | `getActivitiesByDateRange` references `endOfDay` out of scope                 | Replace with `endDate` parameter                                         |
| 2   | `pages/today/index.vue` `handleUpdateTask` | Only sends `title/description/category`; drops `priority`, `tags`, `duration` | Use `taskToActivity` adapter to map all fields before calling `update`   |
| 3   | `pages/today/index.vue` `handleQuickTask`  | `if (newActivity)` is always truthy even on `{ success: false, error }`       | Change to `if (newActivity?.success)`                                    |
| 4   | `pages/today/index.vue` `loadSampleTasks`  | Seeds 5 real DB rows in production when today is empty                        | Guard with `import.meta.env.DEV`; remove from production builds entirely |

### Synchronization

| #   | Location                                       | Bug                                                             | Fix                                                                                                       |
| --- | ---------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 5   | `TaskList → TodayContent → TodayLayout → page` | `add-note` emit chain is broken; notes never reach the API      | Wire `@add-note` through `TodayContent` and `TodayLayout`; page calls `update(id, { description: note })` |
| 6   | `useActivities` `highPriorityActivities`       | Compares uppercase strings against lowercase Prisma enum values | Normalize with `.toLowerCase()` before comparison                                                         |

### Type system

| #   | Location                             | Bug                                                                                                 | Fix                                                                   |
| --- | ------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 7   | `types/task.ts` / `useActivities.ts` | `Activity` type is defined inline in the composable but not exported as a named type from `@/types` | Move `Activity` to `types/activity.ts`, export it, update all imports |

### UX / silent data loss

| #   | Location                | Bug                                                                    | Fix                                                                                                                                         |
| --- | ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 8   | `pages/today/index.vue` | `completionFeedbackByTaskId` is collected but never persisted or sent  | Send feedback `mood` / `energyAfter` as fields in the `markCompleted` call's `description` (JSON-encoded) until a dedicated endpoint exists |
| 9   | `TodayContent.vue`      | `delete-task` event is never forwarded; no delete button in `TaskCard` | Add `@delete-task` emit through `TodayContent`, add delete affordance to `TaskCard` (icon button, confirm on click)                         |

---

## New Type: `types/activity.ts`

```ts
export interface Activity {
  id: string
  title: string
  description?: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isCompleted: boolean
  startTime: string
  endTime: string
  duration: number
  category?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}
```

Priority values are lowercase to match Prisma/API output. The adapter handles the Spanish UI mapping.

---

## Tests

### `tests/stores/activities.test.ts`

All tests use `createPinia()` from `@pinia/testing` (or real Pinia via `setActivePinia`) and mock `useHttpClient` via `vi.mock`.

**Fetch:**

- Successful fetch replaces `activities`, clears `error`, sets `loading` to `false`
- Network failure sets `error`, leaves `activities` unchanged, `loading` false
- 401 response does not crash, sets `error`

**Create:**

- Success pushes returned item to `activities`, returns `{ success: true }`
- Empty title: returns `{ success: false }`, does not call API, does not modify `activities`
- API failure: `activities` unchanged, returns `{ success: false, error }`

**Update:**

- Success replaces correct item by id in `activities`
- Unknown id: returns `{ success: false }`, does not crash
- API failure: `activities` reverts to pre-call state (pessimistic: UI only updates after API confirms success)

**Remove:**

- Success removes item from `activities`
- Unknown id: `activities` unchanged, no crash
- API failure: `activities` reverts to pre-call state (pessimistic)

**Computed getters:**

- `highPriorityActivities` with lowercase `'high'` and `'urgent'` values → correctly included
- `highPriorityActivities` with `'medium'` → excluded
- `todayActivities` with activities from yesterday → excluded
- `todayActivities` with activities from tomorrow → excluded

**Concurrency:**

- Two simultaneous `fetchToday` calls do not duplicate items in `activities`

**Reset:**

- `reset()` clears `activities`, `error`, `loading`, `lastFetched`

### `tests/composables/useActivityAdapter.test.ts`

- `activityToTask` maps `'urgent'` → `'alta'`
- `activityToTask` maps unknown priority → `'media'` (fallback)
- `activityToTask` with no `description` → `notes` is `''`, not `undefined`
- `taskToActivity` parses `'25m'` duration string → `25`
- `taskToActivity` with invalid `estimatedTime` → uses fallback `25`, no crash
- `activitiesToTasks([])` → returns `[]`
- `getActivitiesByDateRange` with `endDate < startDate` → returns `[]`, no crash

### `tests/pages/today.test.ts`

- `handleQuickTask('')` — does not call `store.create`
- `handleQuickTask` when API fails — `isQuickTaskLoading` returns to `false`
- `handleUpdateTask` — all Task fields (priority, tags, duration) reach `store.update`
- `handleDeleteTask` — calls `store.remove` with the correct id
- `loadSampleTasks` in production (`import.meta.env.DEV = false`) — does not call `store.create`
- `handleCompleteTaskWithFeedback` when store returns error — calls `reject`, not `resolve`

---

## File Changeset

| Action      | File                                                                         |
| ----------- | ---------------------------------------------------------------------------- |
| **New**     | `apps/web/types/activity.ts`                                                 |
| **New**     | `apps/web/stores/activities.ts`                                              |
| **New**     | `apps/web/tests/stores/activities.test.ts`                                   |
| **New**     | `apps/web/tests/composables/useActivityAdapter.test.ts`                      |
| **New**     | `apps/web/tests/pages/today.test.ts`                                         |
| **Replace** | `apps/web/composables/tasks/useActivities.ts` → shim                         |
| **Fix**     | `apps/web/composables/tasks/useActivityAdapter.ts` (import + date range bug) |
| **Fix**     | `apps/web/pages/today/index.vue` (bugs 2, 3, 4, 5, 8)                        |
| **Fix**     | `apps/web/components/organisms/today/TodayContent.vue` (bug 9 forward)       |
| **Fix**     | `apps/web/components/molecules/TaskCard.vue` (bug 9 delete affordance)       |

---

## Out of Scope

- Persisting task reorder (no order field in API schema)
- Dedicated feedback endpoint (no API route exists yet)
- Timer store ↔ API completion sync (separate concern)
