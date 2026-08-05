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
  it('shows Descanso and break accent when isOnBreak', () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask() },
    })

    expect(wrapper.text()).toContain('Descanso')
    expect(wrapper.get('.tcard-accent').attributes('style')).toContain(
      'rgb(16, 185, 129)',
    )
  })

  it('keeps focus accent when running but not on break', () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask({ isOnBreak: false }) },
    })

    expect(wrapper.text()).not.toContain('Descanso')
    expect(wrapper.get('.tcard-accent').attributes('style')).toContain(
      'rgb(14, 165, 233)',
    )
  })

  it('shows Descanso countdown when paused on break', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({ isRunning: false, isOnBreak: true, timeRemaining: 120 }),
      },
    })

    expect(wrapper.text()).toContain('Descanso')
    expect(wrapper.text()).toMatch(/02:00/)
    expect(wrapper.classes().join(' ')).toMatch(/emerald/)
  })
})
