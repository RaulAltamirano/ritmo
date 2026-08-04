<template>
  <div class="mx-auto px-2 sm:px-4 lg:px-8 py-6">
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-4">
      <BaseSpinner size="lg" color="primary" />
      <p class="text-base text-gray-600 dark:text-gray-400">Loading plan…</p>
    </div>

    <BaseCard v-else-if="loadError" variant="simple" size="md" :hoverable="false">
      <p class="text-base text-red-600 dark:text-red-400">{{ loadError }}</p>
      <div class="mt-4 flex gap-3">
        <BaseButton variant="outline" @click="navigateTo('/planes')">
          Back to plans
        </BaseButton>
        <BaseButton variant="primary" @click="loadPlanDetail"> Retry </BaseButton>
      </div>
    </BaseCard>

    <template v-else-if="project">
      <PageHeader
        :title="project.name"
        :subtitle="project.description || 'No description'"
        :breadcrumbs="[{ label: 'My plans', to: '/planes' }, { label: project.name }]"
        :badges="[{ id: 'status', label: statusLabel, variant: 'info' }]"
        actions
      >
        <template #actions>
          <BaseButton variant="primary" @click="openCreateTaskModal">
            New task
          </BaseButton>
        </template>
      </PageHeader>

      <ProjectBoard
        :tasks="projectTasks"
        :projectInfo="projectBoardInfo"
        @move-task="handleMoveTask"
      />

      <div
        v-if="showCreateTaskModal"
        class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click="showCreateTaskModal = false"
      >
        <div
          class="w-full max-w-md bg-surface rounded-xl shadow-2xl border border-outline"
          @click.stop
        >
          <div class="p-6 border-b border-outline">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              New task
            </h3>
          </div>
          <form @submit.prevent="createTask" class="p-6 space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Title
              </label>
              <input
                v-model="taskForm.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Task name"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Category
              </label>
              <select
                v-model="taskForm.category"
                class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">No category</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Priority
              </label>
              <select
                v-model="taskForm.priority"
                class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="baja">Low</option>
                <option value="media">Medium</option>
                <option value="alta">High</option>
              </select>
            </div>
            <p
              v-if="createError"
              class="text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {{ createError }}
            </p>
            <div class="flex items-center gap-3 pt-4">
              <BaseButton
                variant="outline"
                type="button"
                :disabled="creating"
                @click="showCreateTaskModal = false"
                class="flex-1"
              >
                Cancel
              </BaseButton>
              <BaseButton
                variant="primary"
                type="submit"
                class="flex-1"
                :disabled="creating"
              >
                {{ creating ? 'Creating…' : 'Create task' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
  import BaseSpinner from '@ritmo/ui/components/atoms/display/BaseSpinner.vue'
  import { computed, onMounted, ref, watch } from 'vue'
  import PageHeader from '@/components/molecules/PageHeader.vue'
  import ProjectBoard from '@/components/molecules/ProjectBoard.vue'
  import { useProjectsStore } from '@/stores/projects'
  import { useTasksStore } from '@/stores/tasks'

  const route = useRoute()
  const projectsStore = useProjectsStore()
  const tasksStore = useTasksStore()

  const projectId = computed(() => route.params.id as string)
  const isLoading = ref(true)
  const loadError = ref<string | null>(null)
  const creating = ref(false)
  const createError = ref<string | null>(null)

  const project = computed(() => projectsStore.getProjectById(projectId.value))

  const projectTasks = computed(() =>
    projectsStore.getTasksByProjectId(projectId.value),
  )

  const statusLabels: Record<string, string> = {
    activo: 'Active',
    en_progreso: 'In progress',
    planificado: 'Planned',
    pausado: 'Paused',
    completado: 'Completed',
  }

  const statusLabel = computed(
    () => statusLabels[project.value?.status ?? ''] ?? 'Unknown',
  )

  const showCreateTaskModal = ref(false)
  const taskForm = ref({
    title: '',
    category: '',
    priority: 'media' as 'alta' | 'media' | 'baja',
  })

  async function loadPlanDetail() {
    isLoading.value = true
    loadError.value = null
    const planResult = await projectsStore.fetchPlan(projectId.value)
    if (!planResult.success) {
      loadError.value = planResult.error
      isLoading.value = false
      return
    }
    const tasksResult = await projectsStore.fetchPlanTasks(projectId.value)
    if (!tasksResult.success) {
      loadError.value = tasksResult.error
    }
    isLoading.value = false
  }

  onMounted(() => {
    void loadPlanDetail()
  })

  watch(projectId, () => {
    void loadPlanDetail()
  })

  function openCreateTaskModal() {
    createError.value = null
    showCreateTaskModal.value = true
  }

  const priorityToApi: Record<'alta' | 'media' | 'baja', 'HIGH' | 'MEDIUM' | 'LOW'> = {
    alta: 'HIGH',
    media: 'MEDIUM',
    baja: 'LOW',
  }

  async function createTask() {
    if (!taskForm.value.title.trim()) return
    creating.value = true
    createError.value = null
    try {
      const result = await tasksStore.create({
        title: taskForm.value.title.trim(),
        category: taskForm.value.category || undefined,
        priority: priorityToApi[taskForm.value.priority],
        planId: projectId.value,
      })
      if (!result.success) {
        createError.value = result.error
        return
      }
      await projectsStore.fetchPlanTasks(projectId.value)
      showCreateTaskModal.value = false
      taskForm.value = { title: '', category: '', priority: 'media' }
    } finally {
      creating.value = false
    }
  }

  const projectBoardInfo = computed(() => ({
    status: project.value?.status,
    progress: project.value?.progress,
    createdAt: project.value?.createdAt,
    columns: [
      { status: 'pendiente', label: 'To do' },
      { status: 'en_progreso', label: 'In progress' },
      { status: 'completado', label: 'Completed' },
    ],
  }))

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
    const fromTasks = allTasks.filter(t => (t.status ?? 'pendiente') === fromStatus)
    const task = fromTasks[fromIdx]
    if (!task) return
    task.status = toStatus
    const toTasks = allTasks.filter(
      t => (t.status ?? 'pendiente') === toStatus && t.id !== task.id,
    )
    toTasks.splice(toIdx, 0, task)
    projectsStore.updateTask(task)
  }
</script>
