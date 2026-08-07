import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PlanTimelineItem from '@/components/molecules/PlanTimelineItem.vue'
import type { Task } from '@/types/task'

const task: Task = {
  id: 't1',
  name: 'Morning routine',
  createdAt: new Date(),
  startTime: new Date(2026, 7, 5, 8, 0),
  duration: '30m',
  completed: false,
}

describe('PlanTimelineItem', () => {
  it('renders title and emits toggleComplete', async () => {
    const wrapper = mount(PlanTimelineItem, {
      props: { task, isFirst: true, isLast: true },
    })
    expect(wrapper.text()).toContain('Morning routine')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('toggleComplete')?.[0]).toEqual([task, true])
  })

  it('shows dense plan task meta for study technique and timer', () => {
    const studyTask: Task = {
      ...task,
      name: 'Review flashcards',
      duration: '25m',
      estimatedTime: '25',
      studyTechnique: 'spaced_repetition',
    }
    const wrapper = mount(PlanTimelineItem, {
      props: { task: studyTask, isFirst: true, isLast: true },
    })
    expect(wrapper.find('[data-testid="plan-task-meta"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('25 min · Pomodoro')
    expect(
      wrapper.get('[data-testid="plan-task-technique"]').attributes('aria-label'),
    ).toContain('Spaced repetition')
  })

  it('hides checkbox when not interactive', () => {
    const wrapper = mount(PlanTimelineItem, {
      props: { task, interactive: false, isFirst: true, isLast: true },
    })
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Morning routine')
  })
})
