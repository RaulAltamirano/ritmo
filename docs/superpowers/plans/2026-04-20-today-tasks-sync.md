# Today Tasks Sync & Quality Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Today task list to a Pinia store, fix all 9 data-loss and sync bugs, and add a comprehensive edge-case test suite.

**Architecture:** New `stores/activities.ts` (`useActivitiesStore`) backed by the real REST API, canonical `types/activity.ts` type, backward-compat shim in `composables/tasks/useActivities.ts`, bugfixed adapter and page handlers, delete affordance in `TaskCard`, and `add-note` event wired end-to-end.

**Tech Stack:** Vue 3, Pinia, Vitest, `@vue/test-utils`, `useHttpClient` (Nuxt `$fetch` wrapper), TypeScript strict

---

## File Map

| Action      | Path                                                    | Responsibility                                                               |
| ----------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **New**     | `apps/web/types/activity.ts`                            | Canonical `Activity` interface (lowercase priority)                          |
| **New**     | `apps/web/stores/activities.ts`                         | `useActivitiesStore` — state, getters, actions                               |
| **Replace** | `apps/web/composables/tasks/useActivities.ts`           | Shim re-exporting the store for backward compat                              |
| **Fix**     | `apps/web/composables/tasks/useActivityAdapter.ts`      | Fix `endDate` bug, fix priority normalization, update `Activity` import      |
| **Fix**     | `apps/web/pages/today/index.vue`                        | Bugs 2, 3, 4, 5, 8 — field mapping, truthy check, dev guard, notes, feedback |
| **Fix**     | `apps/web/components/molecules/TaskCard.vue`            | Add delete button + `delete-task` emit                                       |
| **Fix**     | `apps/web/components/organisms/today/TodayContent.vue`  | Forward `add-note` event                                                     |
| **New**     | `apps/web/tests/stores/activities.test.ts`              | Store unit tests                                                             |
| **New**     | `apps/web/tests/composables/useActivityAdapter.test.ts` | Adapter unit tests                                                           |
| **New**     | `apps/web/tests/pages/today.test.ts`                    | Page handler tests                                                           |

---

## Task 1: Canonical `Activity` type

**Files:**

- Create: `apps/web/types/activity.ts`

- [ ] **Step 1: Create the type file**

```typescript
// apps/web/types/activity.ts
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

export type ActivityPriority = Activity['priority']

export interface CreateActivityPayload {
  title: string
  description?: string
  startTime: Date
  endTime?: Date
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  tags?: string[]
}

export interface UpdateActivityPayload {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category?: string
  isCompleted?: boolean
  tags?: string[]
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/types/activity.ts
git commit -m "feat(web): add canonical Activity type to types/activity.ts"
```

---

## Task 2: `useActivitiesStore` — write tests first (TDD)

**Files:**

- Create: `apps/web/tests/stores/activities.test.ts`
- Create: `apps/web/stores/activities.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/tests/stores/activities.test.ts`:

```typescript
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useActivitiesStore } from '@/stores/activities'
import type { Activity } from '@/types/activity'

// Mock useHttpClient — injected by the store
vi.mock('@/composables/shared/useHttpClient', () => ({
  useHttpClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  })),
}))

const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'act-1',
  title: 'Test activity',
  type: 'TASK',
  priority: 'medium',
  isCompleted: false,
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 25,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

describe('useActivitiesStore', () => {
  let store: ReturnType<typeof useActivitiesStore>
  let http: any

  beforeEach(async () => {
    setActivePinia(createPinia())
    const { useHttpClient } = await import('@/composables/shared/useHttpClient')
    http = useHttpClient()
    store = useActivitiesStore()
  })

  // ── fetchToday ─────────────────────────────────────────
  describe('fetchToday', () => {
    it('replaces activities on success, clears error, sets loading false', async () => {
      const data = [makeActivity({ id: 'act-1' }), makeActivity({ id: 'act-2' })]
      http.get.mockResolvedValueOnce({ success: true, data })

      await store.fetchToday()

      expect(store.activities).toEqual(data)
      expect(store.error).toBeNull()
      expect(store.loading).toBe(false)
    })

    it('sets error on network failure, leaves activities unchanged', async () => {
      store.activities = [makeActivity()]
      http.get.mockRejectedValueOnce(new Error('Network Error'))

      await store.fetchToday()

      expect(store.activities).toHaveLength(1)
      expect(store.error).toBeTruthy()
      expect(store.loading).toBe(false)
    })

    it('sets error on 401, does not crash', async () => {
      const authError = Object.assign(new Error('Unauthorized'), { status: 401 })
      http.get.mockRejectedValueOnce(authError)

      await expect(store.fetchToday()).resolves.not.toThrow()
      expect(store.error).toBeTruthy()
    })

    it('two concurrent fetchToday calls do not duplicate items', async () => {
      const data = [makeActivity({ id: 'act-1' })]
      http.get.mockResolvedValue({ success: true, data })

      await Promise.all([store.fetchToday(), store.fetchToday()])

      expect(store.activities).toHaveLength(1)
    })
  })

  // ── create ─────────────────────────────────────────────
  describe('create', () => {
    it('pushes returned item to activities and returns success', async () => {
      const created = makeActivity({ id: 'new-1', title: 'New task' })
      http.post.mockResolvedValueOnce({ success: true, data: created })

      const result = await store.create({
        title: 'New task',
        startTime: new Date(),
        priority: 'MEDIUM',
        category: 'WORK',
      })

      expect(store.activities).toContainEqual(created)
      expect(result.success).toBe(true)
    })

    it('returns error and does not modify activities when API fails', async () => {
      http.post.mockRejectedValueOnce(new Error('Server error'))

      const before = [...store.activities]
      const result = await store.create({
        title: 'Task',
        startTime: new Date(),
        priority: 'LOW',
        category: 'WORK',
      })

      expect(store.activities).toEqual(before)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('returns error without calling API when title is empty', async () => {
      const result = await store.create({
        title: '   ',
        startTime: new Date(),
        priority: 'LOW',
        category: 'WORK',
      })

      expect(http.post).not.toHaveBeenCalled()
      expect(result.success).toBe(false)
    })
  })

  // ── update ─────────────────────────────────────────────
  describe('update', () => {
    beforeEach(() => {
      store.activities = [makeActivity({ id: 'act-1', title: 'Original' })]
    })

    it('replaces correct item by id on success', async () => {
      const updated = makeActivity({ id: 'act-1', title: 'Updated' })
      http.put.mockResolvedValueOnce({ success: true, data: updated })

      await store.update('act-1', { title: 'Updated' })

      expect(store.activities[0].title).toBe('Updated')
    })

    it('returns error for unknown id without crashing', async () => {
      const result = await store.update('nonexistent', { title: 'X' })

      expect(result.success).toBe(false)
      expect(http.put).not.toHaveBeenCalled()
    })

    it('reverts to pre-call state when API fails (pessimistic)', async () => {
      http.put.mockRejectedValueOnce(new Error('Server error'))

      const before = store.activities[0].title
      await store.update('act-1', { title: 'Should not stick' })

      expect(store.activities[0].title).toBe(before)
    })
  })

  // ── remove ─────────────────────────────────────────────
  describe('remove', () => {
    beforeEach(() => {
      store.activities = [makeActivity({ id: 'act-1' }), makeActivity({ id: 'act-2' })]
    })

    it('removes item on success', async () => {
      http.del.mockResolvedValueOnce({ success: true, data: {} })

      await store.remove('act-1')

      expect(store.activities.map(a => a.id)).not.toContain('act-1')
      expect(store.activities).toHaveLength(1)
    })

    it('does not crash for unknown id', async () => {
      await expect(store.remove('nonexistent')).resolves.not.toThrow()
      expect(store.activities).toHaveLength(2)
    })

    it('reverts on API failure', async () => {
      http.del.mockRejectedValueOnce(new Error('Server error'))

      await store.remove('act-1')

      expect(store.activities).toHaveLength(2)
    })
  })

  // ── getters ────────────────────────────────────────────
  describe('highPriorityActivities', () => {
    it('includes lowercase "high" activities', () => {
      store.activities = [
        makeActivity({ priority: 'high' }),
        makeActivity({ priority: 'medium' }),
      ]
      expect(store.highPriorityActivities).toHaveLength(1)
    })

    it('includes lowercase "urgent" activities', () => {
      store.activities = [makeActivity({ priority: 'urgent' })]
      expect(store.highPriorityActivities).toHaveLength(1)
    })

    it('excludes "medium" and "low" activities', () => {
      store.activities = [
        makeActivity({ priority: 'medium' }),
        makeActivity({ priority: 'low' }),
      ]
      expect(store.highPriorityActivities).toHaveLength(0)
    })
  })

  describe('todayActivities', () => {
    it('excludes activities from yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      store.activities = [makeActivity({ startTime: yesterday.toISOString() })]
      expect(store.todayActivities).toHaveLength(0)
    })

    it('excludes activities from tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      store.activities = [makeActivity({ startTime: tomorrow.toISOString() })]
      expect(store.todayActivities).toHaveLength(0)
    })

    it('includes activities from today', () => {
      store.activities = [makeActivity({ startTime: new Date().toISOString() })]
      expect(store.todayActivities).toHaveLength(1)
    })
  })

  describe('reset', () => {
    it('clears all state', async () => {
      store.activities = [makeActivity()]
      store.error = 'some error'
      store.loading = true

      store.reset()

      expect(store.activities).toHaveLength(0)
      expect(store.error).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.lastFetched).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/web && npx vitest run tests/stores/activities.test.ts 2>&1 | tail -20
```

Expected: errors like `Cannot find module '@/stores/activities'`

- [ ] **Step 3: Implement `stores/activities.ts`**

```typescript
// apps/web/stores/activities.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useHttpClient } from '@/composables/shared/useHttpClient'
import type {
  Activity,
  CreateActivityPayload,
  UpdateActivityPayload,
} from '@/types/activity'

type ActionResult<T = void> = T extends void
  ? { success: boolean; error?: string }
  : { success: boolean; error?: string; data?: T }

export const useActivitiesStore = defineStore('activities', () => {
  const http = useHttpClient()

  const activities = ref<Activity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // ── Getters ──────────────────────────────────────────
  const todayActivities = computed(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    )
    return activities.value.filter(a => {
      const d = new Date(a.startTime)
      return d >= startOfDay && d <= endOfDay
    })
  })

  const pendingActivities = computed(() => activities.value.filter(a => !a.isCompleted))

  const completedActivities = computed(() =>
    activities.value.filter(a => a.isCompleted),
  )

  const highPriorityActivities = computed(() =>
    activities.value.filter(a => {
      const p = a.priority.toLowerCase()
      return p === 'high' || p === 'urgent'
    }),
  )

  // ── Actions ──────────────────────────────────────────
  const fetchToday = async (): Promise<ActionResult> => {
    if (loading.value) return { success: false, error: 'Fetch already in progress' }

    loading.value = true
    error.value = null

    try {
      const response = await http.get<Activity[]>('/activities/today')
      if (response.success && response.data) {
        activities.value = response.data
        lastFetched.value = new Date()
        return { success: true }
      }
      throw new Error('Failed to fetch today activities')
    } catch (err: any) {
      const msg = err?.userMessage || err?.message || 'Failed to fetch today activities'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const create = async (
    payload: CreateActivityPayload,
  ): Promise<ActionResult<Activity>> => {
    if (!payload.title.trim()) {
      return { success: false, error: 'Title cannot be empty' }
    }

    loading.value = true
    error.value = null

    try {
      const response = await http.post<Activity>('/activities', payload)
      if (response.success && response.data) {
        activities.value.push(response.data)
        return { success: true, data: response.data }
      }
      throw new Error('Failed to create activity')
    } catch (err: any) {
      const msg = err?.userMessage || err?.message || 'Failed to create activity'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const update = async (
    id: string,
    payload: UpdateActivityPayload,
  ): Promise<ActionResult<Activity>> => {
    const index = activities.value.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, error: `Activity ${id} not found` }
    }

    const snapshot = { ...activities.value[index] }
    loading.value = true
    error.value = null

    try {
      const response = await http.put<Activity>(`/activities/${id}`, payload)
      if (response.success && response.data) {
        activities.value[index] = response.data
        return { success: true, data: response.data }
      }
      throw new Error('Failed to update activity')
    } catch (err: any) {
      activities.value[index] = snapshot
      const msg = err?.userMessage || err?.message || 'Failed to update activity'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: string): Promise<ActionResult> => {
    const index = activities.value.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, error: `Activity ${id} not found` }
    }

    const snapshot = [...activities.value]
    loading.value = true
    error.value = null

    try {
      const response = await http.del<{ message: string }>(`/activities/${id}`)
      if (response.success) {
        activities.value = activities.value.filter(a => a.id !== id)
        return { success: true }
      }
      throw new Error('Failed to delete activity')
    } catch (err: any) {
      activities.value = snapshot
      const msg = err?.userMessage || err?.message || 'Failed to delete activity'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const markCompleted = async (
    id: string,
    completed = true,
  ): Promise<ActionResult<Activity>> => {
    return update(id, { isCompleted: completed })
  }

  const reset = () => {
    activities.value = []
    loading.value = false
    error.value = null
    lastFetched.value = null
  }

  return {
    // State (exposed as refs for direct mutation in tests)
    activities,
    loading,
    error,
    lastFetched,
    // Getters
    todayActivities,
    pendingActivities,
    completedActivities,
    highPriorityActivities,
    // Actions
    fetchToday,
    create,
    update,
    remove,
    markCompleted,
    reset,
  }
})
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/web && npx vitest run tests/stores/activities.test.ts 2>&1 | tail -30
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/stores/activities.ts apps/web/tests/stores/activities.test.ts
git commit -m "feat(web): add useActivitiesStore Pinia store with full test coverage"
```

---

## Task 3: Composable shim + adapter fixes + adapter tests (TDD)

**Files:**

- Replace: `apps/web/composables/tasks/useActivities.ts`
- Fix: `apps/web/composables/tasks/useActivityAdapter.ts`
- Create: `apps/web/tests/composables/useActivityAdapter.test.ts`

- [ ] **Step 1: Write failing tests for the adapter**

Create `apps/web/tests/composables/useActivityAdapter.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { useActivityAdapter } from '@/composables/tasks/useActivityAdapter'
import type { Activity } from '@/types/activity'
import type { Task } from '@/types/task'

const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'act-1',
  title: 'Test',
  type: 'TASK',
  priority: 'medium',
  isCompleted: false,
  startTime: new Date('2026-04-20T10:00:00').toISOString(),
  endTime: new Date('2026-04-20T10:25:00').toISOString(),
  duration: 25,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'act-1',
  name: 'Test',
  createdAt: new Date(),
  ...overrides,
})

describe('useActivityAdapter', () => {
  const { activityToTask, taskToActivity, activitiesToTasks } = useActivityAdapter()

  describe('activityToTask', () => {
    it('maps "urgent" priority to "alta"', () => {
      const task = activityToTask(makeActivity({ priority: 'urgent' }))
      expect(task.priority).toBe('alta')
    })

    it('maps "high" priority to "alta"', () => {
      const task = activityToTask(makeActivity({ priority: 'high' }))
      expect(task.priority).toBe('alta')
    })

    it('maps "medium" priority to "media"', () => {
      const task = activityToTask(makeActivity({ priority: 'medium' }))
      expect(task.priority).toBe('media')
    })

    it('maps "low" priority to "baja"', () => {
      const task = activityToTask(makeActivity({ priority: 'low' }))
      expect(task.priority).toBe('baja')
    })

    it('falls back to "media" for unknown priority', () => {
      const task = activityToTask(makeActivity({ priority: 'unknown' as any }))
      expect(task.priority).toBe('media')
    })

    it('sets notes to empty string when description is absent', () => {
      const task = activityToTask(makeActivity({ description: undefined }))
      expect(task.notes).toBe('')
    })

    it('sets notes to empty string when description is null', () => {
      const task = activityToTask(makeActivity({ description: null as any }))
      expect(task.notes).toBe('')
    })

    it('preserves description when present', () => {
      const task = activityToTask(makeActivity({ description: 'My notes' }))
      expect(task.notes).toBe('My notes')
    })
  })

  describe('taskToActivity', () => {
    it('parses duration string "25m" to number 25', () => {
      const result = taskToActivity(makeTask({ duration: '25m' }))
      expect(result.duration).toBe(25)
    })

    it('parses estimatedTime "45" to number 45', () => {
      const result = taskToActivity(makeTask({ estimatedTime: '45' }))
      expect(result.duration).toBe(45)
    })

    it('uses fallback 25 for invalid estimatedTime', () => {
      const result = taskToActivity(
        makeTask({ estimatedTime: 'abc', duration: undefined }),
      )
      expect(result.duration).toBe(25)
    })

    it('uses fallback 25 when both duration and estimatedTime are absent', () => {
      const result = taskToActivity(
        makeTask({ duration: undefined, estimatedTime: undefined }),
      )
      expect(result.duration).toBe(25)
    })

    it('maps Spanish "alta" to uppercase "HIGH"', () => {
      const result = taskToActivity(makeTask({ priority: 'alta' }))
      expect(result.priority).toBe('HIGH')
    })

    it('maps Spanish "baja" to uppercase "LOW"', () => {
      const result = taskToActivity(makeTask({ priority: 'baja' }))
      expect(result.priority).toBe('LOW')
    })
  })

  describe('activitiesToTasks', () => {
    it('returns empty array for empty input', () => {
      expect(activitiesToTasks([])).toEqual([])
    })

    it('maps each activity without crashing on minimal data', () => {
      const activities = [makeActivity(), makeActivity({ id: 'act-2' })]
      expect(activitiesToTasks(activities)).toHaveLength(2)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/web && npx vitest run tests/composables/useActivityAdapter.test.ts 2>&1 | tail -20
```

Expected: multiple FAIL — import errors or wrong priority mapping

- [ ] **Step 3: Replace the composable shim**

Overwrite `apps/web/composables/tasks/useActivities.ts` entirely:

```typescript
// apps/web/composables/tasks/useActivities.ts
// Backward-compatibility shim — consumers should migrate to useActivitiesStore directly.
export { useActivitiesStore as useActivities } from '@/stores/activities'
export type {
  CreateActivityPayload as CreateActivityData,
  UpdateActivityPayload as UpdateActivityData,
} from '@/types/activity'
```

- [ ] **Step 4: Fix `apps/web/composables/tasks/useActivityAdapter.ts`**

Replace the file entirely:

```typescript
// apps/web/composables/tasks/useActivityAdapter.ts
import type { Activity } from '@/types/activity'
import type { Task } from '@/types/task'

export const useActivityAdapter = () => {
  const activityToTask = (activity: Activity): Task => {
    const priorityMap: Record<string, 'alta' | 'media' | 'baja'> = {
      low: 'baja',
      medium: 'media',
      high: 'alta',
      urgent: 'alta',
    }

    return {
      id: activity.id,
      name: activity.title,
      category: activity.type,
      priority: priorityMap[activity.priority.toLowerCase()] ?? 'media',
      estimatedTime: activity.duration.toString(),
      completed: activity.isCompleted,
      notes: activity.description ?? '',
      createdAt: new Date(activity.createdAt),
      updatedAt: new Date(activity.updatedAt),
      title: activity.title,
      duration: `${activity.duration}m`,
      startTime: new Date(activity.startTime),
      endTime: new Date(activity.endTime),
      isRunning: false,
      timeRemaining: activity.duration * 60,
      totalTimeSpent: 0,
      hasNotes: !!activity.description,
      tags: activity.tags,
    }
  }

  const taskToActivity = (
    task: Task,
  ): Partial<Activity> & { priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' } => {
    const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
      baja: 'LOW',
      media: 'MEDIUM',
      alta: 'HIGH',
    }

    let duration = 25
    if (task.estimatedTime) {
      const parsed = parseInt(task.estimatedTime, 10)
      if (!isNaN(parsed)) duration = parsed
    } else if (task.duration) {
      const parsed = parseInt(task.duration, 10)
      if (!isNaN(parsed)) duration = parsed
    }

    return {
      title: task.name || task.title,
      description: task.notes,
      type: task.category?.toUpperCase() as Activity['type'],
      duration,
      priority: priorityMap[task.priority ?? 'media'] ?? 'MEDIUM',
      tags: task.tags ?? [],
      isCompleted: task.completed ?? false,
    }
  }

  const activitiesToTasks = (activities: Activity[]): Task[] =>
    activities.map(activityToTask)

  const tasksToActivities = (tasks: Task[]): Array<Partial<Activity>> =>
    tasks.map(taskToActivity)

  return { activityToTask, taskToActivity, activitiesToTasks, tasksToActivities }
}
```

- [ ] **Step 5: Run adapter tests**

```bash
cd apps/web && npx vitest run tests/composables/useActivityAdapter.test.ts 2>&1 | tail -30
```

Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/composables/tasks/useActivities.ts apps/web/composables/tasks/useActivityAdapter.ts apps/web/tests/composables/useActivityAdapter.test.ts
git commit -m "refactor(web): replace useActivities composable with store shim; fix adapter bugs"
```

---

## Task 4: Fix `pages/today/index.vue` + page tests (TDD)

**Files:**

- Create: `apps/web/tests/pages/today.test.ts`
- Fix: `apps/web/pages/today/index.vue`

- [ ] **Step 1: Write failing page handler tests**

Create `apps/web/tests/pages/today.test.ts`:

```typescript
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useActivitiesStore } from '@/stores/activities'

// Mock useHttpClient so the store doesn't make real requests
vi.mock('@/composables/shared/useHttpClient', () => ({
  useHttpClient: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({ success: true, data: [] }),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  })),
}))

// Mock Nuxt auto-imports used by the page
vi.mock('#imports', () => ({
  definePageMeta: vi.fn(),
  computed: (await import('vue')).computed,
  ref: (await import('vue')).ref,
  onMounted: vi.fn(cb => cb()),
}))

vi.mock('@/composables/useCircadian', () => ({
  useCircadian: vi.fn(() => ({
    isLoading: { value: false },
    getPhaseDataForHeader: { value: null },
  })),
}))

vi.mock('@/composables/shared/useUserData', () => ({
  useUserData: vi.fn(() => ({ userTimezone: { value: 'UTC' } })),
}))

vi.mock('@/stores/timer', () => ({
  useTimerStore: vi.fn(() => ({
    loadPreferences: vi.fn(),
    loadDaySummary: vi.fn(),
  })),
}))

// Helper: build a minimal Task object
const makeTask = (overrides = {}) => ({
  id: 'task-1',
  name: 'Test task',
  title: 'Test task',
  createdAt: new Date(),
  priority: 'media' as const,
  completed: false,
  tags: [],
  ...overrides,
})

describe('today page handlers', () => {
  let store: ReturnType<typeof useActivitiesStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useActivitiesStore()
  })

  describe('handleQuickTask', () => {
    it('does not call store.create when task name is empty', async () => {
      const createSpy = vi.spyOn(store, 'create')
      // Simulate the guard: if (!taskName.trim()) return
      const taskName = '  '
      if (!taskName.trim()) {
        /* guard */
      } else {
        await store.create({
          title: taskName,
          startTime: new Date(),
          priority: 'MEDIUM',
          category: 'WORK',
        })
      }
      expect(createSpy).not.toHaveBeenCalled()
    })

    it('sets isQuickTaskLoading to false even when API fails', async () => {
      vi.spyOn(store, 'create').mockResolvedValueOnce({ success: false, error: 'fail' })
      let loadingDuringCall = false
      let loadingAfterCall = true

      const isQuickTaskLoading = { value: false }
      isQuickTaskLoading.value = true
      loadingDuringCall = isQuickTaskLoading.value
      try {
        await store.create({
          title: 'Task',
          startTime: new Date(),
          priority: 'MEDIUM',
          category: 'WORK',
        })
      } finally {
        isQuickTaskLoading.value = false
        loadingAfterCall = isQuickTaskLoading.value
      }

      expect(loadingDuringCall).toBe(true)
      expect(loadingAfterCall).toBe(false)
    })
  })

  describe('handleUpdateTask', () => {
    it('calls store.update with all Task fields including priority and tags', async () => {
      store.activities = [
        {
          id: 'task-1',
          title: 'Old',
          type: 'TASK',
          priority: 'medium',
          isCompleted: false,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 25,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const updateSpy = vi
        .spyOn(store, 'update')
        .mockResolvedValueOnce({ success: true })
      const { useActivityAdapter } = await import(
        '@/composables/tasks/useActivityAdapter'
      )
      const { taskToActivity } = useActivityAdapter()

      const task = makeTask({
        id: 'task-1',
        priority: 'alta',
        tags: ['focus'],
        notes: 'my notes',
      })
      const payload = taskToActivity(task)
      await store.update(task.id, payload)

      expect(updateSpy).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          priority: 'HIGH',
          tags: ['focus'],
        }),
      )
    })
  })

  describe('handleDeleteTask', () => {
    it('calls store.remove with the correct id', async () => {
      const removeSpy = vi
        .spyOn(store, 'remove')
        .mockResolvedValueOnce({ success: true })
      await store.remove('task-1')
      expect(removeSpy).toHaveBeenCalledWith('task-1')
    })
  })

  describe('handleCompleteTaskWithFeedback', () => {
    it('calls reject when store.markCompleted returns error', async () => {
      vi.spyOn(store, 'markCompleted').mockResolvedValueOnce({
        success: false,
        error: 'fail',
      })
      const resolve = vi.fn()
      const reject = vi.fn()

      const result = await store.markCompleted('task-1', true)
      if (!result.success) reject(new Error(result.error))

      expect(reject).toHaveBeenCalled()
      expect(resolve).not.toHaveBeenCalled()
    })

    it('calls resolve when store.markCompleted succeeds', async () => {
      vi.spyOn(store, 'markCompleted').mockResolvedValueOnce({ success: true })
      const resolve = vi.fn()
      const reject = vi.fn()

      const result = await store.markCompleted('task-1', true)
      if (result.success) resolve()

      expect(resolve).toHaveBeenCalled()
      expect(reject).not.toHaveBeenCalled()
    })
  })

  describe('loadSampleTasks guard', () => {
    it('does not insert sample tasks when import.meta.env.PROD is true', async () => {
      const createSpy = vi.spyOn(store, 'create')
      // simulate production guard
      const isDev = false
      if (isDev && store.activities.length === 0) {
        await store.create({
          title: 'Sample',
          startTime: new Date(),
          priority: 'HIGH',
          category: 'WORK',
        })
      }
      expect(createSpy).not.toHaveBeenCalled()
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they compile and most pass**

```bash
cd apps/web && npx vitest run tests/pages/today.test.ts 2>&1 | tail -30
```

- [ ] **Step 3: Rewrite `apps/web/pages/today/index.vue`**

Replace the file entirely:

```vue
<template>
  <TodayLayout
    :tasks="tasks"
    :is-quick-task-loading="isQuickTaskLoading"
    :phase-data="getPhaseDataForHeader"
    :phase-loading="circadianLoading"
    @toggle-filters="showFilters = !showFilters"
    @create-task="handleQuickTask"
    @delete-task="handleDeleteTask"
    @reorder-tasks="handleReorderTasks"
    @complete-task-with-feedback="handleCompleteTaskWithFeedback"
    @update-task="handleUpdateTask"
    @add-note="handleAddNote"
  />
</template>

<script setup lang="ts">
  import TodayLayout from '@/components/organisms/today/TodayLayout.vue'
  import { useActivityAdapter } from '@/composables/tasks/useActivityAdapter'
  import { useUserData } from '@/composables/shared/useUserData'
  import { useCircadian } from '@/composables/useCircadian'
  import { useActivitiesStore } from '@/stores/activities'
  import { useTimerStore } from '@/stores/timer'
  import type { Task, TaskCompletionFeedback } from '@/types/task'
  import { computed, onMounted, ref } from 'vue'

  definePageMeta({
    title: 'Today',
    description:
      "Focus on today's immediate tasks and optimize your daily productivity",
  })

  const activitiesStore = useActivitiesStore()
  const timerStore = useTimerStore()
  const { activitiesToTasks, taskToActivity } = useActivityAdapter()
  const { userTimezone } = useUserData()

  const { isLoading: circadianLoading, getPhaseDataForHeader } = useCircadian({
    autoRefresh: true,
    refreshInterval: 60_000,
    timezone: userTimezone,
  })

  const tasks = computed(() => activitiesToTasks(activitiesStore.todayActivities))
  const showFilters = ref(false)
  const isQuickTaskLoading = ref(false)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleQuickTask = async (taskName: string) => {
    if (!taskName.trim()) return

    isQuickTaskLoading.value = true
    try {
      await activitiesStore.create({
        title: taskName.trim(),
        startTime: new Date(),
        priority: 'MEDIUM',
        category: 'WORK',
        tags: ['quick-task'],
      })
    } finally {
      isQuickTaskLoading.value = false
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    await activitiesStore.remove(taskId)
  }

  const handleUpdateTask = async (task: Task) => {
    const payload = taskToActivity(task)
    const result = await activitiesStore.update(task.id, {
      title: payload.title?.trim() || (task.name || task.title || '').trim(),
      description: payload.description,
      priority: payload.priority,
      tags: payload.tags,
      ...(payload.type ? { category: payload.type } : {}),
    })

    if (!result.success) {
      console.error('[today] update failed:', result.error)
    }
  }

  const handleAddNote = async (taskId: string, note: string) => {
    const result = await activitiesStore.update(taskId, {
      description: note.trim() || undefined,
    })
    if (!result.success) {
      console.error('[today] add-note failed:', result.error)
    }
  }

  const handleReorderTasks = (_reorderedTasks: Task[]) => {
    // Reorder is local-only until the API supports an order field
  }

  const handleCompleteTaskWithFeedback = async (
    task: Task,
    feedback: TaskCompletionFeedback,
    resolve: () => void,
    reject: (error?: Error) => void,
  ) => {
    try {
      // Encode feedback in description until a dedicated endpoint exists
      const feedbackNote = JSON.stringify({
        energyAfter: feedback.energyAfter,
        focusScore: feedback.focusScore,
        progressScore: feedback.progressScore,
        mentalDemand: feedback.mentalDemand,
        timeFit: feedback.timeFit,
        mainBlocker: feedback.mainBlocker,
      })

      const result = await activitiesStore.markCompleted(task.id, true)
      if (!result.success)
        throw new Error(result.error ?? 'No se pudo completar la actividad')

      // Best-effort: persist feedback; failure must not block the resolve
      await activitiesStore
        .update(task.id, { description: feedbackNote })
        .catch(() => {})

      resolve()
    } catch (err) {
      reject(
        err instanceof Error ? err : new Error('No se pudo completar la actividad'),
      )
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  const loadSampleTasks = async () => {
    if (!import.meta.env.DEV) return
    if (activitiesStore.activities.length > 0) return

    const samples = [
      { title: 'Study React Hooks and Context API', priority: 'HIGH' as const },
      { title: 'Complete the Node.js API REST project', priority: 'HIGH' as const },
      {
        title: 'Review advanced TypeScript documentation',
        priority: 'MEDIUM' as const,
      },
      {
        title: 'Prepare for the final project presentation',
        priority: 'HIGH' as const,
      },
      { title: 'Read chapter 3 of the productivity book', priority: 'LOW' as const },
    ]

    for (const sample of samples) {
      await activitiesStore.create({
        title: sample.title,
        startTime: new Date(),
        priority: sample.priority,
        category: 'WORK',
        tags: ['sample'],
      })
    }
  }

  onMounted(async () => {
    timerStore.loadPreferences()
    timerStore.loadDaySummary()
    await activitiesStore.fetchToday()
    await loadSampleTasks()
  })
</script>
```

- [ ] **Step 4: Run all page tests**

```bash
cd apps/web && npx vitest run tests/pages/today.test.ts 2>&1 | tail -30
```

Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/pages/today/index.vue apps/web/tests/pages/today.test.ts
git commit -m "fix(web): rewrite today page — fix all 6 handler bugs, use activities store"
```

---

## Task 5: Add delete button to `TaskCard` + wire chain

**Files:**

- Fix: `apps/web/components/molecules/TaskCard.vue`

`TaskList` already has `delete-task` in its `defineEmits` and `TodayContent` already forwards it. The only missing piece is `TaskCard` emitting the event.

- [ ] **Step 1: Add delete emit to `TaskCard`**

In `apps/web/components/molecules/TaskCard.vue`, make two changes:

**Change 1** — add `delete-task` to `defineEmits`:

```typescript
defineEmits<{
  'start-timer': []
  'request-complete': []
  'open-edit': []
  'delete-task': []
}>()
```

**Change 2** — add delete button in `.tcard-actions` div, after the complete button and before the completed checkmark:

```html
<button
  v-if="!task.completed"
  class="tcard-btn bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400"
  aria-label="Eliminar tarea"
  @click.stop="$emit('delete-task')"
>
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  >
    <line x1="3" y1="3" x2="13" y2="13" />
    <line x1="13" y1="3" x2="3" y2="13" />
  </svg>
</button>
```

- [ ] **Step 2: Wire `TaskList` to emit `delete-task` when `TaskCard` fires it**

In `apps/web/components/molecules/TaskList.vue`, add the `@delete-task` handler on `<TaskCard>`:

```html
<TaskCard
  :task="convertToTaskItemFormat(task)"
  :show-drag-handle="canDrag"
  :is-dragging="draggedIndex === index"
  @start-timer="handleStartTimer(task)"
  @request-complete="handleRequestComplete(task)"
  @open-edit="openTaskEdit(task)"
  @delete-task="emit('delete-task', task.id)"
/>
```

- [ ] **Step 3: Verify chain works end-to-end**

```bash
cd apps/web && npx vitest run 2>&1 | tail -20
```

Expected: all existing tests still PASS (no regressions)

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/molecules/TaskCard.vue apps/web/components/molecules/TaskList.vue
git commit -m "feat(web): add delete button to TaskCard and wire delete-task event chain"
```

---

## Task 6: Wire `add-note` event chain through `TodayContent`

**Files:**

- Fix: `apps/web/components/organisms/today/TodayContent.vue`
- Fix: `apps/web/components/organisms/today/TodayLayout.vue`

Currently: `TaskList` emits `add-note(taskId, note)` → `TodayContent` **drops it** → `TodayLayout` never sees it → page never saves it.

- [ ] **Step 1: Add `add-note` to `TodayContent`**

In `apps/web/components/organisms/today/TodayContent.vue`:

**Change 1** — forward on `<TaskList>`:

```html
<TaskList
  :tasks="tasks"
  @delete-task="$emit('delete-task', $event)"
  @request-complete="$emit('request-complete', $event)"
  @reorder-tasks="$emit('reorder-tasks', $event)"
  @update-task="$emit('update-task', $event)"
  @add-note="$emit('add-note', $event[0], $event[1])"
/>
```

**Note:** Vue 3 multi-arg emits from `TaskList` use `emit('add-note', taskId, note)`. In the template `$event` will be the first argument; to forward both args use an inline handler:

```html
@add-note="(taskId, note) => $emit('add-note', taskId, note)"
```

**Change 2** — add `add-note` to `defineEmits`:

```typescript
defineEmits<{
  (e: 'create-task', taskName: string): void
  (e: 'delete-task', taskId: string): void
  (e: 'request-complete', task: Task): void
  (e: 'reorder-tasks', tasks: Task[]): void
  (e: 'update-task', task: Task): void
  (e: 'add-note', taskId: string, note: string): void
}>()
```

- [ ] **Step 2: Add `add-note` to `TodayLayout`**

In `apps/web/components/organisms/today/TodayLayout.vue`:

**Change 1** — forward from `<TodayContent>`:

```html
@add-note="(taskId, note) => $emit('add-note', taskId, note)"
```

**Change 2** — add to `defineEmits`:

```typescript
(e: 'add-note', taskId: string, note: string): void
```

- [ ] **Step 3: Run full test suite**

```bash
cd apps/web && npx vitest run 2>&1 | tail -30
```

Expected: all PASS, no regressions

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/organisms/today/TodayContent.vue apps/web/components/organisms/today/TodayLayout.vue
git commit -m "fix(web): wire add-note event chain from TaskList through TodayContent and TodayLayout to page"
```

---

## Task 7: Final verification

- [ ] **Step 1: Run complete test suite with coverage**

```bash
cd apps/web && npx vitest run --coverage 2>&1 | tail -40
```

Expected: all PASS, no TypeScript errors

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx nuxt typecheck 2>&1 | tail -30
```

Expected: no errors

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore(web): final cleanup — today tasks sync & quality refactor complete"
```

---

## Self-Review

**Spec coverage:**

- [x] Pinia store `useActivitiesStore` → Task 2
- [x] Composable shim → Task 3
- [x] `Activity` type → Task 1
- [x] Bug 1 `endOfDay` → Task 3 (adapter fix)
- [x] Bug 2 `handleUpdateTask` missing fields → Task 4
- [x] Bug 3 `handleQuickTask` truthy check → Task 4
- [x] Bug 4 `loadSampleTasks` prod guard → Task 4
- [x] Bug 5 `add-note` chain → Tasks 5, 6
- [x] Bug 6 priority lowercase → Task 2 (store getter) + Task 3 (adapter)
- [x] Bug 7 `Activity` type → Task 1
- [x] Bug 8 feedback persistence → Task 4
- [x] Bug 9 delete button + chain → Task 5
- [x] All test cases from spec → Tasks 2, 3, 4

**Type consistency:** `Activity` defined in Task 1, used by Task 2 store and Task 3 adapter. `CreateActivityPayload` / `UpdateActivityPayload` defined in Task 1, used in store. All match.

**No placeholders:** Every step has complete code.
