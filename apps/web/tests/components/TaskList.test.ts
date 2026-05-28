// apps/web/tests/components/TaskList.test.ts
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import TaskList from '@/components/molecules/TaskList.vue'
import type { Task } from '@/types/task'

// Stub VueDraggable so tests don't depend on SortableJS DOM internals
const VueDraggableSortable = {
  props: ['modelValue', 'disabled', 'tag'],
  emits: ['update:modelValue', 'end'],
  template: `<component :is="tag ?? 'ul'"><slot /></component>`,
}

// Stub child components so TaskList renders in isolation
const stubs = {
  VueDraggable: VueDraggableSortable,
  TaskCard: {
    props: ['task', 'showDragHandle', 'isDragging', 'isKeyboardGrabbed'],
    emits: [
      'start-timer',
      'request-complete',
      'open-edit',
      'delete-task',
      'grip-keydown',
    ],
    template: `
      <div
        :data-testid="\`task-card-\${task.id}\`"
        :data-completed="task.completed"
        :data-keyboard-grabbed="isKeyboardGrabbed"
      >
        <button
          data-testid="grip"
          @keydown="$emit('grip-keydown', $event)"
        />
        {{ task.name }}
      </div>
    `,
  },
  TaskFilters: {
    props: ['categories', 'selectedCategory'],
    emits: ['filter-change'],
    template: '<div />',
  },
  EmptyState: {
    props: ['selectedCategory'],
    template: '<div data-testid="empty-state" />',
  },
  TaskNoteModal: {
    props: ['modelValue', 'taskTitle', 'initialNote'],
    emits: ['update:modelValue', 'save'],
    template: '<div />',
  },
  TaskEditModal: {
    props: ['modelValue', 'task'],
    emits: ['update:modelValue', 'save'],
    template: '<div />',
  },
}

const makeTasks = (overrides: Array<Partial<Task>> = []): Task[] =>
  overrides.map((o, i) => ({
    id: `task-${i + 1}`,
    name: `Task ${i + 1}`,
    createdAt: new Date(),
    ...o,
  }))

describe('TaskList — pending/completed split', () => {
  it('renders pending and completed tasks in separate sections', () => {
    const tasks = makeTasks([
      { completed: false },
      { completed: true },
      { completed: false },
      { completed: true },
    ])

    const wrapper = mount(TaskList, {
      props: { tasks },
      global: { stubs, plugins: [createPinia()] },
    })

    const divider = wrapper.find('[data-testid="completed-divider"]')
    expect(divider.exists()).toBe(true)

    const pendingList = wrapper.find('[data-testid="pending-list"]')
    const completedList = wrapper.find('[data-testid="completed-list"]')

    expect(pendingList.exists()).toBe(true)
    expect(completedList.exists()).toBe(true)

    const pendingCards = pendingList.findAll('[data-completed="false"]')
    const completedCards = completedList.findAll('[data-completed="true"]')

    expect(pendingCards).toHaveLength(2)
    expect(completedCards).toHaveLength(2)
  })

  it('does not render the divider when there are no completed tasks', () => {
    const tasks = makeTasks([{ completed: false }, { completed: false }])

    const wrapper = mount(TaskList, {
      props: { tasks },
      global: { stubs, plugins: [createPinia()] },
    })

    expect(wrapper.find('[data-testid="completed-divider"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="completed-list"]').exists()).toBe(false)
  })

  it('shows the completed list (no divider) when all tasks are completed', () => {
    const tasks = makeTasks([{ completed: true }, { completed: true }])

    const wrapper = mount(TaskList, {
      props: { tasks },
      global: { stubs, plugins: [createPinia()] },
    })

    expect(wrapper.find('[data-testid="completed-divider"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="completed-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
  })

  it('shows EmptyState only when no tasks exist at all', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: [] },
      global: { stubs, plugins: [createPinia()] },
    })

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="completed-divider"]').exists()).toBe(false)
  })

  it('shows the correct count in the header (pending only)', () => {
    const tasks = makeTasks([
      { completed: false },
      { completed: false },
      { completed: true },
    ])

    const wrapper = mount(TaskList, {
      props: { tasks },
      global: { stubs, plugins: [createPinia()] },
    })

    const counter = wrapper.find('[data-testid="task-counter"]')
    expect(counter.text()).toMatch('2')
  })
})

describe('TaskList — accessibility', () => {
  it('renders an aria-live region for drag-and-drop announcements', () => {
    const tasks = makeTasks([{ completed: false }])
    const wrapper = mount(TaskList, {
      props: { tasks },
      global: { stubs, plugins: [createPinia()] },
    })

    const live = wrapper.find('[aria-live]')
    expect(live.exists()).toBe(true)
    expect(live.attributes('aria-live')).toBe('polite')
  })

  it('pending list has an accessible label', () => {
    const tasks = makeTasks([{ completed: false }])
    const wrapper = mount(TaskList, {
      props: { tasks },
      global: { stubs, plugins: [createPinia()] },
    })

    const list = wrapper.find('[data-testid="pending-list"]')
    expect(list.attributes('aria-label')).toBeTruthy()
  })

  it('keyboard grab sets isKeyboardGrabbed on the correct card', async () => {
    const tasks = makeTasks([{ completed: false }, { completed: false }])
    const wrapper = mount(TaskList, {
      props: { tasks },
      global: { stubs, plugins: [createPinia()] },
    })

    const grips = wrapper.findAll('[data-testid="grip"]')
    await grips[0].trigger('keydown', { code: 'Space' })

    const cards = wrapper.findAll('[data-testid^="task-card-"]')
    expect(cards[0].attributes('data-keyboard-grabbed')).toBe('true')
    expect(cards[1].attributes('data-keyboard-grabbed')).toBe('false')
  })

  it('emits reorder-tasks after keyboard confirm', async () => {
    const tasks = makeTasks([
      { id: 'task-1', completed: false },
      { id: 'task-2', completed: false },
    ])
    const wrapper = mount(TaskList, {
      props: { tasks },
      global: { stubs, plugins: [createPinia()] },
    })

    const grips = wrapper.findAll('[data-testid="grip"]')
    await grips[0].trigger('keydown', { code: 'Space' })
    await grips[0].trigger('keydown', { code: 'ArrowDown' })
    await grips[0].trigger('keydown', { code: 'Enter' })

    const emitted = wrapper.emitted('reorder-tasks') as Task[][]
    expect(emitted).toBeTruthy()
    expect(emitted[0][0][0].id).toBe('task-2')
    expect(emitted[0][0][1].id).toBe('task-1')
  })
})
