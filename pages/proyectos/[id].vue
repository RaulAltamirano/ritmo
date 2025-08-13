<template>
  <div class="mx-auto px-2 sm:px-4 lg:px-8 py-6">
    <!-- Header del proyecto -->
    <PageHeader
      :title="project?.name || 'Proyecto'"
      :subtitle="project?.description || 'Sin descripción'"
      :breadcrumbs="[
        { label: 'Proyectos', to: '/proyectos' },
        { label: project?.name || 'Proyecto' }
      ]"
      :badges="[{ id: 'status', label: statusLabel, variant: 'info' }]"
      :actions="true"
    >
      <template #actions>
        <BaseButton variant="primary" @click="openCreateTaskModal">
          Nueva tarea
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Kanban de tareas avanzado -->
    <ProjectBoard :tasks="projectTasks" :projectInfo="projectBoardInfo" @move-task="handleMoveTask" />

    <!-- MODAL CREAR TAREA -->
    <div 
      v-if="showCreateTaskModal"
      class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="showCreateTaskModal = false"
    >
      <div 
        class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
        @click.stop
      >
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Nueva tarea
          </h3>
        </div>
        <form @submit.prevent="createTask" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título
            </label>
            <input
              v-model="taskForm.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nombre de la tarea"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select
              v-model="taskForm.category"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Sin categoría</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Estudio">Estudio</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridad
            </label>
            <select
              v-model="taskForm.priority"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div class="flex items-center gap-3 pt-4">
            <BaseButton
              variant="outline"
              type="button"
              @click="showCreateTaskModal = false"
              class="flex-1"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              variant="primary"
              type="submit"
              class="flex-1"
            >
              Crear tarea
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from '../../stores/projects'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../../components/molecules/PageHeader.vue'
import TaskItem from '../../components/molecules/TaskItem.vue'
import BaseButton from '../../components/atoms/BaseButton.vue'
import type { Task } from '../../types/task'
import ProjectBoard from '../../components/molecules/ProjectBoard.vue'

const route = useRoute()
const projectsStore = useProjectsStore()

onMounted(() => {
  projectsStore.initializeData()
})

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectsStore.getProjectById(projectId.value))

const projectTasks = computed(() => projectsStore.getTasksByProjectId(projectId.value))

const statusLabels: Record<string, string> = {
  activo: 'Activo',
  en_progreso: 'En Progreso',
  planificado: 'Planificado',
  pausado: 'Pausado',
  completado: 'Completado'
}

const statusLabel = computed(() => statusLabels[project.value?.status || ''] || 'Desconocido')

const colorClasses: Record<string, string> = {
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  green: 'bg-gradient-to-br from-green-500 to-green-600',
  red: 'bg-gradient-to-br from-red-500 to-red-600',
  yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
  pink: 'bg-gradient-to-br from-pink-500 to-pink-600',
  indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
  teal: 'bg-gradient-to-br from-teal-500 to-teal-600',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
  cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
  emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  rose: 'bg-gradient-to-br from-rose-500 to-rose-600'
}

const colorClass = computed(() => colorClasses[project.value?.color || 'blue'])

const progressColorClasses: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500'
}

const progressColorClass = computed(() => progressColorClasses[project.value?.color || 'blue'])

function formatDate(date: Date | string | undefined) {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

const showCreateTaskModal = ref(false)
const taskForm = ref({
  title: '',
  category: '',
  priority: 'media' as 'alta' | 'media' | 'baja'
})

function openCreateTaskModal() {
  showCreateTaskModal.value = true
}

function createTask() {
  const newTask: Task = {
    id: Date.now().toString(),
    name: taskForm.value.title,
    title: taskForm.value.title,
    createdAt: new Date(),
    category: taskForm.value.category,
    priority: taskForm.value.priority,
    completed: false,
    projectId: projectId.value,
    status: 'pendiente'
  }
  projectsStore.addTask(newTask)
  showCreateTaskModal.value = false
  taskForm.value = { title: '', category: '', priority: 'media' }
}

const groupedTasks = computed(() => {
  const groups: Record<string, Task[]> = {
    pendiente: [],
    en_progreso: [],
    completado: []
  }
  for (const task of projectTasks.value) {
    const status = task.status || 'pendiente'
    if (groups[status]) groups[status].push(task)
  }
  return groups
})

const projectBoardInfo = computed(() => {
  const info: any = {
    status: project.value?.status,
    progress: project.value?.progress
  }
  if (project.value && typeof project.value === 'object' && 'nextReview' in project.value && project.value.nextReview) {
    info.nextReview = project.value.nextReview
  }
  return info
})

function handleMoveTask({ fromStatus, fromIdx, toStatus, toIdx }: { fromStatus: string, fromIdx: number, toStatus: string, toIdx: number }) {
  // Obtener todas las tareas del proyecto
  const allTasks = [...projectTasks.value]
  // Encontrar la tarea a mover
  const fromTasks = allTasks.filter(t => (t.status || 'pendiente') === fromStatus)
  const task = fromTasks[fromIdx]
  if (!task) return
  // Actualizar el status
  task.status = toStatus
  // Reordenar en la nueva columna
  const toTasks = allTasks.filter(t => (t.status || 'pendiente') === toStatus && t.id !== task.id)
  toTasks.splice(toIdx, 0, task)
  // Reconstruir la lista de tareas
  const newTasks = allTasks.filter(t => t.id !== task.id).concat(task)
  // Actualizar en el store
  projectsStore.updateTask(task)
  // Opcional: actualizar el orden en el store si soporta orden
}
</script>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(135deg, var(--tw-gradient-stops));
}
</style> 