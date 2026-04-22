# Completed Tasks Separation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate completed tasks from pending tasks in `TaskList.vue`, showing completed tasks below a static divider without drag & drop.

**Architecture:** Add two computed arrays (`pendingTasks`, `completedTasks`) derived from `displayTasks`. Render the pending list with existing drag & drop logic, then a conditional divider, then the completed list as a static read-only section. No changes to props, emits, or parent components.

**Tech Stack:** Vue 3 Composition API, Vitest + @vue/test-utils, Tailwind CSS

---

### Task 1: Write failing tests for the pending/completed split

**Files:**

- Create: `apps/web/tests/components/TaskList.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// apps/web/tests/components/TaskList.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TaskList from '@/components/molecules/TaskList.vue'
import type { Task } from '@/types/task'

// Stub child components so TaskList renders in isolation
const stubs = {
  TaskCard: {
    props: ['task', 'showDragHandle', 'isDragging'],
    emits: ['start-timer', 'request-complete', 'open-edit', 'delete-task'],
    template:
      '<div :data-testid="`task-card-${task.id}`" :data-completed="task.completed">{{ task.name }}</div>',
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

const makeTasks = (overrides: Partial<Task>[] = []): Task[] =>
  overrides.map((o, i) => ({
    id: `task-${i + 1}`,
    name: `Task ${i + 1}`,
    createdAt: new Date(),
    ...o,
  }))

describe('TaskList — pending/completed split', () => {
  it('renders pending and completed tasks in separate sections', async () => {
    const tasks = makeTasks([
      { completed: false },
      { completed: true },
      { completed: false },
      { completed: true },
    ])

    const wrapper = mount(TaskList, { props: { tasks }, global: { stubs } })

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

    const wrapper = mount(TaskList, { props: { tasks }, global: { stubs } })

    expect(wrapper.find('[data-testid="completed-divider"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="completed-list"]').exists()).toBe(false)
  })

  it('shows the completed list (no divider) when all tasks are completed', () => {
    const tasks = makeTasks([{ completed: true }, { completed: true }])

    const wrapper = mount(TaskList, { props: { tasks }, global: { stubs } })

    expect(wrapper.find('[data-testid="completed-divider"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="completed-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
  })

  it('shows EmptyState only when no tasks exist at all', () => {
    const wrapper = mount(TaskList, { props: { tasks: [] }, global: { stubs } })

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="completed-divider"]').exists()).toBe(false)
  })

  it('shows the correct count in the header (pending only)', () => {
    const tasks = makeTasks([
      { completed: false },
      { completed: false },
      { completed: true },
    ])

    const wrapper = mount(TaskList, { props: { tasks }, global: { stubs } })

    const counter = wrapper.find('[data-testid="task-counter"]')
    expect(counter.text()).toMatch('2')
  })
})
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
cd apps/web && pnpm vitest run tests/components/TaskList.test.ts
```

Expected: all 5 tests FAIL (testids don't exist yet, counter test finds wrong count)

---

### Task 2: Implement the split in `TaskList.vue`

**Files:**

- Modify: `apps/web/components/molecules/TaskList.vue`

- [ ] **Step 3: Add `pendingTasks` and `completedTasks` computed refs in the script**

In the `<script setup>` block, after the `displayTasks` ref and its watch (~line 109), add:

```typescript
const pendingTasks = computed(() => displayTasks.value.filter(t => !t.completed))
const completedTasks = computed(() => displayTasks.value.filter(t => t.completed))
```

- [ ] **Step 4: Replace the template with the split version**

Replace the entire `<template>` block with:

```vue
<template>
  <div class="flex flex-col gap-0">
    <div class="flex items-center justify-between mb-4 gap-3">
      <TaskFilters
        :categories="availableCategories"
        :selected-category="selectedCategory"
        @filter-change="setCategoryFilter"
      />
      <span
        data-testid="task-counter"
        class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0"
      >
        {{ pendingTasks.length }} {{ pendingTasks.length === 1 ? 'tarea' : 'tareas' }}
      </span>
    </div>

    <!-- Pending tasks -->
    <ul
      v-if="pendingTasks.length > 0"
      data-testid="pending-list"
      class="tl-list"
      aria-label="Tareas pendientes"
    >
      <template v-for="(task, index) in pendingTasks" :key="task.id">
        <li v-if="showInsertAt(index)" class="tl-insert" aria-hidden="true">
          <div class="tl-insert-dot" />
          <div class="tl-insert-bar" />
        </li>
        <li
          class="tl-row"
          :class="{
            'tl-row--ghost': draggedIndex === index,
            'tl-row--target': isDropTarget(index),
          }"
          :draggable="canDrag"
          @dragstart="onDragStart(index)"
          @dragover.prevent="onDragOver(index, $event)"
          @drop.prevent="onDrop"
          @dragend="onDragEnd"
        >
          <TaskCard
            :task="convertToTaskItemFormat(task)"
            :show-drag-handle="canDrag"
            :is-dragging="draggedIndex === index"
            @start-timer="handleStartTimer(task)"
            @request-complete="handleRequestComplete(task)"
            @open-edit="openTaskEdit(task)"
            @delete-task="emit('delete-task', task.id)"
          />
        </li>
      </template>
      <li v-if="showInsertAt(pendingTasks.length)" class="tl-insert" aria-hidden="true">
        <div class="tl-insert-dot" />
        <div class="tl-insert-bar" />
      </li>
    </ul>

    <EmptyState
      v-if="pendingTasks.length === 0 && completedTasks.length === 0"
      :selected-category="selectedCategory"
    />

    <!-- Completed section -->
    <template v-if="completedTasks.length > 0">
      <div data-testid="completed-divider" class="flex items-center gap-3 mt-4 mb-3">
        <span
          class="text-xs font-medium text-gray-400 dark:text-gray-500 flex-shrink-0"
        >
          Completadas ({{ completedTasks.length }})
        </span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700/60" />
      </div>

      <ul data-testid="completed-list" class="tl-list" aria-label="Tareas completadas">
        <li v-for="task in completedTasks" :key="task.id" class="tl-row">
          <TaskCard
            :task="convertToTaskItemFormat(task)"
            :show-drag-handle="false"
            :is-dragging="false"
            @start-timer="handleStartTimer(task)"
            @request-complete="handleRequestComplete(task)"
            @open-edit="openTaskEdit(task)"
            @delete-task="emit('delete-task', task.id)"
          />
        </li>
      </ul>
    </template>

    <TaskNoteModal
      v-model="showNoteModal"
      :task-title="editingTask?.name || ''"
      :initial-note="editingTask?.notes"
      @save="handleSaveNote"
    />

    <TaskEditModal v-model="showEditModal" :task="editingTask" @save="handleSaveEdit" />
  </div>
</template>
```

- [ ] **Step 5: Update the drag & drop index references to use `pendingTasks`**

The `onDrop` handler currently references `displayTasks`. Update it to reference `pendingTasks`:

In the `onDrop` function, change:

```typescript
const items = [...displayTasks.value]
```

to:

```typescript
const items = [...pendingTasks.value]
```

And update the `emit` at the end of `onDrop`:

```typescript
emit('reorder-tasks', items)
```

This stays the same — but `displayTasks.value` must also be synced. After the splice, set:

```typescript
displayTasks.value = [...items, ...completedTasks.value]
```

So the full updated `onDrop` function becomes:

```typescript
const onDrop = () => {
  if (draggedIndex.value === null || dropIndicatorIndex.value === null) {
    onDragEnd()
    return
  }
  const from = draggedIndex.value
  const indicator = dropIndicatorIndex.value
  const to = indicator > from ? indicator - 1 : indicator
  if (from !== to) {
    const items = [...pendingTasks.value]
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    displayTasks.value = [...items, ...completedTasks.value]
    emit('reorder-tasks', items)
  }
  onDragEnd()
}
```

---

### Task 3: Run all tests and verify

- [ ] **Step 6: Run the TaskList tests**

```bash
cd apps/web && pnpm vitest run tests/components/TaskList.test.ts
```

Expected: all 5 tests PASS

- [ ] **Step 7: Run the full web test suite to check for regressions**

```bash
cd apps/web && pnpm vitest run
```

Expected: all tests PASS (no regressions)

- [ ] **Step 8: Run type-check**

```bash
pnpm type-check
```

Expected: no new TypeScript errors
