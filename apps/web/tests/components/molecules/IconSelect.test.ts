import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ArrowDown, ArrowUp, Minus } from 'lucide-vue-next'
import IconSelect from '@/components/molecules/IconSelect.vue'

const options = [
  { value: 'LOW', label: 'Baja', icon: ArrowDown, tone: 'slate' },
  { value: 'MEDIUM', label: 'Media', icon: Minus, tone: 'blue' },
  { value: 'HIGH', label: 'Alta', icon: ArrowUp, tone: 'amber' },
]

describe('IconSelect', () => {
  it('shows the selected option icon and label in the trigger', () => {
    const wrapper = mount(IconSelect, {
      props: {
        id: 'task-edit-priority',
        modelValue: 'HIGH',
        options,
        placeholder: 'Elegir',
      },
    })

    const trigger = wrapper.get('#task-edit-priority')
    expect(trigger.text()).toContain('Alta')
    expect(wrapper.find('[data-testid="icon-select-trigger-icon"]').exists()).toBe(
      true,
    )
  })

  it('opens a list with icons and emits the chosen value', async () => {
    const wrapper = mount(IconSelect, {
      props: {
        id: 'task-edit-priority',
        modelValue: 'LOW',
        options,
      },
    })

    await wrapper.get('#task-edit-priority').trigger('click')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
    expect(wrapper.findAll('[data-testid="icon-select-option-icon"]')).toHaveLength(
      3,
    )

    await wrapper.get('[data-testid="icon-select-option-MEDIUM"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['MEDIUM'])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('focuses the active option and supports keyboard selection', async () => {
    const wrapper = mount(IconSelect, {
      attachTo: document.body,
      props: {
        id: 'task-edit-priority',
        modelValue: 'LOW',
        options,
      },
    })

    await wrapper.get('#task-edit-priority').trigger('keydown', {
      key: 'ArrowDown',
    })

    const activeOption = wrapper.get('[data-testid="icon-select-option-LOW"]')
    expect(activeOption.attributes('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(activeOption.element)

    await activeOption.trigger('keydown', { key: 'ArrowDown' })
    await activeOption.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['MEDIUM'])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
