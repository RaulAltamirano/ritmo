import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/composables/shared/useHttpClient', () => ({
  useHttpClient: () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  }),
}))

import { useTodayTaskView } from '@/composables/tasks/useTodayTaskView'
import { useTimerStore } from '@/stores/timer'
import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'
import { useTasksStore } from '@/stores/tasks'
import type { FrontendTask } from '@/types/task'

const nowIso = () => new Date().toISOString()

const mkFrontend = (id: string, title: string): FrontendTask => ({
  id,
  title,
  status: 'todo',
  priority: 'medium',
  isCompleted: false,
  startTime: nowIso(),
  tags: [],
  createdAt: nowIso(),
  updatedAt: nowIso(),
})

describe('useTodayTaskView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('attaches totalTimeSpent from the summary per task', () => {
    const tasksStore = useTasksStore()
    tasksStore.tasks = [mkFrontend('t1', 'A'), mkFrontend('t2', 'B')]

    const sum = useWorkSessionSummaryStore()
    sum.perTask = { t1: 900, t2: 0 }
    sum.totalSeconds = 900

    const view = useTodayTaskView()
    expect(view.tasks.value).toHaveLength(2)
    expect(view.tasks.value.find(t => t.id === 't1')!.totalTimeSpent).toBe(900)
    expect(view.tasks.value.find(t => t.id === 't2')!.totalTimeSpent).toBe(0)
  })

  it('reflects the active task: isRunning + timeRemaining + live elapsed', () => {
    const tasksStore = useTasksStore()
    tasksStore.tasks = [mkFrontend('t1', 'A')]

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
    // 600 closed + (1500 - 900) elapsed on active = 1200
    expect(t1.totalTimeSpent).toBe(1200)
  })

  it('dayTotalSeconds = summary.totalSeconds + active elapsed', () => {
    const tasksStore = useTasksStore()
    tasksStore.tasks = [mkFrontend('t1', 'A')]

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

  it('when no active task: isRunning false and totalTimeSpent = summary only', () => {
    const tasksStore = useTasksStore()
    tasksStore.tasks = [mkFrontend('t1', 'A')]

    const sum = useWorkSessionSummaryStore()
    sum.perTask = { t1: 300 }
    sum.totalSeconds = 300

    const view = useTodayTaskView()
    const t1 = view.tasks.value[0]!
    expect(t1.isRunning).toBe(false)
    expect(t1.totalTimeSpent).toBe(300)
    expect(view.dayTotalSeconds.value).toBe(300)
  })
})
