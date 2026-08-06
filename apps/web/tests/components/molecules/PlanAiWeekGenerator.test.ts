import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PlanAiWeekGenerator from '@/components/molecules/PlanAiWeekGenerator.vue'

describe('PlanAiWeekGenerator', () => {
  it('shows Generate week and emits open on click', async () => {
    const wrapper = mount(PlanAiWeekGenerator)
    expect(wrapper.text()).toContain('Generate week')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('open')).toHaveLength(1)
    expect(wrapper.text()).toContain('Generate week')
  })

  it('exposes aria-label for AI week generation', () => {
    const wrapper = mount(PlanAiWeekGenerator)
    expect(wrapper.get('button').attributes('aria-label')).toBe(
      'Generate weekly plan with AI',
    )
  })
})
