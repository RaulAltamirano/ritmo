import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BreakTimerModal from '@/components/molecules/BreakTimerModal.vue'
import { useTimerStore } from '@/stores/timer'

vi.mock('@/utils/secureStorage', () => ({
  secureSet: vi.fn(),
  secureGet: vi.fn().mockResolvedValue(null),
}))
vi.mock('@/services/workSessionsApi', () => ({
  patchWorkSession: vi.fn(),
  abandonWorkSession: vi.fn(),
}))
vi.mock('@/composables/shared/useNotify', () => ({
  useNotify: () => ({ notify: vi.fn() }),
}))

function prepareBreak() {
  const store = useTimerStore()
  store.activeTask = {
    id: 't1',
    name: 'Task',
    timeLeft: 185,
    totalTime: 300,
    type: 'Pomodoro',
    totalPausedTime: 0,
    startedAt: new Date(),
  }
  store.phase = 'break'
  store.isRunning = true
  store.isPaused = false
  store.breakDurationSec = 300
  store.breakModalOpen = true
  return store
}

function mountModal() {
  return mount(BreakTimerModal, {
    global: {
      stubs: {
        BaseModal: {
          name: 'BaseModal',
          props: ['isOpen'],
          template: '<div v-if="isOpen"><slot /></div>',
        },
        BreakRestIllustration: true,
      },
    },
  })
}

describe('BreakTimerModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders Descanso, remaining time, and action buttons', () => {
    prepareBreak()
    const wrapper = mountModal()
    expect(wrapper.text()).toContain('Descanso')
    expect(wrapper.text()).toMatch(/0?3:05/)
    expect(wrapper.text()).toContain('Cerrar')
    expect(wrapper.text()).toContain('Pausar')
    expect(wrapper.text()).toContain('Saltar')
  })

  it('Cerrar dismisses modal without skipping break', async () => {
    const store = prepareBreak()
    const skipSpy = vi.spyOn(store, 'skipBreak')
    const wrapper = mountModal()
    await wrapper.get('[data-testid="break-modal-close"]').trigger('click')
    expect(store.breakModalOpen).toBe(false)
    expect(store.phase).toBe('break')
    expect(skipSpy).not.toHaveBeenCalled()
  })

  it('Saltar calls skipBreak', async () => {
    const store = prepareBreak()
    const skipSpy = vi.spyOn(store, 'skipBreak').mockResolvedValue(undefined)
    const wrapper = mountModal()
    await wrapper.get('[data-testid="break-modal-skip"]').trigger('click')
    expect(skipSpy).toHaveBeenCalled()
  })

  it('Saltar ignores duplicate clicks while skip is in flight', async () => {
    const store = prepareBreak()
    let resolveSkip: () => void = () => {}
    const skipSpy = vi.spyOn(store, 'skipBreak').mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveSkip = resolve
        }),
    )
    const wrapper = mountModal()
    const btn = wrapper.get('[data-testid="break-modal-skip"]')
    await btn.trigger('click')
    await btn.trigger('click')
    expect(skipSpy).toHaveBeenCalledTimes(1)
    resolveSkip()
    await skipSpy.mock.results[0]?.value
  })
})
