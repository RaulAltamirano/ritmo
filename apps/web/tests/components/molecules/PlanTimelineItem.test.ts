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
})
