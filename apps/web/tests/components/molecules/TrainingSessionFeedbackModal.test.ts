import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TrainingSessionFeedbackModal from '@/components/molecules/TrainingSessionFeedbackModal.vue'

const modalStubs = {
  BaseModal: {
    props: ['isOpen'],
    emits: ['update:isOpen'],
    template:
      '<div v-if="isOpen"><div data-testid="base-modal"><slot /></div></div>',
  },
  BaseButton: {
    props: ['disabled', 'loading', 'variant', 'size', 'type'],
    emits: ['click'],
    template:
      '<button :disabled="disabled || loading" :type="type || \'button\'" @click="$emit(\'click\', $event)"><slot /></button>',
  },
}

function mountModal(props: Record<string, unknown> = {}) {
  return mount(TrainingSessionFeedbackModal, {
    props: {
      isOpen: true,
      phase: 'start',
      sessionName: 'Empuje / Tracción A',
      startStrength: null,
      ...props,
    },
    global: { stubs: modalStubs },
  })
}

describe('TrainingSessionFeedbackModal', () => {
  it('renders start step 1 copy and gates Continue', async () => {
    const wrapper = mountModal()
    expect(wrapper.text()).toContain('Step 1 of 2')
    expect(wrapper.text()).toContain('Ready to train')
    expect(wrapper.text()).toContain('Empuje / Tracción A')
    expect(wrapper.text()).toContain('How prepared do you feel?')
    expect(wrapper.text()).toContain('How motivated are you?')
    expect(
      wrapper.get('button[aria-label="Continue to step 2"]').attributes('disabled'),
    ).toBeDefined()

    await wrapper.get('button[aria-label="Preparation 4 of 5"]').trigger('click')
    expect(
      wrapper.get('button[aria-label="Continue to step 2"]').attributes('disabled'),
    ).toBeDefined()
    await wrapper.get('button[aria-label="Motivation 3 of 5"]').trigger('click')
    expect(
      wrapper.get('button[aria-label="Continue to step 2"]').attributes('disabled'),
    ).toBeUndefined()
  })

  it('emits a start payload after step 2', async () => {
    const wrapper = mountModal()
    await wrapper.get('button[aria-label="Preparation 5 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Motivation 4 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Continue to step 2"]').trigger('click')
    expect(wrapper.text()).toContain('How strong do you feel')
    expect(wrapper.text()).toContain('How much force do you have right now?')
    const save = wrapper.get('button[aria-label="Save check-in"]')
    expect(save.attributes('disabled')).toBeDefined()
    await wrapper.get('button[aria-label="Force 4 of 5"]').trigger('click')
    expect(save.attributes('disabled')).toBeUndefined()
    await save.trigger('click')
    expect(wrapper.emitted('submit')).toEqual([
      [{ phase: 'start', check: { preparation: 5, motivation: 4, strength: 4 } }],
    ])
  })

  it('emits skip from Not now', async () => {
    const wrapper = mountModal()
    const notNow = wrapper.findAll('button').find(node => node.text() === 'Not now')
    expect(notNow).toBeDefined()
    await notNow!.trigger('click')
    expect(wrapper.emitted('skip')).toHaveLength(1)
    expect(wrapper.emitted('update:isOpen')?.[0]).toEqual([false])
  })

  it('renders end copy, pain labels, and started-at helper', async () => {
    const wrapper = mountModal({ phase: 'end', startStrength: 4 })
    expect(wrapper.text()).toContain('How the session felt')
    expect(wrapper.text()).toContain('How much fatigue do you have now?')
    expect(wrapper.text()).toContain('How much pain do you have now?')
    expect(wrapper.text()).not.toContain('sitio')
    expect(wrapper.text()).not.toContain('location')
    await wrapper.get('button[aria-label="Fatigue 3 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Pain 1 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Continue to step 2"]').trigger('click')
    expect(wrapper.text()).toContain('Your strength at wrap-up')
    expect(wrapper.text()).toContain('You started at High')
    await wrapper.get('button[aria-label="Force 3 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Save wrap-up"]').trigger('click')
    expect(wrapper.emitted('submit')).toEqual([
      [{ phase: 'end', check: { fatigue: 3, pain: 1, strength: 3 } }],
    ])
  })

  it('hides started-at helper when startStrength is missing', () => {
    const wrapper = mountModal({ phase: 'end', startStrength: null })
    expect(wrapper.text()).not.toContain('You started at')
  })
})
