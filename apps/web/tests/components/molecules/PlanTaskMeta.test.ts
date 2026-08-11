import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PlanTaskMeta from '@/components/molecules/PlanTaskMeta.vue'
import type { Task } from '@/types/task'

function baseTask(partial: Partial<Task> = {}): Task {
  return {
    id: 't1',
    name: 'Review flashcards',
    createdAt: new Date(),
    ...partial,
  }
}

describe('PlanTaskMeta', () => {
  it('shows pomodoro label and spaced repetition technique', () => {
    const wrapper = mount(PlanTaskMeta, {
      props: {
        task: baseTask({
          duration: '25m',
          estimatedTime: '25',
          studyTechnique: 'spaced_repetition',
        }),
      },
    })
    expect(wrapper.text()).toContain('25 min · Pomodoro')
    expect(wrapper.text()).toContain('Spaced repetition')
    expect(wrapper.get('[data-testid="plan-task-technique"]').attributes('aria-label')).toContain(
      'Spaced repetition',
    )
  })

  it('hides technique label in dense mode but keeps accessible tooltip', () => {
    const wrapper = mount(PlanTaskMeta, {
      props: {
        dense: true,
        task: baseTask({
          duration: '25m',
          estimatedTime: '25',
          studyTechnique: 'shadowing',
        }),
      },
    })
    expect(wrapper.text()).toContain('25 min · Pomodoro')
    expect(wrapper.find('.plan-task-meta__text--technique').exists()).toBe(false)
    const tip = wrapper.get('[data-testid="plan-task-technique"]')
    expect(tip.attributes('aria-label')).toContain('Shadowing')
    expect(tip.text()).toContain('Repeat speech almost in sync')
  })

  it('renders nothing when task has no timer or technique', () => {
    const wrapper = mount(PlanTaskMeta, {
      props: { task: baseTask({ category: 'Personal' }) },
    })
    expect(wrapper.find('[data-testid="plan-task-meta"]').exists()).toBe(false)
  })
})
