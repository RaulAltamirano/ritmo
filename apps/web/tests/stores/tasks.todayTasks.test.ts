import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { getCivilDateYmd } from '@/utils/civilDate'

vi.mock('@/composables/shared/useHttpClient', () => ({
  useHttpClient: () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  }),
}))

/** Old browser-local day filter (the bug). */
function oldLocalDayFilterIncludes(startTimeIso: string, now: Date): boolean {
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
  const d = new Date(startTimeIso)
  return d >= startOfDay && d <= endOfDay
}

const fixtureTask = {
  id: 'task-madrid-edge',
  title: 'Edge task',
  status: 'todo',
  priority: 'medium',
  isCompleted: false,
  // 2026-04-22T00:30:00.000Z → civil 2026-04-22 in Europe/Madrid (02:30 CEST);
  // UTC calendar day 2026-04-22, i.e. AFTER `now`'s UTC day (2026-04-21), so the
  // old browser-UTC midnight filter drops it while /tasks/today (Madrid) keeps it.
  startTime: '2026-04-22T00:30:00.000Z',
  tags: [] as string[],
  createdAt: '2026-04-22T00:30:00.000Z',
  updatedAt: '2026-04-22T00:30:00.000Z',
}

describe('tasks store todayTasks (trust API day)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.unstubAllEnvs()
    vi.stubEnv('TZ', 'UTC')
  })

  it('keeps a Madrid-civil-today task that UTC local-day filter would drop', async () => {
    vi.useFakeTimers()
    const now = new Date('2026-04-21T23:45:00.000Z')
    vi.setSystemTime(now)

    expect(getCivilDateYmd('Europe/Madrid', new Date(fixtureTask.startTime))).toBe(
      '2026-04-22',
    )
    expect(getCivilDateYmd('UTC', now)).toBe('2026-04-21')
    expect(oldLocalDayFilterIncludes(fixtureTask.startTime, now)).toBe(false)

    const { useTasksStore } = await import('@/stores/tasks')
    const store = useTasksStore()
    store.tasks = [fixtureTask]

    expect(store.todayTasks.map(t => t.id)).toEqual(['task-madrid-edge'])

    vi.useRealTimers()
  })
})
