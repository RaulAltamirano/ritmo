<template>
  <div class="flex flex-col gap-0">
    <!-- Screen reader live region for drag-and-drop announcements -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ keyboardAnnounce }}
    </div>

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
        {{ pendingTasks.length }} {{ pendingTasks.length === 1 ? 'task' : 'tasks' }}
      </span>
    </div>

    <!-- Pending tasks -->
    <VueDraggable
      v-if="pendingTasks.length > 0"
      v-model="draggablePending"
      tag="ul"
      data-testid="pending-list"
      class="tl-list"
      aria-label="Pending tasks"
      handle=".tcard-grip"
      ghost-class="tl-row--ghost"
      chosen-class="tl-row--chosen"
      drag-class="tl-row--dragging"
      :animation="150"
      :disabled="!canDrag"
      @end="onSortableEnd"
    >
      <li v-for="task in draggablePending" :key="task.id" class="tl-row">
        <TaskCard
          :task="convertToTaskItemFormat(task)"
          :show-drag-handle="canDrag"
          :is-dragging="false"
          :is-keyboard-grabbed="isGrabbed(task.id)"
          @start-timer="handleStartTimer(task)"
          @request-complete="handleRequestComplete(task)"
          @open-edit="openTaskEdit(task)"
          @delete-task="emit('delete-task', task.id)"
          @grip-keydown="onGripKeydown(task.id, $event)"
        />
      </li>
    </VueDraggable>

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
          Completed ({{ completedTasks.length }})
        </span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700/60" />
      </div>

      <ul data-testid="completed-list" class="tl-list" aria-label="Completed tasks">
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
      :task-title="editingTask?.name ?? ''"
      :initial-note="editingTask?.notes"
      @save="handleSaveNote"
    />

    <TaskEditModal v-model="showEditModal" :task="editingTask" @save="handleSaveEdit" />
  </div>
</template>

<script setup lang="ts">
  import { VueDraggable } from 'vue-draggable-plus'
  import { useTaskFilters } from '@/composables/tasks/useTaskFilters'
  import { useTaskTimer } from '@/composables/tasks/useTaskTimer'
  import { useSortableKeyboard } from '@/composables/tasks/useSortableKeyboard'
  import { useTimerStore } from '@/stores/timer'
  import type { Task } from '@/types/task'
  import { computed, ref, toRef, watch } from 'vue'
  import EmptyState from './EmptyState.vue'
  import TaskCard from './TaskCard.vue'
  import TaskEditModal from './TaskEditModal.vue'
  import TaskFilters from './TaskFilters.vue'
  import TaskNoteModal from './TaskNoteModal.vue'

  interface TaskListProps {
    tasks: Task[]
  }

  const props = defineProps<TaskListProps>()

  const emit = defineEmits<{
    'delete-task': [taskId: string]
    'reorder-tasks': [tasks: Task[]]
    'edit-task': [task: Task]
    'add-note': [taskId: string, note: string]
    'update-task': [task: Task]
    'request-complete': [task: Task]
  }>()

  const { selectedCategory, availableCategories, filteredTasks, setCategoryFilter } =
    useTaskFilters(toRef(props, 'tasks'))
  const { convertToTaskItemFormat, startTask } = useTaskTimer()

  /* ─── Local display order (survives parent not persisting) ── */
  const displayTasks = ref<Task[]>([])

  watch(
    filteredTasks,
    incoming => {
      const incomingMap = new Map(incoming.map(t => [t.id, t]))
      const kept = displayTasks.value
        .filter(t => incomingMap.has(t.id))
        .map(t => incomingMap.get(t.id)!)
      const existingIds = new Set(displayTasks.value.map(t => t.id))
      const added = incoming.filter(t => !existingIds.has(t.id))
      displayTasks.value = [...kept, ...added]
    },
    { immediate: true },
  )

  const pendingTasks = computed(() => displayTasks.value.filter(t => !t.completed))
  const completedTasks = computed(() => displayTasks.value.filter(t => t.completed))

  /* ─── Drag & drop via SortableJS ─────────────────────────── */
  const canDrag = computed(() => !selectedCategory.value)

  /* Two-way binding for VueDraggable: reads pendingTasks, writes back to displayTasks */
  const draggablePending = computed<Task[]>({
    get: () => pendingTasks.value,
    set: reordered => {
      displayTasks.value = [...reordered, ...completedTasks.value]
    },
  })

  const onSortableEnd = () => {
    emit('reorder-tasks', pendingTasks.value)
  }

  /* ─── Keyboard reorder ────────────────────────────────────── */
  const keyboardItems = computed<Task[]>({
    get: () => pendingTasks.value,
    set: reordered => {
      displayTasks.value = [...reordered, ...completedTasks.value]
    },
  })

  const {
    onGripKeydown,
    isGrabbed,
    announce: keyboardAnnounce,
  } = useSortableKeyboard({
    items: keyboardItems,
    onReorder: reordered => emit('reorder-tasks', reordered),
  })

  const showNoteModal = ref(false)
  const showEditModal = ref(false)
  const editingTask = ref<Task | null>(null)

  const timerStore = useTimerStore()
  const timerModes = computed(() => timerStore.timerModes)

  const handleRequestComplete = (task: Task) => {
    emit('request-complete', { ...task })
  }

  const handleStartTimer = (task: Task) => {
    const modes = timerModes.value
    const mode =
      modes.find(m => m.presetKey === '25_5') ??
      modes.find(m => m.id === 'pomodoro-25-5') ??
      modes[0]!
    void startTask(task, mode)
  }

  const handleSaveNote = (note: string) => {
    if (editingTask.value) {
      emit('add-note', editingTask.value.id, note)
      editingTask.value = null
    }
  }

  const handleSaveEdit = (task: Task) => {
    emit('update-task', task)
    editingTask.value = null
  }

  const openTaskEdit = (task: Task) => {
    editingTask.value = { ...task }
    showEditModal.value = true
  }

  watch(showEditModal, isOpen => {
    if (!isOpen) {
      editingTask.value = null
    }
  })
</script>

<style scoped>
  .tl-list {
    display: flex;
    flex-direction: column;
  }

  .tl-row {
    margin-bottom: 6px;
    transition:
      opacity 0.15s ease,
      transform 0.12s ease;
  }

  /* SortableJS ghost: placeholder for the item being dragged */
  .tl-row--ghost {
    opacity: 0.25;
    transform: scale(0.99);
  }

  /* SortableJS chosen: the item selected for drag (before movement) */
  .tl-row--chosen {
    user-select: none;
  }

  /* SortableJS drag clone: the element following the cursor */
  .tl-row--dragging {
    opacity: 0.9;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
</style>
