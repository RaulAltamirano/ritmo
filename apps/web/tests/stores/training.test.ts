import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { ExerciseLog } from '@/types/training'

const api = vi.hoisted(() => ({
  getWeek: vi.fn(),
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
    expect(store.week?.days[0]?.exercises[0]?.rpe).toBe('8')
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
})
