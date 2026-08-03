import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TaskItem from '@/components/molecules/TaskItem.vue'
import type { Task } from '@/types/task'

const task: Task = {
  id: 't1',
  name: 'Schedule task',
  title: 'Schedule task',
  category: 'work',
  priority: 'media',
  apiPriority: 'MEDIUM',
  estimatedTime: '25',
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
}

const stubs = {
  TaskEditModal: {
    props: ['modelValue', 'task'],
    emits: ['update:modelValue', 'save'],
    template: `
      <div v-if="modelValue" data-testid="hosted-edit-modal">
        <button
          type="button"
          data-testid="stub-save"
          @click="$emit('save', { ...task, name: 'Edited from item' })"
        >
          save
        </button>
      </div>
    `,
  },
  Teleport: {
    template: '<div><slot /></div>',
  },
}

describe('TaskItem edit consolidation', () => {
  it('opens TaskEditModal and emits update-task on save', async () => {
    const wrapper = mount(TaskItem, {
      props: { task },
      global: { stubs },
    })

    expect(wrapper.find('[data-testid="hosted-edit-modal"]').exists()).toBe(false)

    await wrapper.get('[aria-label="Más opciones"]').trigger('click')
    const editButtons = wrapper
      .findAll('button')
      .filter(button => button.text().includes('Editar tarea'))
    expect(editButtons.length).toBeGreaterThan(0)
    const editButton = editButtons[0]
    if (!editButton) throw new Error('Edit task button was not rendered')
    await editButton.trigger('click')

    expect(wrapper.find('[data-testid="hosted-edit-modal"]').exists()).toBe(true)

    await wrapper.get('[data-testid="stub-save"]').trigger('click')
    const updated = wrapper.emitted('update-task')?.[0]?.[0] as Task
    expect(updated.name).toBe('Edited from item')
  })
})
