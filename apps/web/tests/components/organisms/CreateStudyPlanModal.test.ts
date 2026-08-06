import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CreateStudyPlanModal from '@/components/organisms/CreateStudyPlanModal.vue'

const createWrapper = (props: { isOpen?: boolean; loading?: boolean } = {}) =>
  mount(CreateStudyPlanModal, {
    props: {
      isOpen: props.isOpen ?? true,
      loading: props.loading ?? false,
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

describe('CreateStudyPlanModal', () => {
  it('renders step 1 and keeps Continue disabled without a goal', async () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Step 1 of 2')
    expect(wrapper.text()).toContain('What skill or knowledge are you building?')
    expect(wrapper.text()).toContain('Plan color')
    expect(wrapper.text()).not.toContain('Topic tags')
    expect(wrapper.text()).not.toContain('Declarative knowledge')

    const continueButton = wrapper.get('button[aria-label="Continue to step 2"]')
    expect(continueButton.attributes('disabled')).toBeDefined()

    await wrapper.get('#study-plan-goal').setValue('Japanese conversational fluency')
    expect(continueButton.attributes('disabled')).toBeUndefined()
  })

  it('advances to schedule after goal and optional description/color', async () => {
    const wrapper = createWrapper()

    await wrapper.get('#study-plan-goal').setValue('Exam prep: organic chemistry')
    await wrapper.get('#study-plan-description').setValue('Midterm in March')
    await wrapper.get('button[aria-label="Plan color: green"]').trigger('click')
    await wrapper.get('button[aria-label="Continue to step 2"]').trigger('click')

    expect(wrapper.text()).toContain('Step 2 of 2')
    expect(wrapper.text()).toContain('Days per week')
  })

  it('keeps submit disabled until days and minutes are set, then emits intake', async () => {
    const wrapper = createWrapper()

    await wrapper.get('#study-plan-goal').setValue('Shadowing practice for Spanish')
    await wrapper.get('#study-plan-description').setValue('Daily speaking drills')
    await wrapper.get('button[aria-label="Plan color: teal"]').trigger('click')
    await wrapper.get('button[aria-label="Continue to step 2"]').trigger('click')

    const submitButton = wrapper.get('button[aria-label="Create outline"]')
    expect(submitButton.attributes('disabled')).toBeDefined()

    await wrapper.get('button[aria-label="Days per week: 4"]').trigger('click')
    await wrapper.get('button[aria-label="Session length: 45 minutes"]').trigger('click')

    expect(submitButton.attributes('disabled')).toBeUndefined()
    await submitButton.trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          goal: 'Shadowing practice for Spanish',
          description: 'Daily speaking drills',
          color: 'teal',
          daysPerWeek: 4,
          minutesPerSession: 45,
          targetDate: null,
        },
      ],
    ])
  })

  it('includes targetDate when a date is chosen', async () => {
    const wrapper = createWrapper()

    await wrapper.get('#study-plan-goal').setValue('Pass calculus midterm')
    await wrapper.get('button[aria-label="Continue to step 2"]').trigger('click')
    await wrapper.get('button[aria-label="Days per week: 5"]').trigger('click')
    await wrapper.get('button[aria-label="Session length: 60 minutes"]').trigger('click')
    await wrapper.get('#study-plan-target-date').setValue('2026-09-15')
    await wrapper.get('button[aria-label="Create outline"]').trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          goal: 'Pass calculus midterm',
          description: '',
          color: 'blue',
          daysPerWeek: 5,
          minutesPerSession: 60,
          targetDate: '2026-09-15',
        },
      ],
    ])
  })
})
