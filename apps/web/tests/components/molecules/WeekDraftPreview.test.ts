import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WeekDraftPreview from '@/components/molecules/WeekDraftPreview.vue'

describe('WeekDraftPreview', () => {
  it('lists days and sessions from the draft in a timeline', async () => {
    const wrapper = mount(WeekDraftPreview, {
      props: {
        draft: {
          weekStart: '2026-08-03',
          summary: 'Focus speaking',
          sessions: [
            { dayOffset: 0, title: 'Speaking A', durationMin: 45 },
            { dayOffset: 2, title: 'Speaking B', durationMin: 30 },
          ],
        },
        planId: 'plan-1',
      },
    })
    expect(wrapper.text()).toContain('Focus speaking')
    expect(wrapper.text()).toContain('Mon')
    expect(wrapper.text()).toContain('Speaking A')
    expect(wrapper.text()).toMatch(/45/)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)

    await wrapper.get('button[aria-label*="Wed"]').trigger('click')
    expect(wrapper.text()).toContain('Speaking B')
  })
})
