import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PlanWeekStrip from '@/components/molecules/PlanWeekStrip.vue'

describe('PlanWeekStrip training status', () => {
  it('includes incomplete in the day tab aria-label', () => {
    const weekStart = new Date(2026, 7, 10)
    const wrapper = mount(PlanWeekStrip, {
      props: {
        weekStart,
        selectedDay: weekStart,
        dayStatuses: { '2026-08-10': 'incomplete' },
        'onUpdate:weekStart': () => undefined,
        'onUpdate:selectedDay': () => undefined,
      },
    })
    expect(wrapper.get('[role="tab"]').attributes('aria-label')).toMatch(/incomplete/i)
  })
})
