import { flushPromises, mount } from '@vue/test-utils'
import WorkBlockFeedbackModal from '@/components/molecules/WorkBlockFeedbackModal.vue'
import { useSessionGateStore } from '@/stores/sessionGate'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const completeWorkSession = vi.fn(() => Promise.resolve({}))
const abandonWorkSession = vi.fn(() => Promise.resolve({}))

vi.mock('@/services/workSessionsApi', () => ({
  completeWorkSession: (...args: unknown[]) => completeWorkSession(...args),
  abandonWorkSession: (...args: unknown[]) => abandonWorkSession(...args),
}))

vi.mock('@/utils/idempotency', () => ({
  newIdempotencyKey: () => 'test-idempotency-key',
}))

describe('WorkBlockFeedbackModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    const gate = useSessionGateStore()
    gate.openFeedback('ws-123')
  })

  it('renders check-in style scales and optional notes (no task-only fields)', () => {
    const wrapper = mount(WorkBlockFeedbackModal, {
      global: {
        stubs: {
          BaseModal: { template: '<div><slot /></div>', props: ['isOpen'] },
          BaseButton: true,
        },
      },
    })
    const html = wrapper.html()
    expect(html).not.toMatch(/Foco percibido|Progreso percibido|Encaje temporal/i)
    expect(html).toMatch(/RPE cognitivo/i)
    expect(html).toMatch(/Fricción/i)
    expect(html).toMatch(/Energía al terminar/i)
    expect(html).toMatch(/Nota libre/i)
    expect(html).toMatch(/Bloqueador/i)
    // No native range sliders / selects
    expect(wrapper.find('input[type="range"]').exists()).toBe(false)
    expect(wrapper.find('select').exists()).toBe(false)
  })

  it('submits reflection with notes trimmed', async () => {
    const wrapper = mount(WorkBlockFeedbackModal, {
      global: {
        stubs: {
          BaseModal: { template: '<div><slot /><slot name="footer" /></div>' },
          BaseButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })

    await flushPromises()
    const vm = wrapper.vm as unknown as {
      form: { notes: string }
      onSubmit: () => Promise<void>
    }
    vm.form.notes = '  hello  '
    await vm.onSubmit()
    await flushPromises()

    expect(completeWorkSession).toHaveBeenCalledWith(
      'ws-123',
      { 'Idempotency-Key': 'test-idempotency-key' },
      expect.objectContaining({
        notes: 'hello',
      }),
    )
  })

  it('submits boundary scale values (1 and 5) verbatim', async () => {
    const wrapper = mount(WorkBlockFeedbackModal, {
      global: {
        stubs: {
          BaseModal: { template: '<div><slot /><slot name="footer" /></div>' },
          BaseButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })

    await flushPromises()
    const vm = wrapper.vm as unknown as {
      form: { rpeCognitive: number; frictionScore: number; energyAfter: number }
      onSubmit: () => Promise<void>
    }
    vm.form.rpeCognitive = 1
    vm.form.frictionScore = 5
    vm.form.energyAfter = 1
    await vm.onSubmit()
    await flushPromises()

    expect(completeWorkSession).toHaveBeenCalledWith(
      'ws-123',
      { 'Idempotency-Key': 'test-idempotency-key' },
      expect.objectContaining({
        rpeCognitive: 1,
        frictionScore: 5,
        energyAfter: 1,
      }),
    )
  })

  it('enforces 500-char maxlength on the notes textarea', () => {
    const wrapper = mount(WorkBlockFeedbackModal, {
      global: {
        stubs: {
          BaseModal: { template: '<div><slot /><slot name="footer" /></div>' },
          BaseButton: true,
        },
      },
    })
    const textarea = wrapper.find('textarea#reflection-notes')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('maxlength')).toBe('500')
  })

  it('passes close-on-backdrop-click=false to BaseModal', () => {
    const wrapper = mount(WorkBlockFeedbackModal, {
      global: {
        stubs: {
          BaseModal: {
            name: 'BaseModal',
            template: '<div data-test="base-modal"><slot /></div>',
            props: ['isOpen', 'closeOnBackdropClick'],
          },
          BaseButton: true,
        },
      },
    })
    const modal = wrapper.findComponent({ name: 'BaseModal' })
    expect(modal.exists()).toBe(true)
    expect(modal.props('closeOnBackdropClick')).toBe(false)
  })
})
