import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from '@/components/molecules/TaskCard.vue'
import type { Task } from '@/types/task'

function baseTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    name: 'Test 123',
    createdAt: new Date(),
    priority: 'media',
    duration: '25m',
    isRunning: true,
    timeRemaining: 200,
    isOnBreak: true,
    ...overrides,
  }
}

describe('TaskCard break state', () => {
  it('shows moon break badge and violet accent when isOnBreak', () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask() },
    })

    expect(wrapper.text()).not.toContain('Descanso')
    expect(wrapper.get('[aria-label="Descanso"]').exists()).toBe(true)
    expect(wrapper.get('.tcard-accent').attributes('style')).toContain(
      'rgb(139, 92, 246)',
    )
  })

  it('keeps focus accent when running but not on break', () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask({ isOnBreak: false }) },
    })

    expect(wrapper.find('[aria-label="Descanso"]').exists()).toBe(false)
    expect(wrapper.get('.tcard-accent').attributes('style')).toContain(
      'rgb(14, 165, 233)',
    )
  })

  it('shows violet countdown when paused on break', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({ isRunning: false, isOnBreak: true, timeRemaining: 120 }),
      },
    })

    expect(wrapper.get('[aria-label="Descanso"]').exists()).toBe(true)
    expect(wrapper.text()).toMatch(/02:00/)
    expect(wrapper.classes().join(' ')).toMatch(/violet/)
  })
})
