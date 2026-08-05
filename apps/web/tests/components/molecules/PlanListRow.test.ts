import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import PlanListRow from '@/components/molecules/PlanListRow.vue'
import type { Project } from '@/types/project'

const navigateTo = vi.fn()
vi.stubGlobal('navigateTo', navigateTo)

const project: Project = {
  id: 'p1',
  name: 'English B2',
  description: 'Daily speaking practice',
  status: 'activo',
  progress: 40,
  pendingTasks: 3,
  totalTasks: 10,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  color: 'blue',
  icon: 'compass',
}

describe('PlanListRow', () => {
  it('renders name, English status, progress, and pending count', () => {
    const wrapper = mount(PlanListRow, { props: { project } })
    expect(wrapper.text()).toContain('English B2')
    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).toContain('40%')
    expect(wrapper.text()).toContain('3')
  })

  it('navigates to /plans/:id on click', async () => {
    const wrapper = mount(PlanListRow, { props: { project } })
    await wrapper.trigger('click')
    expect(navigateTo).toHaveBeenCalledWith('/plans/p1')
  })
})
