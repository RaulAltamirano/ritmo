import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TodayTaskFeedbackModal from '@/components/organisms/today/TodayTaskFeedbackModal.vue'

const createWrapper = () =>
  mount(TodayTaskFeedbackModal, {
    props: {
      isOpen: true,
      task: {
        id: 'task-1',
        name: 'Prepare presentation',
        title: 'Prepare presentation',
        createdAt: new Date('2026-04-19T09:00:00.000Z'),
      },
    },
    global: {
      stubs: {
        BaseModal: {
          props: ['isOpen', 'title'],
          emits: ['update:isOpen', 'close'],
          template:
            '<div v-if="isOpen"><div data-testid="base-modal"><slot /></div><div><slot name="footer" /></div></div>',
        },
        BaseButton: {
          props: ['disabled', 'loading', 'variant', 'size', 'type'],
          emits: ['click'],
          template:
            '<button :disabled="disabled || loading" :type="type || \'button\'" @click="$emit(\'click\', $event)"><slot /></button>',
        },
      },
    },
  })

describe('TodayTaskFeedbackModal', () => {
  it('renders the MVP questions and progress flow', async () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Step 1 of 3')
    expect(wrapper.text()).toContain('How much energy do you have left?')
    expect(wrapper.text()).toContain(
      'Did this task fit well with this time of day?',
    )

    await wrapper.get('button[aria-label="Energy 4 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Time of day: yes"]').trigger('click')
    await wrapper.get('button[aria-label="Continue to step 2"]').trigger('click')

    expect(wrapper.text()).toContain('Step 2 of 3')
    expect(wrapper.text()).toContain('How focused were you?')
    expect(wrapper.text()).toContain('How much real progress did you make?')
    expect(wrapper.text()).toContain('How demanding was it?')
  })

  it('keeps submit disabled until all answers are selected and emits the payload', async () => {
    const wrapper = createWrapper()

    await wrapper.get('button[aria-label="Energy 3 of 5"]').trigger('click')
    await wrapper
      .get('button[aria-label="Time of day: somewhat"]')
      .trigger('click')
    await wrapper.get('button[aria-label="Continue to step 2"]').trigger('click')

    await wrapper.get('button[aria-label="Focus 4 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Progress 5 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Mental load 3 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Continue to step 3"]').trigger('click')

    const submitButton = wrapper.get(
      'button[aria-label="Submit completion feedback"]',
    )
    expect(submitButton.attributes('disabled')).toBeDefined()

    await wrapper.get('button[aria-label="Blocker distractions"]').trigger('click')

    expect(submitButton.attributes('disabled')).toBeUndefined()
    await submitButton.trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          energyAfter: 3,
          focusScore: 4,
          progressScore: 5,
          mentalDemand: 3,
          timeFit: 'mixed',
          mainBlocker: 'distracted',
        },
      ],
    ])
  })
})
