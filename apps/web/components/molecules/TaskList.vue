<template>
  <div class="flex flex-col gap-0">
    <div class="flex items-center justify-between mb-4 gap-3">
      <TaskFilters
        :categories="availableCategories"
        :selected-category="selectedCategory"
        @filter-change="setCategoryFilter"
      />
      <span class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
        {{ displayTasks.length }} {{ displayTasks.length === 1 ? 'tarea' : 'tareas' }}
      </span>
    </div>

    <ul v-if="filteredTasks.length > 0" class="tl-list" aria-label="Lista de tareas">
      <template v-for="(task, index) in displayTasks" :key="task.id">
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
      <li v-if="showInsertAt(displayTasks.length)" class="tl-insert" aria-hidden="true">
        <div class="tl-insert-dot" />
        <div class="tl-insert-bar" />
      </li>
    </ul>

    <EmptyState v-else :selected-category="selectedCategory" />

    <TaskNoteModal
      v-model="showNoteModal"
      :task-title="editingTask?.name || ''"
      :initial-note="editingTask?.notes"
      @save="handleSaveNote"
    />

    <TaskEditModal v-model="showEditModal" :task="editingTask" @save="handleSaveEdit" />
  </div>
</template>

<script setup lang="ts">
  import { useTaskFilters } from '@/composables/tasks/useTaskFilters'
  import { useTaskTimer } from '@/composables/tasks/useTaskTimer'
  import type { Task, TimerMode } from '@/types/task'
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
  const { convertToTaskItemFormat, startTask, stopTask } = useTaskTimer()

  /* ─── Local display order (survives parent not persisting) ── */
  const displayTasks = ref<Task[]>([])

  watch(
    filteredTasks,
    incoming => {
      const incomingMap = new Map(incoming.map(t => [t.id, t]))
      // Keep existing items in their current user-set order, refreshing task data
      const kept = displayTasks.value
        .filter(t => incomingMap.has(t.id))
        .map(t => incomingMap.get(t.id)!)
      // Append genuinely new items at the end
      const existingIds = new Set(displayTasks.value.map(t => t.id))
      const added = incoming.filter(t => !existingIds.has(t.id))
      displayTasks.value = [...kept, ...added]
    },
    { immediate: true },
  )

  /* ─── Drag & drop reorder ─────────────────────────────── */
  const draggedIndex = ref<number | null>(null)
  const dropIndicatorIndex = ref<number | null>(null)

  const canDrag = computed(() => !selectedCategory.value)

  /* Show the insert indicator line BEFORE item at `index` (or at end when index === length) */
  const showInsertAt = (index: number): boolean => {
    if (draggedIndex.value === null || dropIndicatorIndex.value !== index) return false
    const d = draggedIndex.value
    // suppress when dropping at the same position (no movement)
    return index !== d && index !== d + 1
  }

  /* Highlight the card the cursor is currently over during drag */
  const isDropTarget = (index: number): boolean => {
    if (draggedIndex.value === null || draggedIndex.value === index) return false
    return dropIndicatorIndex.value === index || dropIndicatorIndex.value === index + 1
  }

  const onDragStart = (index: number) => {
    draggedIndex.value = index
  }

  const onDragOver = (index: number, e: DragEvent) => {
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    dropIndicatorIndex.value =
      e.clientY < rect.top + rect.height / 2 ? index : index + 1
  }

  const onDrop = () => {
    if (draggedIndex.value === null || dropIndicatorIndex.value === null) {
      onDragEnd()
      return
    }
    const from = draggedIndex.value
    const indicator = dropIndicatorIndex.value
    const to = indicator > from ? indicator - 1 : indicator
    if (from !== to) {
      const items = [...displayTasks.value]
      const [moved] = items.splice(from, 1)
      items.splice(to, 0, moved)
      displayTasks.value = items // update immediately — no waiting on parent
      emit('reorder-tasks', items) // notify parent for optional persistence
    }
    onDragEnd()
  }

  const onDragEnd = () => {
    draggedIndex.value = null
    dropIndicatorIndex.value = null
  }

  const showNoteModal = ref(false)
  const showEditModal = ref(false)
  const editingTask = ref<Task | null>(null)

  const timerModes: TimerMode[] = [
    {
      id: 'pomodoro',
      name: 'Pomodoro',
      description: '25 minutos de trabajo',
      duration: '25 min',
      time: 25 * 60,
      color: 'bg-red-500',
      icon: 'Timer',
      minutes: 25,
    },
    {
      id: 'focus',
      name: 'Focus',
      description: '30 minutos concentrado',
      duration: '30 min',
      time: 30 * 60,
      color: 'bg-primary-500',
      icon: 'Timer',
      minutes: 30,
    },
  ]

  const handleRequestComplete = (task: Task) => {
    emit('request-complete', { ...task })
  }

  const handleStartTimer = (task: Task) => {
    const pomodoro = timerModes.find(m => m.id === 'pomodoro')!
    startTask(task, pomodoro)
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

  .tl-row[draggable='true'] {
    user-select: none;
  }

  /* Dragged card: very faded so drop zone is clear */
  .tl-row--ghost {
    opacity: 0.25;
    transform: scale(0.99);
  }

  /* Card currently under cursor — subtle lift */
  .tl-row--target {
    transform: scale(1.005);
  }

  /* ── Insert indicator ── */
  .tl-insert {
    display: flex;
    align-items: center;
    gap: 0;
    margin: 3px 0;
    pointer-events: none;
    transform-origin: left center;
    animation: tl-insert-in 110ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .tl-insert-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--ph, #0ea5e9);
    flex-shrink: 0;
  }

  .tl-insert-bar {
    flex: 1;
    height: 2px;
    background: var(--ph, #0ea5e9);
    border-radius: 0 1px 1px 0;
    opacity: 0.85;
  }

  @keyframes tl-insert-in {
    from {
      opacity: 0;
      transform: scaleX(0.6);
    }
    to {
      opacity: 1;
      transform: scaleX(1);
    }
  }
</style>
