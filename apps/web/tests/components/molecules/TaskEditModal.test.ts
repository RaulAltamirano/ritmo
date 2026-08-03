import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TaskEditModal from '@/components/molecules/TaskEditModal.vue'
import type { Task } from '@/types/task'

const baseTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  name: 'Test 213',
  category: 'work',
  priority: 'media',
  apiPriority: 'MEDIUM',
  notes: 'Nota inicial',
  estimatedTime: '25',
  tags: ['focus'],
  dueDate: new Date('2026-08-01T15:00:00.000Z'),
  createdAt: new Date('2026-07-30T10:00:00.000Z'),
  ...overrides,
})

const stubs = {
  BaseModal: {
    props: ['isOpen', 'title', 'size'],
    template: `
      <div v-if="isOpen" data-testid="edit-modal">
        <slot />
      </div>
    `,
  },
  BaseButton: {
    props: ['disabled', 'variant', 'size'],
    emits: ['click'],
    template:
      '<button type="button" v-bind="$attrs" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
}

const mountModal = (task = baseTask()) =>
  mount(TaskEditModal, {
    props: { modelValue: true, task },
    global: { stubs },
  })

async function pickIconOption(
  wrapper: ReturnType<typeof mountModal>,
  triggerId: string,
  value: string,
) {
  await wrapper.get(`#${triggerId}`).trigger('click')
  await wrapper.get(`[data-testid="icon-select-option-${value}"]`).trigger('click')
}

describe('TaskEditModal', () => {
  it('renders canonical focus-block duration options', async () => {
    const wrapper = mountModal()

    expect(wrapper.text()).toContain('Editar tarea')
    expect(wrapper.find('#task-edit-duration').exists()).toBe(true)

    await wrapper.get('#task-edit-duration').trigger('click')
    expect(wrapper.text()).toContain('Pomodoro clásico · 25 min')
    expect(wrapper.text()).toContain('Bloque medio · 52 min')
    expect(wrapper.text()).toContain('Bloque largo · 90 min')
    expect(wrapper.text()).toContain('Tiempo libre')
    expect(wrapper.find('[data-testid="icon-select-option-45"]').exists()).toBe(false)
  })

  it('lets the user pick free duration minutes', async () => {
    const wrapper = mountModal(baseTask({ estimatedTime: undefined }))

    await pickIconOption(wrapper, 'task-edit-duration', 'free')
    const freeInput = wrapper.get('#task-edit-duration-free')
    expect(freeInput.exists()).toBe(true)
    await freeInput.setValue('40')

    await wrapper.get('[aria-label="Guardar cambios de la tarea"]').trigger('click')

    const saved = wrapper.emitted('save')?.[0]?.[0] as Task
    expect(saved.estimatedTime).toBe('40')
  })

  it('prefills and emits all editable fields on save', async () => {
    const wrapper = mountModal()

    await wrapper.find('#task-edit-name').setValue('Tarea actualizada')
    await pickIconOption(wrapper, 'task-edit-category', 'study')
    await pickIconOption(wrapper, 'task-edit-priority', 'HIGH')
    await pickIconOption(wrapper, 'task-edit-duration', '52')
    await wrapper.find('#task-edit-description').setValue('Desc actualizada')
    await wrapper.find('#task-edit-due-date').setValue('2026-08-02T18:30')
    await wrapper.find('#task-edit-tags').setValue('a, b, c')

    await wrapper.get('[aria-label="Guardar cambios de la tarea"]').trigger('click')

    const saved = wrapper.emitted('save')?.[0]?.[0] as Task
    expect(saved).toMatchObject({
      name: 'Tarea actualizada',
      category: 'study',
      apiPriority: 'HIGH',
      priority: 'alta',
      notes: 'Desc actualizada',
      estimatedTime: '52',
      tags: ['a', 'b', 'c'],
    })
    expect(saved.dueDate).toBeInstanceOf(Date)
    expect(saved.dueDate!.getFullYear()).toBe(2026)
    expect(saved.dueDate!.getMonth()).toBe(7)
    expect(saved.dueDate!.getDate()).toBe(2)
  })
})
