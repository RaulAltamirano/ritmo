<template>
  <div class="space-y-4">
    <!-- Controles superiores simplificados -->
    <div class="flex items-center justify-between">
      <!-- Filtros con diseño mejorado -->
      <TaskFilters
        :categories="availableCategories"
        :selected-category="selectedCategory"
        @filter-change="setCategoryFilter"
      />

      <!-- Vista y contador simplificados -->
      <ViewModeToggle
        v-model="viewMode"
        :task-count="filteredTasks.length"
        @view-change="viewMode = $event"
      />
    </div>

    <!-- Vista de lista usando TaskItem -->
    <div v-if="viewMode === 'list'" class="space-y-3" role="list" aria-label="Lista de tareas disponibles">
      <TaskItem
        v-for="task in filteredTasks" 
        :key="task.id"
        :task="convertToTaskItemFormat(task)"
        @toggle-complete="handleToggleComplete(task)"
        @start-timer="handleStartTimer(task)"
        @stop-timer="handleStopTimer(task)"
        @edit="handleEdit"
        @delete="handleDelete"
        @archive="handleArchive"
        @add-note="handleAddNote"
        @update-task="handleUpdateTask"
        @start-with-mode="handleStartWithMode"
      />
    </div>
            
    <!-- Vista de cuadrícula usando TaskItem -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Cuadrícula de tareas disponibles">
      <TaskItem
        v-for="task in filteredTasks"
        :key="task.id"
        :task="convertToTaskItemFormat(task)"
        @toggle-complete="handleToggleComplete(task)"
        @start-timer="handleStartTimer(task)"
        @stop-timer="handleStopTimer(task)"
        @edit="handleEdit"
        @delete="handleDelete"
        @archive="handleArchive"
        @add-note="handleAddNote"
        @update-task="handleUpdateTask"
        @start-with-mode="handleStartWithMode"
      />
    </div>
          
    <!-- Modal de notas -->
    <TaskNoteModal
      v-model="showNoteModal"
      :task-title="editingTask?.name || ''"
      :initial-note="editingTask?.notes"
      @save="handleSaveNote"
    />

    <!-- Modal de edición -->
    <TaskEditModal
      v-model="showEditModal"
      :task="editingTask"
      @save="handleSaveEdit"
    />
    
    <!-- Estado vacío mejorado -->
    <EmptyState
      v-if="filteredTasks.length === 0"
      :selected-category="selectedCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Task, TimerMode, ViewMode } from '../../types/task'
import { useTaskFilters } from '../../composables/useTaskFilters'
import { useTaskTimer } from '../../composables/useTaskTimer'
import TaskItem from './TaskItem.vue'
import TaskFilters from './TaskFilters.vue'
import ViewModeToggle from './ViewModeToggle.vue'
import TaskNoteModal from './TaskNoteModal.vue'
import TaskEditModal from './TaskEditModal.vue'
import EmptyState from './EmptyState.vue'

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
}>()

// Composables
const { selectedCategory, availableCategories, filteredTasks, setCategoryFilter } = useTaskFilters(toRef(props, 'tasks'))
const { convertToTaskItemFormat, startTask, stopTask } = useTaskTimer()

// Estado local
const viewMode = ref<ViewMode>('list')
const showNoteModal = ref(false)
const showEditModal = ref(false)
const editingTask = ref<Task | null>(null)

// Modos de temporizador
const timerModes: TimerMode[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: '25 minutos de trabajo',
    duration: '25 min',
    time: 25 * 60,
    color: 'bg-red-500',
    icon: 'Timer',
    minutes: 25
  },
  {
    id: 'focus',
    name: 'Focus',
    description: '30 minutos concentrado',
    duration: '30 min',
    time: 30 * 60,
    color: 'bg-blue-500',
    icon: 'Timer',
    minutes: 30
  },
  {
    id: 'pomodoro-xl',
    name: 'Pomodoro XL',
    description: '50 minutos extendido',
    duration: '50 min',
    time: 50 * 60,
    color: 'bg-orange-500',
    icon: 'Timer',
    minutes: 50
  },
  {
    id: 'free',
    name: 'Libre',
    description: 'Sin límite de tiempo',
    duration: '∞',
    time: 0,
    color: 'bg-purple-500',
    icon: 'Timer',
    minutes: 0
  }
]

// Métodos para manejar eventos de TaskItem
const handleToggleComplete = (task: Task) => {
  const updatedTask = { ...task }
  emit('update-task', updatedTask)
}

const handleEdit = (task: Task) => {
  editingTask.value = task
  showEditModal.value = true
}

const handleDelete = (task: Task) => {
  emit('delete-task', task.id)
}

const handleArchive = (task: Task) => {
  console.log('Archivar tarea:', task.id)
}

const handleAddNote = (taskId: string, note: string) => {
  emit('add-note', taskId, note)
}

const handleUpdateTask = (task: Task) => {
  emit('update-task', task)
}

const handleStartWithMode = (task: Task, mode: TimerMode) => {
  startTask(task, mode)
}

// Funciones wrapper para TaskItem
const handleStartTimer = (task: Task) => {
  const pomodoroMode = timerModes.find(mode => mode.id === 'pomodoro')!
  startTask(task, pomodoroMode)
}

const handleStopTimer = (task: Task) => {
  stopTask(task)
}

// Métodos para modales
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
</script>

<style scoped>
/* Transiciones simples */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Line clamp para texto */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 