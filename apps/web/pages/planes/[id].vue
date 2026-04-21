<template>
  <div class="mx-auto px-2 sm:px-4 lg:px-8 py-6">
    <PageHeader :title="project?.name || 'Plan'" :subtitle="project?.description || 'Sin descripción'" :breadcrumbs="[
      { label: 'Mis planes', to: '/planes' },
      { label: project?.name || 'Plan' },
    ]" :badges="[{ id: 'status', label: statusLabel, variant: 'info' }]" :actions="true">
      <template #actions>
        <BaseButton variant="primary" @click="openCreateTaskModal">
          Nueva tarea
        </BaseButton>
      </template>
    </PageHeader>

    <ProjectBoard :tasks="projectTasks" :projectInfo="projectBoardInfo" @move-task="handleMoveTask" />

    <div v-if="showCreateTaskModal"
      class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="showCreateTaskModal = false">
      <div
        class="w-full max-w-md bg-surface rounded-xl shadow-2xl border border-outline"
        @click.stop>
        <div class="p-6 border-b border-outline">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Nueva tarea
          </h3>
        </div>
        <form @submit.prevent="createTask" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título
            </label>
            <input v-model="taskForm.title" type="text" required
              class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nombre de la tarea" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select v-model="taskForm.category"
              class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
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
            <select v-model="taskForm.priority"
              class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div class="flex items-center gap-3 pt-4">
            <BaseButton variant="outline" type="button" @click="showCreateTaskModal = false" class="flex-1">
              Cancelar
            </BaseButton>
            <BaseButton variant="primary" type="submit" class="flex-1">
              Crear tarea
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/molecules/PageHeader.vue'
import ProjectBoard from '@/components/molecules/ProjectBoard.vue'
import { useProjectsStore } from '@/stores/projects'
import type { Task } from '@/types/task'

const route = useRoute()
const projectsStore = useProjectsStore()

onMounted(() => {
  projectsStore.initializeData()
})

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectsStore.getProjectById(projectId.value))

const projectTasks = computed(() =>
  projectsStore.getTasksByProjectId(projectId.value),
)

const statusLabels: Record<string, string> = {
  activo: 'Activo',
  en_progreso: 'En Progreso',
  planificado: 'Planificado',
  pausado: 'Pausado',
  completado: 'Completado',
}

const statusLabel = computed(
  () => statusLabels[project.value?.status || ''] || 'Desconocido',
)

const showCreateTaskModal = ref(false)
const taskForm = ref({
  title: '',
  category: '',
  priority: 'media' as 'alta' | 'media' | 'baja',
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
    status: 'pendiente',
  }
  projectsStore.addTask(newTask)
  showCreateTaskModal.value = false
  taskForm.value = { title: '', category: '', priority: 'media' }
}

const projectBoardInfo = computed(() => {
  const info: Record<string, unknown> = {
    status: project.value?.status,
    progress: project.value?.progress,
  }
  if (
    project.value &&
    typeof project.value === 'object' &&
    'nextReview' in project.value &&
    project.value.nextReview
  ) {
    info.nextReview = project.value.nextReview
  }
  return info
})

function handleMoveTask({
  fromStatus,
  fromIdx,
  toStatus,
  toIdx,
}: {
  fromStatus: string
  fromIdx: number
  toStatus: string
  toIdx: number
}) {
  const allTasks = [...projectTasks.value]
  const fromTasks = allTasks.filter(t => (t.status || 'pendiente') === fromStatus)
  const task = fromTasks[fromIdx]
  if (!task) return
  task.status = toStatus
  const toTasks = allTasks.filter(
    t => (t.status || 'pendiente') === toStatus && t.id !== task.id,
  )
  toTasks.splice(toIdx, 0, task)
  projectsStore.updateTask(task)
}
</script>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(135deg, var(--tw-gradient-stops));
}
</style>
