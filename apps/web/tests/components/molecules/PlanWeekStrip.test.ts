import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PlanWeekStrip from '@/components/molecules/PlanWeekStrip.vue'
import type { Task } from '@/types/task'
import { startOfWeekMonday } from '@/utils/planWeek'

const weekStart = startOfWeekMonday(new Date(2026, 7, 5))
const selectedDay = new Date(2026, 7, 5)

const scheduled: Task[] = [
  {
    id: 't1',
    name: 'Study',
    createdAt: new Date(),
    startTime: new Date(2026, 7, 5, 9, 0),
    duration: '30m',
  },
]

describe('PlanWeekStrip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 5, 12, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('disables next week on current week', () => {
    const wrapper = mount(PlanWeekStrip, {
      props: {
        weekStart,
        selectedDay,
        scheduledTasks: scheduled,
        'onUpdate:weekStart': () => undefined,
        'onUpdate:selectedDay': () => undefined,
      },
    })
    const next = wrapper.get('button[aria-label="Next week"]')
    expect(next.attributes('disabled')).toBeDefined()
  })

  it('shows day tabs including selected Friday', () => {
    const wrapper = mount(PlanWeekStrip, {
      props: {
        weekStart,
        selectedDay,
        scheduledTasks: scheduled,
        'onUpdate:weekStart': () => undefined,
        'onUpdate:selectedDay': () => undefined,
      },
    })
    expect(wrapper.text()).toContain('Fri')
    expect(wrapper.text()).toContain('5')
  })

  it('shows a dot for days with dayCounts > 0 without scheduledTasks', () => {
    const weekStart = startOfWeekMonday(new Date(2026, 7, 10))
    const mon = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
    const wrapper = mount(PlanWeekStrip, {
      props: {
        weekStart,
        selectedDay: weekStart,
        dayCounts: { [mon]: 1 },
        'onUpdate:weekStart': () => undefined,
        'onUpdate:selectedDay': () => undefined,
      },
    })
    const selectedTab = wrapper.get('[aria-selected="true"]')
    expect(selectedTab.html()).toContain('rounded-full')
  })
})
