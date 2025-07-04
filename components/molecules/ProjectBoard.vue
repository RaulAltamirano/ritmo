<template>
  <div class="w-full">
    <!-- Project info bar mejorada -->
    <div v-if="projectInfo" class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50">
      <div class="flex-1">
        <div class="text-lg font-semibold text-blue-900 dark:text-blue-100">Project info</div>
        <div class="text-sm text-gray-700 dark:text-gray-200">Next review: <span class="font-medium">{{ formatDate(projectInfo.nextReview) }}</span></div>
        <div class="text-sm text-gray-700 dark:text-gray-200 mt-1">Methodology: <span class="font-medium">{{ projectInfo.methodology || 'Kanban' }}</span></div>
        <div class="text-sm text-gray-700 dark:text-gray-200 mt-1">Owner: <span class="font-medium">{{ projectInfo.owner || 'Unassigned' }}</span></div>
        <div class="text-sm text-gray-700 dark:text-gray-200 mt-1">Created: <span class="font-medium">{{ formatDate(projectInfo.createdAt) }}</span></div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <div class="flex flex-wrap gap-2 items-center">
          <span v-if="projectInfo.status" class="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Status: {{ projectInfo.status }}</span>
          <span v-if="projectInfo.progress !== undefined" class="px-3 py-1 rounded-full text-xs font-medium bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200">Progress: {{ projectInfo.progress }}%</span>
        </div>
        <!-- Miembros del proyecto -->
        <div class="flex items-center gap-2 mt-2">
          <span class="text-xs text-gray-600 dark:text-gray-300">Members:</span>
          <template v-if="projectInfo.members && projectInfo.members.length">
            <div v-for="member in projectInfo.members" :key="member.id" class="flex items-center gap-1">
              <img :src="member.avatar" :alt="member.name" class="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 shadow" />
              <span class="text-xs text-gray-700 dark:text-gray-200">{{ member.name }}</span>
            </div>
          </template>
          <span v-else class="text-xs text-gray-400">No members</span>
        </div>
      </div>
    </div>
    <!-- Buscador y filtros rápidos -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div class="flex-1">
        <BaseInput
          v-model="searchQuery"
          :placeholder="'Search tasks...'"
          :leftIcon="Search"
          aria-label="Search tasks"
        />
      </div>
      <div class="flex flex-1 flex-wrap gap-2 justify-end items-center">
        <TaskFilters
          :categories="categories"
          :selected-category="selectedCategory"
          @filter-change="setCategoryFilter"
        />
        <!-- Filtro por usuario -->
        <select v-model="selectedUser" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          <option value="">All users</option>
          <option v-for="member in projectInfo?.members || []" :key="member.id" :value="member.id">{{ member.name }}</option>
        </select>
        <!-- Filtro por prioridad -->
        <select v-model="selectedPriority" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          <option value="">All priorities</option>
          <option value="alta">High</option>
          <option value="media">Medium</option>
          <option value="baja">Low</option>
        </select>
      </div>
    </div>
    <!-- Kanban board con columnas dinámicas -->
    <div :class="['grid', `grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns.length}`, 'gap-2 md:gap-4 py-4 min-h-[60vh] w-full']">
      <div
        v-for="(column, colIdx) in columns"
        :key="column.status"
        class="bg-gray-100 dark:bg-gray-800/90 rounded-lg p-2 md:p-4 flex flex-col flex-1 min-h-[40vh] w-full"
        :aria-label="column.label"
        role="region"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-gray-700 dark:text-gray-100">{{ column.label }}</h3>
          <span class="text-xs text-gray-500 dark:text-gray-300">{{ filteredTasksByStatus[column.status].length }} tasks</span>
        </div>
        <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
          <div
            class="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-primary-500 to-primary-600"
            :style="{ width: columnProgress[column.status] + '%' }"
            aria-label="Progress bar"
          ></div>
        </div>
        <div class="flex flex-col gap-3 min-h-[60px] flex-1">
          <div
            v-for="(task, idx) in filteredTasksByStatus[column.status]"
            :key="task.id"
            class="kanban-task-draggable"
            :draggable="true"
            @dragstart="onDragStart($event, column.status, idx)"
            @dragover.prevent
            @drop="onDrop($event, column.status, idx)"
            tabindex="0"
            role="listitem"
            :aria-label="'Task: ' + (task.title || task.name)"
          >
            <TaskCard
              :task="task"
              :deadline="task.deadline"
              :show-deadline="true"
              :alert-deadline="isDeadlineAlert(task.deadline)"
              :members="task.members || []"
              :can-assign-member="true"
              @start-timer="$emit('start-timer', task)"
            />
          </div>
          <div
            v-if="filteredTasksByStatus[column.status].length === 0"
            class="text-gray-400 text-sm text-center py-4 flex-1 flex items-center justify-center"
            role="status"
          >
            No tasks
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue'
import BaseInput from '../atoms/BaseInput.vue'
import TaskFilters from './TaskFilters.vue'
import TaskCard from './TaskCard.vue'
import { Search } from 'lucide-vue-next'

const emit = defineEmits(['move-task', 'start-timer'])

const props = defineProps<{
  tasks: any[],
  projectInfo?: {
    nextReview?: string | Date,
    status?: string,
    progress?: number,
    methodology?: string,
    owner?: string,
    createdAt?: string | Date,
    members?: { id: string, name: string, avatar: string }[],
    columns?: { status: string, label: string }[]
  }
}>()

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const selectedUser = ref('')
const selectedPriority = ref('')
const dragging = ref<{ status: string, idx: number } | null>(null)

const categories = computed(() => {
  const set = new Set<string>()
  props.tasks.forEach(t => t.category && set.add(t.category))
  return Array.from(set)
})

function setCategoryFilter(category: string | null) {
  selectedCategory.value = category
}

const columns = computed(() => props.projectInfo?.columns || [
  { status: 'pendiente', label: 'To do' },
  { status: 'en_progreso', label: 'In progress' },
  { status: 'completado', label: 'Completed' }
])

const filteredTasks = computed(() => {
  let tasks = props.tasks
  if (selectedCategory.value) {
    tasks = tasks.filter(t => t.category === selectedCategory.value)
  }
  if (selectedUser.value) {
    tasks = tasks.filter(t => t.members && t.members.some((m: any) => m.id === selectedUser.value))
  }
  if (selectedPriority.value) {
    tasks = tasks.filter(t => t.priority === selectedPriority.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    tasks = tasks.filter(t => (t.title || t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
  }
  return tasks
})

const filteredTasksByStatus = computed(() => {
  const grouped: Record<string, any[]> = {}
  for (const col of columns.value) grouped[col.status] = []
  for (const task of filteredTasks.value) {
    const status = task.status || columns.value[0].status
    if (grouped[status]) grouped[status].push(task)
  }
  return grouped
})

const columnProgress = computed(() => {
  const result: Record<string, number> = {}
  const total = filteredTasks.value.length || 1
  for (const col of columns.value) {
    result[col.status] = Math.round((filteredTasksByStatus.value[col.status].length / total) * 100)
  }
  return result
})

function formatDate(date: string | Date | undefined) {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function isDeadlineAlert(deadline: string | Date | undefined) {
  if (!deadline) return false
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff < 2 // alert if less than 2 days
}

// --- Drag & Drop ---
function onDragStart(event: DragEvent, fromStatus: string, fromIdx: number) {
  dragging.value = { status: fromStatus, idx: fromIdx }
  event.dataTransfer?.setData('text/plain', `${fromStatus}:${fromIdx}`)
}

function onDrop(event: DragEvent, toStatus: string, toIdx: number) {
  event.preventDefault()
  if (!dragging.value) return
  const { status: fromStatus, idx: fromIdx } = dragging.value
  if (fromStatus === toStatus && fromIdx === toIdx) return
  // Emitir evento para que el padre actualice el estado
  emit('move-task', { fromStatus, fromIdx, toStatus, toIdx })
  dragging.value = null
}
</script> 