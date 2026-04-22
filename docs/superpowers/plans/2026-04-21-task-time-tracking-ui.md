# Task Time Tracking UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show three time indicators on the Today page that are currently dead/blank: (a) tiempo acumulado por tarea en cada `TaskCard`, (b) tiempo total invertido en el día (suma de todas las tareas), (c) tiempo transcurrido sin una tarea activa.

**Architecture:** Single source of truth lives server-side in the `WorkSession` table. A new lightweight summary endpoint (`GET /work-sessions/today-summary`) aggregates completed/abandoned sessions for the user's civil day and returns `{ perTask, totalSeconds, lastSessionEndedAt }`. On the web, a Pinia store caches this payload and merges it with the live `timerStore` state so the UI reflects both historical (closed sessions) and in-flight (running session) time. A new `TodayTimeStrip` molecule renders the day total + idle-since counter inside `TodayHeader`.

**Tech Stack:** Express + Prisma (API), Vitest for API tests. Nuxt 3 + Vue 3 + Pinia + Vitest for web tests. Timezone helpers already exist (`core/utils/calendarDate.ts`, `utils/civilDate.ts`).

---

## File Structure

**API (`apps/api/`):**

- Modify: `src/modules/work-sessions/services/WorkSessionService.ts` — add `getTodaySummary(userId, tz)` method.
- Modify: `src/modules/work-sessions/controllers/WorkSessionController.ts` — add `todaySummary` handler.
- Modify: `src/modules/work-sessions/routes.ts` — register `GET /today-summary`.
- Create: `tests/modules/work-sessions/today-summary.service.test.ts` — service-level tests with real DB.
- Create: `tests/modules/work-sessions/today-summary.route.test.ts` — route-level smoke tests.

**Web (`apps/web/`):**

- Create: `stores/workSessionSummary.ts` — Pinia store for today's summary.
- Create: `composables/tasks/useTodayTaskView.ts` — merges store tasks + summary + timer state into UI `Task[]`.
- Modify: `pages/today/index.vue` — replace direct `frontendTaskToUiTask` mapping with the composable.
- Create: `components/molecules/TodayTimeStrip.vue` — day total + idle counter.
- Modify: `components/organisms/today/TodayHeader.vue` — mount `TodayTimeStrip` below the live clock.
- Create: `tests/stores/workSessionSummary.test.ts`
- Create: `tests/composables/useTodayTaskView.test.ts`
- Create: `tests/components/TodayTimeStrip.spec.ts`

---

## Shared Contract (used across tasks)

API response shape (data envelope per `ApiResponses.ok`):

```ts
// GET /work-sessions/today-summary response.data
interface TodaySummaryPayload {
  calendarDate: string // 'YYYY-MM-DD' in user's TZ
  totalSeconds: number // sum of closed sessions today (completed + abandoned)
  perTask: Record<string, number> // taskId -> seconds closed today
  lastSessionEndedAt: string | null // ISO of the most recent closed session's endTime (today)
}
```

Rules:

- Include `WorkSessionState.completed` and `WorkSessionState.abandoned`.
- Exclude `running`, `paused`, `pending_feedback`, and soft-deleted (`isDeleted: true`).
- Scope by `endTime BETWEEN [startOfCivilDay, endOfCivilDay]` in the user's timezone.
- Per-session seconds: `max(0, floor((endTime - startTime) / 1000) - pausedDurationSec)`. Do **not** use `duration` (minutes, nullable on abandoned).

---

### Task 1: API service method `getTodaySummary`

**Files:**

- Modify: `apps/api/src/modules/work-sessions/services/WorkSessionService.ts`
- Create: `apps/api/tests/modules/work-sessions/today-summary.service.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/api/tests/modules/work-sessions/today-summary.service.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { WorkSessionState, WorkSessionTimerMode } from '@prisma/client'
import prisma from '../../../src/core/database/prisma.js'
import { WorkSessionService } from '../../../src/modules/work-sessions/services/WorkSessionService.js'
import { createTestUser } from '../../helpers/createTestUser.js'
import { createTestTask } from '../../helpers/createTestTask.js'

describe('WorkSessionService.getTodaySummary', () => {
  const service = new WorkSessionService()
  let userId: string
  let timezone: string
  let taskA: string
  let taskB: string

  beforeEach(async () => {
    const u = await createTestUser({ timezone: 'America/Mexico_City' })
    userId = u.id
    timezone = u.timezone
    taskA = (await createTestTask(userId, { title: 'A' })).id
    taskB = (await createTestTask(userId, { title: 'B' })).id
  })

  it('returns zeros when there are no sessions today', async () => {
    const out = await service.getTodaySummary(userId, timezone)
    expect(out.totalSeconds).toBe(0)
    expect(out.perTask).toEqual({})
    expect(out.lastSessionEndedAt).toBeNull()
  })

  it('sums completed sessions per task, subtracting paused time', async () => {
    const start = new Date()
    const end = new Date(start.getTime() + 30 * 60_000) // +30m
    await prisma.workSession.create({
      data: {
        userId,
        taskId: taskA,
        startTime: start,
        endTime: end,
        state: WorkSessionState.completed,
        timerMode: WorkSessionTimerMode.pomodoro,
        targetDurationSec: 1500,
        pausedDurationSec: 300, // 5m paused
        duration: 25,
      },
    })
    const out = await service.getTodaySummary(userId, timezone)
    expect(out.perTask[taskA]).toBe(25 * 60) // 1500s
    expect(out.totalSeconds).toBe(25 * 60)
    expect(out.lastSessionEndedAt).toBe(end.toISOString())
  })

  it('includes abandoned sessions', async () => {
    const start = new Date()
    const end = new Date(start.getTime() + 10 * 60_000)
    await prisma.workSession.create({
      data: {
        userId,
        taskId: taskA,
        startTime: start,
        endTime: end,
        state: WorkSessionState.abandoned,
        timerMode: WorkSessionTimerMode.pomodoro,
        targetDurationSec: 1500,
        pausedDurationSec: 0,
      },
    })
    const out = await service.getTodaySummary(userId, timezone)
    expect(out.perTask[taskA]).toBe(10 * 60)
    expect(out.totalSeconds).toBe(10 * 60)
  })

  it('excludes running, paused, pending_feedback, and soft-deleted', async () => {
    const start = new Date()
    for (const state of [
      WorkSessionState.running,
      WorkSessionState.paused,
      WorkSessionState.pending_feedback,
    ]) {
      await prisma.workSession.create({
        data: {
          userId,
          taskId: taskA,
          startTime: start,
          state,
          timerMode: WorkSessionTimerMode.pomodoro,
          targetDurationSec: 1500,
          pausedDurationSec: 0,
        },
      })
    }
    await prisma.workSession.create({
      data: {
        userId,
        taskId: taskA,
        startTime: start,
        endTime: new Date(start.getTime() + 60_000),
        state: WorkSessionState.completed,
        timerMode: WorkSessionTimerMode.pomodoro,
        targetDurationSec: 1500,
        pausedDurationSec: 0,
        isDeleted: true,
      },
    })
    const out = await service.getTodaySummary(userId, timezone)
    expect(out.totalSeconds).toBe(0)
    expect(out.lastSessionEndedAt).toBeNull()
  })

  it('groups by task and picks the latest endTime', async () => {
    const t0 = new Date()
    const e1 = new Date(t0.getTime() + 10 * 60_000)
    const e2 = new Date(t0.getTime() + 20 * 60_000)
    await prisma.workSession.createMany({
      data: [
        {
          userId,
          taskId: taskA,
          startTime: t0,
          endTime: e1,
          state: WorkSessionState.completed,
          timerMode: WorkSessionTimerMode.pomodoro,
          targetDurationSec: 600,
          pausedDurationSec: 0,
        },
        {
          userId,
          taskId: taskB,
          startTime: t0,
          endTime: e2,
          state: WorkSessionState.completed,
          timerMode: WorkSessionTimerMode.pomodoro,
          targetDurationSec: 1200,
          pausedDurationSec: 0,
        },
      ],
    })
    const out = await service.getTodaySummary(userId, timezone)
    expect(out.perTask[taskA]).toBe(10 * 60)
    expect(out.perTask[taskB]).toBe(20 * 60)
    expect(out.totalSeconds).toBe(30 * 60)
    expect(out.lastSessionEndedAt).toBe(e2.toISOString())
  })
})
```

If `apps/api/tests/helpers/createTestUser.ts` / `createTestTask.ts` don't exist yet, inspect `apps/api/tests/` for equivalents and adjust imports. Do **not** create new helpers in this step — reuse whatever the API test suite already uses (search for `createTestUser` or similar).

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm vitest run tests/modules/work-sessions/today-summary.service.test.ts`
Expected: FAIL with `service.getTodaySummary is not a function`.

- [ ] **Step 3: Implement `getTodaySummary`**

Add to `apps/api/src/modules/work-sessions/services/WorkSessionService.ts`, near `getActive`:

```ts
async getTodaySummary(
  userId: string,
  userTimezone: string,
): Promise<{
  calendarDate: string
  totalSeconds: number
  perTask: Record<string, number>
  lastSessionEndedAt: string | null
}> {
  const civilDate = getCalendarDateForUser(new Date(), userTimezone)
  const startOfDay = civilDate
  const endOfDay = new Date(civilDate.getTime() + 24 * 60 * 60 * 1000 - 1)

  const sessions = await prisma.workSession.findMany({
    where: {
      userId,
      isDeleted: false,
      state: { in: [WorkSessionState.completed, WorkSessionState.abandoned] },
      endTime: { gte: startOfDay, lte: endOfDay },
    },
    select: {
      taskId: true,
      startTime: true,
      endTime: true,
      pausedDurationSec: true,
    },
    orderBy: { endTime: 'asc' },
  })

  const perTask: Record<string, number> = {}
  let totalSeconds = 0
  let lastSessionEndedAt: string | null = null

  for (const s of sessions) {
    if (!s.endTime) continue
    const wall = Math.floor((s.endTime.getTime() - s.startTime.getTime()) / 1000)
    const paused = s.pausedDurationSec ?? 0
    const sec = Math.max(0, wall - paused)
    perTask[s.taskId] = (perTask[s.taskId] ?? 0) + sec
    totalSeconds += sec
    lastSessionEndedAt = s.endTime.toISOString()
  }

  return {
    calendarDate: civilDate.toISOString().slice(0, 10),
    totalSeconds,
    perTask,
    lastSessionEndedAt,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/api && pnpm vitest run tests/modules/work-sessions/today-summary.service.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/work-sessions/services/WorkSessionService.ts \
        apps/api/tests/modules/work-sessions/today-summary.service.test.ts
git commit -m "feat(api): add WorkSessionService.getTodaySummary"
```

---

### Task 2: API route `GET /work-sessions/today-summary`

**Files:**

- Modify: `apps/api/src/modules/work-sessions/controllers/WorkSessionController.ts`
- Modify: `apps/api/src/modules/work-sessions/routes.ts`
- Create: `apps/api/tests/modules/work-sessions/today-summary.route.test.ts`

- [ ] **Step 1: Write the failing route test**

Create `apps/api/tests/modules/work-sessions/today-summary.route.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../../src/app.js' // adjust to actual app export path
import { createTestUser, loginTestUser } from '../../helpers/auth.js'
// use whatever helpers the existing work-session route tests use

describe('GET /work-sessions/today-summary', () => {
  let authCookie: string
  beforeAll(async () => {
    const u = await createTestUser()
    authCookie = await loginTestUser(u)
  })

  it('401 without auth', async () => {
    const res = await request(app).get('/work-sessions/today-summary')
    expect(res.status).toBe(401)
  })

  it('returns empty summary for a fresh user', async () => {
    const res = await request(app)
      .get('/work-sessions/today-summary')
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      totalSeconds: 0,
      perTask: {},
      lastSessionEndedAt: null,
    })
    expect(res.body.data.calendarDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

Before writing, check `apps/api/tests/modules/work-sessions/` for existing route tests and copy the exact auth helper pattern used. Adjust `app` import and cookie-login call to match.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm vitest run tests/modules/work-sessions/today-summary.route.test.ts`
Expected: FAIL with 404 (route not registered).

- [ ] **Step 3: Add controller method**

In `apps/api/src/modules/work-sessions/controllers/WorkSessionController.ts`, add after `getActive`:

```ts
async todaySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = req as AuthenticatedRequest
    const userId = auth.user?.id
    const tz = auth.user?.timezone ?? 'UTC'
    if (!userId) {
      ApiResponses.unauthorized().withRequestId((req as any).requestId).send(res, 401)
      return
    }
    const data = await this.service.getTodaySummary(userId, tz)
    ApiResponses.ok(data, 'Today work session summary')
      .withRequestId((req as any).requestId)
      .send(res)
  } catch (e) {
    next(e)
  }
}
```

- [ ] **Step 4: Register route**

In `apps/api/src/modules/work-sessions/routes.ts`, add above `router.get('/active', ...)`:

```ts
router.get('/today-summary', (req, res, next) => {
  void controller.todaySummary(req, res, next)
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd apps/api && pnpm vitest run tests/modules/work-sessions/today-summary.route.test.ts`
Expected: PASS (2 tests).

Also run the whole work-sessions test file to confirm no regressions:
`cd apps/api && pnpm vitest run tests/modules/work-sessions/`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/work-sessions/controllers/WorkSessionController.ts \
        apps/api/src/modules/work-sessions/routes.ts \
        apps/api/tests/modules/work-sessions/today-summary.route.test.ts
git commit -m "feat(api): expose GET /work-sessions/today-summary"
```

---

### Task 3: Web Pinia store `useWorkSessionSummaryStore`

**Files:**

- Create: `apps/web/stores/workSessionSummary.ts`
- Create: `apps/web/tests/stores/workSessionSummary.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/tests/stores/workSessionSummary.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'

vi.mock('@/config/environment', () => ({
  loadConfig: () => ({ api: { baseUrl: 'http://api.test' } }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('useWorkSessionSummaryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  it('starts empty', () => {
    const s = useWorkSessionSummaryStore()
    expect(s.totalSeconds).toBe(0)
    expect(s.perTask).toEqual({})
    expect(s.lastSessionEndedAt).toBeNull()
  })

  it('fetches and stores the summary', async () => {
    mockFetch.mockResolvedValueOnce({
      data: {
        calendarDate: '2026-04-21',
        totalSeconds: 1500,
        perTask: { t1: 900, t2: 600 },
        lastSessionEndedAt: '2026-04-21T15:00:00.000Z',
      },
    })
    const s = useWorkSessionSummaryStore()
    await s.refresh()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://api.test/work-sessions/today-summary',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(s.totalSeconds).toBe(1500)
    expect(s.perTask).toEqual({ t1: 900, t2: 600 })
    expect(s.lastSessionEndedAt).toBe('2026-04-21T15:00:00.000Z')
    expect(s.getSecondsFor('t1')).toBe(900)
    expect(s.getSecondsFor('unknown')).toBe(0)
  })

  it('leaves state unchanged on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'))
    const s = useWorkSessionSummaryStore()
    await s.refresh()
    expect(s.totalSeconds).toBe(0)
    expect(s.lastError).toBe('offline')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm vitest run tests/stores/workSessionSummary.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement the store**

Create `apps/web/stores/workSessionSummary.ts`:

```ts
import { defineStore } from 'pinia'
import { loadConfig } from '@/config/environment'

interface SummaryPayload {
  calendarDate: string
  totalSeconds: number
  perTask: Record<string, number>
  lastSessionEndedAt: string | null
}

export const useWorkSessionSummaryStore = defineStore('workSessionSummary', {
  state: () => ({
    calendarDate: '' as string,
    totalSeconds: 0 as number,
    perTask: {} as Record<string, number>,
    lastSessionEndedAt: null as string | null,
    lastError: null as string | null,
    loading: false as boolean,
  }),

  getters: {
    getSecondsFor: state => (taskId: string) => state.perTask[taskId] ?? 0,
  },

  actions: {
    async refresh(): Promise<void> {
      this.loading = true
      this.lastError = null
      try {
        const cfg = loadConfig()
        const res = (await $fetch(`${cfg.api.baseUrl}/work-sessions/today-summary`, {
          credentials: 'include',
        })) as { data: SummaryPayload }
        const d = res.data
        this.calendarDate = d.calendarDate
        this.totalSeconds = d.totalSeconds
        this.perTask = { ...d.perTask }
        this.lastSessionEndedAt = d.lastSessionEndedAt
      } catch (e) {
        this.lastError = e instanceof Error ? e.message : 'unknown error'
      } finally {
        this.loading = false
      }
    },
  },
})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && pnpm vitest run tests/stores/workSessionSummary.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/stores/workSessionSummary.ts \
        apps/web/tests/stores/workSessionSummary.test.ts
git commit -m "feat(web): add workSessionSummary Pinia store"
```

---

### Task 4: Composable `useTodayTaskView` — merge summary + timer into Task[]

**Files:**

- Create: `apps/web/composables/tasks/useTodayTaskView.ts`
- Create: `apps/web/tests/composables/useTodayTaskView.test.ts`

Purpose: produce a reactive `Task[]` where each task carries `totalTimeSpent` from the summary (plus live elapsed seconds if it's the currently running task), and where the active task carries `isRunning` / `timeRemaining` from `timerStore`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/tests/composables/useTodayTaskView.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTodayTaskView } from '@/composables/tasks/useTodayTaskView'
import { useTimerStore } from '@/stores/timer'
import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'
import { useTasksStore } from '@/stores/tasks'
import type { FrontendTask } from '@/types/task'

const mkFrontend = (id: string, title: string): FrontendTask => ({
  id,
  title,
  status: 'todo',
  priority: 'medium',
  isCompleted: false,
  startTime: new Date().toISOString(),
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

describe('useTodayTaskView', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('attaches totalTimeSpent from the summary per task', () => {
    const tasks = useTasksStore()
    ;(tasks as any).todayTasks = [mkFrontend('t1', 'A'), mkFrontend('t2', 'B')]
    const sum = useWorkSessionSummaryStore()
    sum.perTask = { t1: 900, t2: 0 }
    sum.totalSeconds = 900
    const view = useTodayTaskView()
    expect(view.tasks.value.find(t => t.id === 't1')!.totalTimeSpent).toBe(900)
    expect(view.tasks.value.find(t => t.id === 't2')!.totalTimeSpent).toBe(0)
  })

  it('reflects the active task: isRunning true + timeRemaining + live-elapsed added to totalTimeSpent', () => {
    const tasks = useTasksStore()
    ;(tasks as any).todayTasks = [mkFrontend('t1', 'A')]
    const sum = useWorkSessionSummaryStore()
    sum.perTask = { t1: 600 }
    const timer = useTimerStore()
    timer.activeTask = {
      id: 't1',
      name: 'A',
      timeLeft: 900,
      totalTime: 1500,
      type: 'Pomodoro',
      totalPausedTime: 0,
    } as any
    timer.isRunning = true
    timer.isPaused = false

    const view = useTodayTaskView()
    const t1 = view.tasks.value.find(t => t.id === 't1')!
    expect(t1.isRunning).toBe(true)
    expect(t1.timeRemaining).toBe(900)
    // 600 (closed sessions) + elapsed of active session (totalTime - timeLeft = 600)
    expect(t1.totalTimeSpent).toBe(1200)
  })

  it('dayTotalSeconds = summary.totalSeconds + active elapsed', () => {
    const tasks = useTasksStore()
    ;(tasks as any).todayTasks = [mkFrontend('t1', 'A')]
    const sum = useWorkSessionSummaryStore()
    sum.totalSeconds = 1000
    const timer = useTimerStore()
    timer.activeTask = {
      id: 't1',
      name: 'A',
      timeLeft: 400,
      totalTime: 1000,
      type: 'Pomodoro',
      totalPausedTime: 0,
    } as any
    timer.isRunning = true

    const view = useTodayTaskView()
    expect(view.dayTotalSeconds.value).toBe(1000 + 600)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm vitest run tests/composables/useTodayTaskView.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement the composable**

Create `apps/web/composables/tasks/useTodayTaskView.ts`:

```ts
import { computed } from 'vue'
import { frontendTaskToUiTask } from '@/types/task'
import type { Task } from '@/types/task'
import { useTasksStore } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'

export function useTodayTaskView() {
  const tasksStore = useTasksStore()
  const timerStore = useTimerStore()
  const summaryStore = useWorkSessionSummaryStore()

  const activeElapsedSeconds = computed<number>(() => {
    const a = timerStore.activeTask
    if (!a) return 0
    return Math.max(0, (a.totalTime ?? 0) - (a.timeLeft ?? 0))
  })

  const tasks = computed<Task[]>(() =>
    tasksStore.todayTasks.map(frontend => {
      const base = frontendTaskToUiTask(frontend)
      const closed = summaryStore.getSecondsFor(base.id)
      const isActive = timerStore.activeTask?.id === base.id
      return {
        ...base,
        isRunning: isActive && timerStore.isRunning,
        timeRemaining: isActive
          ? (timerStore.activeTask?.timeLeft ?? 0)
          : base.timeRemaining,
        totalTimeSpent: closed + (isActive ? activeElapsedSeconds.value : 0),
      }
    }),
  )

  const dayTotalSeconds = computed<number>(
    () => summaryStore.totalSeconds + activeElapsedSeconds.value,
  )

  return { tasks, dayTotalSeconds }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && pnpm vitest run tests/composables/useTodayTaskView.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/composables/tasks/useTodayTaskView.ts \
        apps/web/tests/composables/useTodayTaskView.test.ts
git commit -m "feat(web): add useTodayTaskView composable merging summary + timer state"
```

---

### Task 5: Wire the composable into `pages/today/index.vue`

**Files:**

- Modify: `apps/web/pages/today/index.vue`

- [ ] **Step 1: Replace the raw mapping**

In `apps/web/pages/today/index.vue:53`, replace:

```ts
const tasks = computed(() => tasksStore.todayTasks.map(frontendTaskToUiTask))
```

with:

```ts
const { tasks, dayTotalSeconds } = useTodayTaskView()
```

Remove the now-unused imports `frontendTaskToUiTask` and `computed` (if no longer used — check first) from the `<script setup>` block. Add:

```ts
import { useTodayTaskView } from '@/composables/tasks/useTodayTaskView'
import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'
```

- [ ] **Step 2: Fetch the summary on mount + refresh on timer completion**

In the same `<script setup>`, modify the `onMounted` hook and add a watcher:

```ts
const summaryStore = useWorkSessionSummaryStore()

onMounted(async () => {
  timerStore.loadPreferences()
  timerStore.loadDaySummary()
  await Promise.all([tasksStore.fetchToday(), summaryStore.refresh()])
  await loadSampleTasks()
})

// Refresh the summary when the active session ends (activeTask goes from set → null)
watch(
  () => timerStore.activeTask?.id ?? null,
  (curr, prev) => {
    if (prev && !curr) {
      void summaryStore.refresh()
    }
  },
)
```

Add `watch` to the Vue import: `import { computed, onMounted, ref, watch } from 'vue'` (keep `computed` only if still used elsewhere in the file — if the only `computed` was the removed mapping, drop it).

- [ ] **Step 3: Pass `dayTotalSeconds` down**

Update the `<TodayLayout>` template in `pages/today/index.vue:2-14` to include `:day-total-seconds="dayTotalSeconds"` and `:last-session-ended-at="summaryStore.lastSessionEndedAt"`:

```vue
<TodayLayout
  :tasks="tasks"
  :is-quick-task-loading="isQuickTaskLoading"
  :phase-data="getPhaseDataForHeader"
  :phase-loading="circadianLoading"
  :day-total-seconds="dayTotalSeconds"
  :last-session-ended-at="summaryStore.lastSessionEndedAt"
  @toggle-filters="showFilters = !showFilters"
  @create-task="handleQuickTask"
  @delete-task="handleDeleteTask"
  @reorder-tasks="handleReorderTasks"
  @complete-task-with-feedback="handleCompleteTaskWithFeedback"
  @update-task="handleUpdateTask"
  @add-note="handleAddNote"
/>
```

- [ ] **Step 4: Verify no existing page tests regress**

Run: `cd apps/web && pnpm vitest run tests/pages 2>/dev/null || true`

If any `today.test.ts` exists and fails due to the new prop wiring, update it to stub `useWorkSessionSummaryStore` following the pattern from `tests/composables/useTodayTaskView.test.ts`.

Also run the type-check:
Run: `cd apps/web && pnpm type-check`
Expected: PASS (or only pre-existing unrelated errors).

- [ ] **Step 5: Commit**

```bash
git add apps/web/pages/today/index.vue
git commit -m "feat(web): wire useTodayTaskView + summary refresh into today page"
```

---

### Task 6: `TodayTimeStrip` molecule — day total + idle counter

**Files:**

- Create: `apps/web/components/molecules/TodayTimeStrip.vue`
- Create: `apps/web/tests/components/TodayTimeStrip.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/tests/components/TodayTimeStrip.spec.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TodayTimeStrip from '@/components/molecules/TodayTimeStrip.vue'
import { useTimerStore } from '@/stores/timer'

describe('TodayTimeStrip', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-21T15:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats day total as "Xh Ym" when ≥1h', () => {
    const w = mount(TodayTimeStrip, {
      props: { dayTotalSeconds: 3_780, lastSessionEndedAt: null },
    })
    expect(w.text()).toContain('1h 3m')
  })

  it('formats day total as "Ym" when <1h', () => {
    const w = mount(TodayTimeStrip, {
      props: { dayTotalSeconds: 780, lastSessionEndedAt: null },
    })
    expect(w.text()).toContain('13m')
  })

  it('shows idle counter "Xm sin tarea" relative to lastSessionEndedAt', () => {
    const w = mount(TodayTimeStrip, {
      props: {
        dayTotalSeconds: 600,
        lastSessionEndedAt: '2026-04-21T14:48:00Z', // 12m ago
      },
    })
    expect(w.text()).toContain('12m sin tarea')
  })

  it('hides the idle counter while a timer is running', () => {
    const timer = useTimerStore()
    timer.activeTask = {
      id: 't1',
      name: 'A',
      timeLeft: 500,
      totalTime: 1500,
      type: 'Pomodoro',
      totalPausedTime: 0,
    } as any
    timer.isRunning = true
    const w = mount(TodayTimeStrip, {
      props: {
        dayTotalSeconds: 600,
        lastSessionEndedAt: '2026-04-21T14:48:00Z',
      },
    })
    expect(w.text()).not.toContain('sin tarea')
  })

  it('hides the idle counter when lastSessionEndedAt is null', () => {
    const w = mount(TodayTimeStrip, {
      props: { dayTotalSeconds: 0, lastSessionEndedAt: null },
    })
    expect(w.text()).not.toContain('sin tarea')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm vitest run tests/components/TodayTimeStrip.spec.ts`
Expected: FAIL (component missing).

- [ ] **Step 3: Implement the component**

Create `apps/web/components/molecules/TodayTimeStrip.vue`:

```vue
<template>
  <div class="tts" data-testid="today-time-strip">
    <span class="tts-item">
      <span class="tts-label">Hoy</span>
      <span class="tts-value">{{ formatTotal(dayTotalSeconds) }}</span>
    </span>
    <span v-if="showIdle" class="tts-item tts-item--idle">
      <span class="tts-dot">·</span>
      <span class="tts-value">{{ formatIdle(idleSeconds) }} sin tarea</span>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useTimerStore } from '@/stores/timer'

  interface Props {
    dayTotalSeconds: number
    lastSessionEndedAt: string | null
  }
  const props = defineProps<Props>()

  const timerStore = useTimerStore()
  const now = ref(Date.now())
  let tick: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    tick = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })
  onUnmounted(() => {
    if (tick) clearInterval(tick)
  })

  const idleSeconds = computed(() => {
    if (!props.lastSessionEndedAt) return 0
    const ended = new Date(props.lastSessionEndedAt).getTime()
    return Math.max(0, Math.floor((now.value - ended) / 1000))
  })

  const showIdle = computed(() => {
    if (!props.lastSessionEndedAt) return false
    if (timerStore.isRunning || timerStore.isPaused) return false
    return true
  })

  const formatTotal = (sec: number): string => {
    const s = Math.max(0, Math.floor(sec))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const formatIdle = (sec: number): string => {
    const s = Math.max(0, Math.floor(sec))
    if (s < 60) return `${s}s`
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }
</script>

<style scoped>
  .tts {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: rgba(100, 116, 139, 0.9);
    margin-top: 0.5rem;
  }
  .dark .tts {
    color: rgba(148, 163, 184, 0.8);
  }
  .tts-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }
  .tts-label {
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .tts-value {
    font-variant-numeric: tabular-nums;
  }
  .tts-dot {
    opacity: 0.5;
  }
  .tts-item--idle {
    opacity: 0.85;
  }
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && pnpm vitest run tests/components/TodayTimeStrip.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/molecules/TodayTimeStrip.vue \
        apps/web/tests/components/TodayTimeStrip.spec.ts
git commit -m "feat(web): add TodayTimeStrip molecule with day total + idle counter"
```

---

### Task 7: Mount `TodayTimeStrip` in `TodayHeader`

**Files:**

- Modify: `apps/web/components/organisms/today/TodayHeader.vue`
- Modify: `apps/web/components/organisms/today/TodayLayout.vue`

- [ ] **Step 1: Extend `TodayLayout` props + forward them**

In `apps/web/components/organisms/today/TodayLayout.vue:40-47`, update the `Props` interface:

```ts
interface Props {
  tasks: Task[]
  isQuickTaskLoading: boolean
  phaseData?: any
  phaseLoading?: boolean
  dayTotalSeconds: number
  lastSessionEndedAt: string | null
}
```

And update the `<TodayHeader>` usage (around line 4):

```vue
<TodayHeader
  :phase-data="phaseData"
  :phase-loading="phaseLoading"
  :day-total-seconds="dayTotalSeconds"
  :last-session-ended-at="lastSessionEndedAt"
  @toggle-filters="$emit('toggle-filters')"
/>
```

- [ ] **Step 2: Add props to `TodayHeader` and render the strip**

In `apps/web/components/organisms/today/TodayHeader.vue`, inside `<script setup>` replace the current `defineEmits` line with:

```ts
import TodayTimeStrip from '@/components/molecules/TodayTimeStrip.vue'

interface Props {
  phaseData?: any
  phaseLoading?: boolean
  dayTotalSeconds: number
  lastSessionEndedAt: string | null
}
defineProps<Props>()
defineEmits<{ (e: 'toggle-filters'): void }>()
```

In the template, insert `<TodayTimeStrip>` below `<CircadianPhaseCard />` (around line 14):

```vue
<CircadianPhaseCard />
<TodayTimeStrip
  :day-total-seconds="dayTotalSeconds"
  :last-session-ended-at="lastSessionEndedAt"
/>
```

- [ ] **Step 3: Smoke-test in the browser**

Run the web dev server and verify manually:

```bash
pnpm dev:web
```

Open `http://localhost:3000/today` and:

- Confirm the header shows `Hoy: 0m` on a fresh day (no sessions).
- Start a timer on a task and wait ~10s; the day total ticks, the "sin tarea" label disappears, and the task card shows `timeRemaining`.
- Complete the timer via the feedback modal; the card's `totalTimeSpent` grows, the "sin tarea" label reappears and counts up from 0.

If the dev server isn't available, skip this step and rely on the unit tests — but note in the commit that manual verification was deferred.

- [ ] **Step 4: Run all affected tests**

```bash
cd apps/web && pnpm vitest run tests/components/TodayTimeStrip.spec.ts tests/composables/useTodayTaskView.test.ts tests/stores/workSessionSummary.test.ts
cd apps/web && pnpm type-check
```

Expected: PASS on both commands (type-check may report pre-existing unrelated issues — compare against baseline from Task 5 Step 4).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/organisms/today/TodayHeader.vue \
        apps/web/components/organisms/today/TodayLayout.vue
git commit -m "feat(web): render TodayTimeStrip in today header"
```

---

## Post-Implementation Verification

Run before opening the PR:

```bash
pnpm lint
pnpm type-check
pnpm test
```

All three must pass. If `pnpm test` hits API tests that need a DB, confirm Docker Postgres is up (`pnpm docker:up`) before running.
