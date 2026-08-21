import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TrainingPage from '@/pages/training/index.vue'
import { mockWeeklyPlan } from '@/data/mockWeeklyPlan'
import { useTrainingStore } from '@/stores/training'
import type { ExerciseLog, TrainingSessionCheck } from '@/types/training'

const api = vi.hoisted(() => ({
  getLogs: vi.fn(),
  getSessionChecks: vi.fn(),
  getWeek: vi.fn(),
}))

vi.mock('@/composables/useTrainingApi', () => ({
  useTrainingApi: () => api,
}))

function mountPage(mockStore = false) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useTrainingStore(pinia)
  if (mockStore) {
    store.week = mockWeeklyPlan
    store.loadWeek = vi.fn().mockResolvedValue(mockWeeklyPlan)
    store.loadLogs = vi.fn().mockResolvedValue([])
    store.loadSessionChecks = vi.fn().mockResolvedValue([])
    store.saveLogs = vi.fn().mockResolvedValue([])
    store.saveSessionCheck = vi.fn().mockImplementation(async value => value)
  }
  const wrapper = shallowMount(TrainingPage, {
    global: {
      plugins: [pinia],
      stubs: {
        PageHeader: {
          props: ['title'],
          template: '<header><h1>{{ title }}</h1><slot name="actions" /></header>',
        },
        PlanAiWeekGenerator: {
          emits: ['open'],
          template: '<button @click="$emit(\'open\')">Generate week</button>',
        },
        PlanWeekStrip: true,
        TrainingDaySession: {
          name: 'TrainingDaySession',
          props: ['logs', 'sessionCheck'],
          emits: ['update:logs', 'update:sessionCheck'],
          template: '<div />',
        },
        TrainingExportButton: true,
        TrainingGenerateWeekModal: true,
      },
    },
  })
  return { store, wrapper }
}

describe('training page', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 20, 12))
    api.getLogs.mockResolvedValue([])
    api.getSessionChecks.mockResolvedValue([])
    api.getWeek.mockResolvedValue(null)
  })

  afterEach(() => vi.useRealTimers())

  it('loads the remote week and offers generation for an empty week', async () => {
    const { wrapper } = mountPage()

    await vi.waitFor(() => expect(api.getWeek).toHaveBeenCalledTimes(1))
    expect(wrapper.text()).toContain('Rest day')
    expect(wrapper.text()).toContain('Generate week')
    expect(wrapper.text()).not.toContain('Not saved remotely')
  })

  it('loads logs and session checks for the visible week', async () => {
    const { store } = mountPage(true)

    await vi.waitFor(() => {
      expect(store.loadLogs).toHaveBeenCalledWith('2026-08-17', '2026-08-23')
      expect(store.loadSessionChecks).toHaveBeenCalledWith([
        '2026-08-17',
        '2026-08-18',
        '2026-08-19',
        '2026-08-20',
        '2026-08-21',
        '2026-08-22',
        '2026-08-23',
      ])
    })
  })

  it('persists log and session-check updates through the store', async () => {
    const { store, wrapper } = mountPage(true)
    await vi.waitFor(() => expect(store.loadWeek).toHaveBeenCalled())
    const session = wrapper.getComponent({ name: 'TrainingDaySession' })
    const log: ExerciseLog = {
      exerciseId: mockWeeklyPlan.days[0]!.exercises[0]!.id,
      dayKey: '2026-08-17',
      note: null,
      sets: [],
    }
    const check: TrainingSessionCheck = {
      dayKey: '2026-08-17',
      startStatus: 'skipped',
      endStatus: 'none',
      start: null,
      end: null,
    }

    session.vm.$emit('update:logs', [log])
    session.vm.$emit('update:sessionCheck', check)

    await vi.waitFor(() => {
      expect(store.saveLogs).toHaveBeenCalledWith([log])
      expect(store.saveSessionCheck).toHaveBeenCalledWith(check)
    })
  })
})
