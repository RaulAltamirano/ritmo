import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FloatingTimer from '@/components/molecules/FloatingTimer.vue'
import { useTimerStore } from '@/stores/timer'

const patchWorkSessionMock = vi.fn()

vi.mock('@/utils/secureStorage', () => ({
  secureSet: vi.fn(),
  secureGet: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/services/workSessionsApi', () => ({
  patchWorkSession: (...args: unknown[]) => patchWorkSessionMock(...args),
  abandonWorkSession: vi.fn(),
}))

vi.mock('@/composables/shared/useNotify', () => ({
  useNotify: () => ({
    notify: vi.fn(),
  }),
}))

vi.mock('@/stores/sessionGate', () => ({
  useSessionGateStore: () => ({
    showFeedback: false,
    feedbackWorkSessionId: null as string | null,
    openFeedback: vi.fn(),
  }),
}))

describe('FloatingTimer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    patchWorkSessionMock.mockResolvedValue({ data: {} })
  })

  function prepareStore(
    opts: {
      phase?: 'focus' | 'break'
      remoteId?: string | null
      timeLeft?: number
    } = {},
  ) {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useTimerStore()
    store.showFloatingTimer = true
    store.activeTask = {
      id: 't1',
      name: 'T',
      timeLeft: opts.timeLeft ?? 300,
      totalTime: opts.phase === 'break' ? 300 : 1500,
      type: opts.phase === 'break' ? 'Descanso' : 'Pomodoro',
      totalPausedTime: 0,
      startedAt: new Date(),
    }
    store.isRunning = true
    store.isPaused = false
    store.phase = opts.phase ?? 'focus'
    if (opts.phase === 'break') {
      store.breakDurationSec = 300
      store.breakStartedAt = new Date()
      store.breakPausedDurationSec = 0
    }
    store.remoteWorkSessionId = opts.remoteId ?? null
    return { pinia, store }
  }

  function mountTimer(pinia: ReturnType<typeof createPinia>) {
    return mount(FloatingTimer, {
      attachTo: document.body,
      global: {
        plugins: [pinia],
        stubs: {
          Teleport: {
            template: '<div><slot /></div>',
          },
          ProgressStrip: true,
          Clock: true,
          Pause: true,
          Play: true,
          RotateCcw: true,
          X: true,
          Timer: true,
          Waves: true,
          SlidersHorizontal: true,
        },
      },
    })
  }

  it('renders break phase label and skip control', async () => {
    const { pinia } = prepareStore({ phase: 'break' })
    const wrapper = mountTimer(pinia)
    await flushPromises()

    expect(wrapper.text()).toMatch(/Descanso/)
    expect(wrapper.find('button[aria-label="Saltar descanso"]').exists()).toBe(true)
    const pill = wrapper.get('[role="button"]')
    expect(pill.attributes('aria-label')).toBe(
      'Descanso: 5:00 restante. Click para abrir el descanso',
    )
    expect(pill.attributes('aria-expanded')).toBeUndefined()
  })

  it('hides reset button when bound to a remote session', async () => {
    const { pinia } = prepareStore({ remoteId: 'ws_123', timeLeft: 600 })
    const wrapper = mountTimer(pinia)
    await flushPromises()

    expect(wrapper.find('button[aria-label="Reiniciar timer"]').exists()).toBe(false)
  })

  it('shows reset button for local-only timer', async () => {
    const { pinia } = prepareStore({ timeLeft: 600 })
    const wrapper = mountTimer(pinia)
    await flushPromises()

    expect(wrapper.find('button[aria-label="Reiniciar timer"]').exists()).toBe(true)
  })

  it('calls skipBreak when skip control is clicked', async () => {
    const { pinia } = prepareStore({
      phase: 'break',
      remoteId: 'ws_123',
      timeLeft: 180,
    })
    const wrapper = mountTimer(pinia)
    await flushPromises()

    const skip = wrapper.find('button[aria-label="Saltar descanso"]')
    expect(skip.exists()).toBe(true)
    await skip.trigger('click')
    await flushPromises()

    expect(patchWorkSessionMock).toHaveBeenCalledWith(
      'ws_123',
      expect.objectContaining({ state: 'pending_feedback' }),
    )
  })

  it('opens break modal when clicking pill during break', async () => {
    const { pinia, store } = prepareStore({ phase: 'break', timeLeft: 200 })
    store.breakModalOpen = false
    const wrapper = mountTimer(pinia)
    await flushPromises()
    const pill = wrapper.get('[role="button"]')
    await pill.trigger('click')
    expect(store.breakModalOpen).toBe(true)
  })
})
