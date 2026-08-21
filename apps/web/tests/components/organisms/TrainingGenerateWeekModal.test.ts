import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TrainingGenerateWeekModal from '@/components/organisms/TrainingGenerateWeekModal.vue'

const api = vi.hoisted(() => ({
  chat: vi.fn(),
  generateWeek: vi.fn(),
  applyWeek: vi.fn(),
}))

vi.mock('@/composables/useTrainingApi', () => ({
  useTrainingApi: () => api,
}))

const generatedWeek = {
  id: 'week-1',
  weekStart: '2026-08-17',
  status: 'draft' as const,
  blockPhase: 'accumulation' as const,
  weekInBlock: 1,
  programTemplateCode: 'WFITNESS_3D',
  summary: 'Three balanced sessions.',
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
          exerciseId: 'bench-press',
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

const stubs = {
  BaseModal: {
    props: ['isOpen'],
    template: '<div v-if="isOpen"><slot /></div>',
  },
  BaseButton: {
    props: ['disabled', 'loading'],
    emits: ['click'],
    template:
      '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
  },
}

function mountModal() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(TrainingGenerateWeekModal, {
    props: {
      isOpen: true,
      weekStart: new Date(2026, 7, 17),
    },
    global: {
      plugins: [pinia],
      stubs,
    },
  })
}

describe('TrainingGenerateWeekModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.chat.mockResolvedValue({
      assistantMessage: 'Your profile is ready.',
      profileDraft: null,
      readyToGenerate: true,
      stop: false,
    })
    api.generateWeek.mockResolvedValue(generatedWeek)
    api.applyWeek.mockResolvedValue({
      week: { ...generatedWeek, status: 'applied' },
      profile: {},
    })
  })

  it('uses intake chat, previews exercise days, and applies the generated week', async () => {
    const wrapper = mountModal()

    expect(
      wrapper.get('button[aria-label="Generate preview"]').attributes('disabled'),
    ).toBeDefined()
    await wrapper.get('textarea').setValue('Intermediate, three days, full gym.')
    await wrapper.get('button[aria-label="Send message"]').trigger('click')
    await vi.waitFor(() => expect(api.chat).toHaveBeenCalledTimes(1))

    const messages = api.chat.mock.calls[0]?.[0]
    expect(messages).toEqual([
      { role: 'user', content: 'Intermediate, three days, full gym.' },
    ])

    const previewButton = wrapper.get('button[aria-label="Generate preview"]')
    await vi.waitFor(() => expect(previewButton.attributes('disabled')).toBeUndefined())
    await previewButton.trigger('click')
    await vi.waitFor(() => expect(api.generateWeek).toHaveBeenCalledWith('2026-08-17'))
    await vi.waitFor(() => expect(wrapper.text()).toContain('Upper'))

    expect(wrapper.text()).toContain('Bench press')
    expect(wrapper.text()).toContain('3x8')

    await wrapper.get('button[aria-label="Apply week"]').trigger('click')
    await vi.waitFor(() => expect(api.applyWeek).toHaveBeenCalledWith('week-1'))
    await vi.waitFor(() => expect(wrapper.emitted('applied')).toHaveLength(1))
  })

  it('discards an unapplied preview when closed', async () => {
    const wrapper = mountModal()
    await wrapper.get('textarea').setValue('Intermediate, three days, full gym.')
    await wrapper.get('button[aria-label="Send message"]').trigger('click')
    const previewButton = wrapper.get('button[aria-label="Generate preview"]')
    await vi.waitFor(() => expect(previewButton.attributes('disabled')).toBeUndefined())
    await previewButton.trigger('click')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Bench press'))

    await wrapper
      .get('button[aria-label="Close generate training week"]')
      .trigger('click')

    const { useTrainingStore } = await import('@/stores/training')
    expect(useTrainingStore().week).toBeNull()
  })
})
