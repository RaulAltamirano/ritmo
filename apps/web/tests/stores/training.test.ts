import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { ExerciseLog } from '@/types/training'

const api = vi.hoisted(() => ({
  getWeek: vi.fn(),
  getLogs: vi.fn(),
  getSessionChecks: vi.fn(),
  saveLog: vi.fn(),
}))

vi.mock('@/composables/useTrainingApi', () => ({
  useTrainingApi: () => api,
}))

const apiWeek = {
  id: 'week-1',
  weekStart: '2026-08-17',
  status: 'draft' as const,
  blockPhase: 'accumulation' as const,
  weekInBlock: 1,
  programTemplateCode: 'WFITNESS_3D',
  summary: null,
  warning: null,
  substitutions: [],
  days: [
    {
      id: 'day-1',
      dayNumber: 1,
      name: 'Upper',
      focus: 'upper' as const,
      weekday: 1,
      date: '2026-08-17',
      exercises: [
        {
          id: 'entry-1',
          exerciseId: 'exercise-1',
          name: 'Bench press',
          block: 'a' as const,
          setsReps: '3x8',
          targetRir: '2',
          targetRpe: '8',
        },
      ],
    },
  ],
}

const log: ExerciseLog = {
  exerciseId: 'exercise-1',
  dayKey: '2026-08-17',
  note: null,
  sets: [],
}

describe('training store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads and maps a training week for existing components', async () => {
    api.getWeek.mockResolvedValue(apiWeek)
    const { useTrainingStore } = await import('@/stores/training')
    const store = useTrainingStore()

    await store.loadWeek('2026-08-17')

    expect(api.getWeek).toHaveBeenCalledWith('2026-08-17')
    expect(store.week?.days[0]?.exercises[0]?.id).toBe('exercise-1')
    expect(store.week?.days[0]?.exercises[0]?.rpe).toBe('8')
    expect(store.week?.blockPhase).toBe('accumulation')
    expect(store.week?.weekInBlock).toBe(1)
  })

  it('persists logs and replaces matching local entries', async () => {
    api.saveLog.mockResolvedValue({ ...log, note: 'saved' })
    const { useTrainingStore } = await import('@/stores/training')
    const store = useTrainingStore()
    store.logs = [log]

    await store.saveLogs([{ ...log, note: 'draft' }])

    expect(api.saveLog).toHaveBeenCalledWith({ ...log, note: 'draft' })
    expect(store.logs).toEqual([{ ...log, note: 'saved' }])
  })

  it('clears week-scoped data before a new load', async () => {
    const { useTrainingStore } = await import('@/stores/training')
    const store = useTrainingStore()
    store.week = { id: 'week-1' } as never
    store.logs = [log]
    store.sessionChecks = [{ dayKey: '2026-08-17' } as never]

    store.clearWeekData()

    expect(store.week).toBeNull()
    expect(store.logs).toEqual([])
    expect(store.sessionChecks).toEqual([])
  })

  it('ignores stale week loads after clearWeekData', async () => {
    let resolveWeek: (value: typeof apiWeek) => void = () => undefined
    api.getWeek.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveWeek = resolve
        }),
    )
    const { useTrainingStore } = await import('@/stores/training')
    const store = useTrainingStore()
    store.logs = [log]

    const pending = store.loadWeek('2026-08-17')
    store.clearWeekData()
    resolveWeek(apiWeek)
    await pending

    expect(store.week).toBeNull()
    expect(store.logs).toEqual([])
  })

  it('ignores stale log loads after clearWeekData', async () => {
    let resolveLogs: (value: ExerciseLog[]) => void = () => undefined
    api.getLogs.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveLogs = resolve
        }),
    )
    const { useTrainingStore } = await import('@/stores/training')
    const store = useTrainingStore()

    const pending = store.loadLogs('2026-08-17', '2026-08-23')
    store.clearWeekData()
    resolveLogs([log])
    await pending

    expect(store.logs).toEqual([])
  })
})
