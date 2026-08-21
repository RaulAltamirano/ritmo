import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TrainingExportButton from '@/components/molecules/TrainingExportButton.vue'
import { mockWeeklyPlan } from '@/data/mockWeeklyPlan'
import { startOfWeekMonday } from '@/utils/planWeek'

vi.mock('@/utils/exportWeeklyPlan', () => ({
  downloadWeeklyPlanExport: vi.fn(),
}))

function mountExport() {
  return mount(TrainingExportButton, {
    props: {
      plan: mockWeeklyPlan,
      weekStart: startOfWeekMonday(new Date(2026, 7, 17)),
    },
  })
}

describe('TrainingExportButton', () => {
  it('exposes an accessible Export control and hides the visible label on the narrowest breakpoint via class', () => {
    const wrapper = mountExport()
    const trigger = wrapper.get('button[aria-label="Export"]')
    expect(trigger.classes().join(' ')).toMatch(/min-h-11/)
    const label = trigger.get('[data-testid="export-label"]')
    expect(label.classes()).toContain('hidden')
    expect(label.classes()).toContain('sm:inline')
  })

  it('opens a menu with touch-sized CSV and Excel items', async () => {
    const wrapper = mountExport()
    await wrapper.get('button[aria-label="Export"]').trigger('click')
    const csv = wrapper.get('[role="menuitem"]')
    expect(wrapper.text()).toContain('CSV')
    expect(wrapper.text()).toContain('Excel')
    for (const item of wrapper.findAll('[role="menuitem"]')) {
      expect(item.classes().join(' ')).toMatch(/min-h-11/)
    }
    expect(csv.exists()).toBe(true)
  })
})
