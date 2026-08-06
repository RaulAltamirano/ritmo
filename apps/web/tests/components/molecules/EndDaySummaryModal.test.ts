import { flushPromises, mount } from '@vue/test-utils'
import EndDaySummaryModal from '@/components/molecules/EndDaySummaryModal.vue'
import { useSessionGateStore } from '@/stores/sessionGate'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const listWorkSessions = vi.fn()

vi.mock('@/services/workSessionsApi', () => ({
  listWorkSessions: (...args: unknown[]) => listWorkSessions(...args),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { timezone: 'UTC' },
  }),
}))

vi.mock('@/utils/civilDate', () => ({
  getCivilDateYmd: () => '2026-08-05',
}))

describe('EndDaySummaryModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  function mountModal() {
    return mount(EndDaySummaryModal, {
      global: {
        stubs: {
          BaseModal: {
            name: 'BaseModal',
            props: ['isOpen', 'title'],
            template: '<div v-if="isOpen"><slot /></div>',
          },
          BaseButton: {
            template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })
  }

  it('loads and renders session rows when End Day opens', async () => {
    listWorkSessions.mockResolvedValue({
      data: {
        items: [
          {
            id: 'ws-1',
            state: 'completed',
            startTime: '2026-08-05T10:00:00.000Z',
            endTime: '2026-08-05T10:30:00.000Z',
            pausedDurationSec: 0,
            breakStartedAt: '2026-08-05T10:25:00.000Z',
            breakPausedDurationSec: 0,
            task: { id: 't1', title: 'Leer docs' },
          },
          {
            id: 'ws-2',
            state: 'running',
            startTime: '2026-08-05T09:00:00.000Z',
            endTime: null,
            pausedDurationSec: 0,
            breakStartedAt: null,
            breakPausedDurationSec: 0,
            task: { id: 't2', title: 'Escribir plan' },
          },
        ],
      },
    })

    const gate = useSessionGateStore()
    const wrapper = mountModal()
    gate.openEndDaySummary()
    await flushPromises()

    expect(listWorkSessions).toHaveBeenCalledWith({
      from: '2026-08-05',
      to: '2026-08-05',
      limit: 100,
    })
    const html = wrapper.html()
    expect(html).toMatch(/Escribir plan/)
    expect(html).toMatch(/Leer docs/)
    expect(html).toMatch(/Completada/)
    expect(html).toMatch(/En curso/)
    expect(html).toMatch(/Foco/)
    expect(html).toMatch(/Descanso/)
    expect(html).toMatch(/Bloques/)
  })

  it('shows empty state when there are no sessions', async () => {
    listWorkSessions.mockResolvedValue({ data: { items: [] } })
    const gate = useSessionGateStore()
    const wrapper = mountModal()
    gate.openEndDaySummary()
    await flushPromises()

    expect(wrapper.text()).toMatch(/Hoy no hay bloques registrados/)
  })

  it('shows error and retries on failure', async () => {
    listWorkSessions
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ data: { items: [] } })

    const gate = useSessionGateStore()
    const wrapper = mountModal()
    gate.openEndDaySummary()
    await flushPromises()

    expect(wrapper.text()).toMatch(/No se pudo cargar el resumen|network/i)
    const callsBeforeRetry = listWorkSessions.mock.calls.length
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(listWorkSessions.mock.calls.length).toBeGreaterThan(callsBeforeRetry)
    expect(wrapper.text()).toMatch(/Hoy no hay bloques registrados/)
  })

  it('closes via isOpen update', async () => {
    listWorkSessions.mockResolvedValue({ data: { items: [] } })
    const gate = useSessionGateStore()
    const wrapper = mountModal()
    gate.openEndDaySummary()
    await flushPromises()

    const vm = wrapper.vm as unknown as {
      handleIsOpenUpdate: (open: boolean) => void
    }
    vm.handleIsOpenUpdate(false)
    expect(gate.showEndDaySummary).toBe(false)
  })
})
