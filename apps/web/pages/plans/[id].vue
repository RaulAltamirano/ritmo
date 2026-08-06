<template>
  <div class="mx-auto px-2 sm:px-4 lg:px-8 py-6">
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-4">
      <BaseSpinner size="lg" color="primary" />
      <p class="text-base text-gray-600 dark:text-gray-400">Loading plan…</p>
    </div>

    <BaseCard v-else-if="loadError" variant="simple" size="md" :hoverable="false">
      <p class="text-base text-red-600 dark:text-red-400">{{ loadError }}</p>
      <div class="mt-4 flex gap-3">
        <BaseButton variant="outline" @click="navigateTo('/plans')">
          Back to plans
        </BaseButton>
        <BaseButton variant="primary" @click="loadPlanDetail"> Retry </BaseButton>
      </div>
    </BaseCard>

    <template v-else-if="project">
      <PageHeader
        :title="project.name"
        :subtitle="project.description || 'No description'"
        :breadcrumbs="[{ label: 'Plans', to: '/plans' }, { label: project.name }]"
        :badges="[{ id: 'status', label: statusLabel, variant: 'info' }]"
        actions
      >
        <template #actions>
          <BaseButton variant="primary" @click="openCreateTaskModal">
            New task
          </BaseButton>
          <PlanAiWeekGenerator @open="showGenerateWeekModal = true" />
        </template>
      </PageHeader>

      <div class="mt-6 space-y-6">
        <PlanWeekStrip
          v-model:week-start="weekStart"
          v-model:selected-day="selectedDay"
          :scheduled-tasks="scheduledTasks"
        />

        <PlanUnscheduledList
          :tasks="unscheduledTasks"
          @toggle-complete="handleToggleComplete"
        />

        <PlanDayTimeline
          :tasks="dayTasks"
          @toggle-complete="handleToggleComplete"
        />
      </div>

      <PlanCreateTaskModal
        v-if="showCreateTaskModal"
        v-model="taskForm"
        :loading="creating"
        :error="createError"
        @close="showCreateTaskModal = false"
        @submit="createTask"
      />

      <GenerateWeekModal
        :is-open="showGenerateWeekModal"
        :plan-id="project.id"
        :plan-name="project.name"
        :week-start="weekStart"
        @update:is-open="showGenerateWeekModal = $event"
        @close="showGenerateWeekModal = false"
        @apply="handleApplyWeekDraft"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
  import BaseSpinner from '@ritmo/ui/components/atoms/display/BaseSpinner.vue'
  import { computed, onMounted, ref, watch } from 'vue'
  import PageHeader from '@/components/molecules/PageHeader.vue'
  import PlanAiWeekGenerator from '@/components/molecules/PlanAiWeekGenerator.vue'
  import PlanCreateTaskModal from '@/components/molecules/PlanCreateTaskModal.vue'
  import PlanWeekStrip from '@/components/molecules/PlanWeekStrip.vue'
  import GenerateWeekModal from '@/components/organisms/GenerateWeekModal.vue'
  import PlanDayTimeline from '@/components/organisms/PlanDayTimeline.vue'
  import PlanUnscheduledList from '@/components/organisms/PlanUnscheduledList.vue'
  import { useProjectsStore } from '@/stores/projects'
  import { useTasksStore } from '@/stores/tasks'
  import type { WeekDraft } from '@/types/generateWeek'
  import type { Task } from '@/types/task'
  import {
    mergeWeekDraftTasks,
    weekDraftToTasks,
    weekHasScheduledTasks,
  } from '@/utils/applyWeekDraft'
  import {
    calendarDayKey,
    defaultSelectedDay,
    splitPlanTasks,
    startOfWeekMonday,
    tasksForDay,
  } from '@/utils/planWeek'
  import { buildMockPlanTimelineTasks } from '@/data/mockPlanTimelineTasks'

  interface PlanCreateTaskForm {
    title: string
    category: string
    priority: 'alta' | 'media' | 'baja'
    date: string
    time: string
  }

  const route = useRoute()
  const projectsStore = useProjectsStore()
  const tasksStore = useTasksStore()

  const projectId = computed(() => route.params.id as string)
  const isLoading = ref(true)
  const loadError = ref<string | null>(null)
  const creating = ref(false)
  const createError = ref<string | null>(null)
  const completingId = ref<string | null>(null)
  const showCreateTaskModal = ref(false)
  const showGenerateWeekModal = ref(false)
  const mockCompleted = ref<Record<string, boolean>>({})
  const aiOverlayTasks = ref<Task[] | null>(null)
  const aiOverlayWeekKey = ref<string | null>(null)

  const weekStart = ref(startOfWeekMonday(new Date()))
  const selectedDay = ref(defaultSelectedDay(weekStart.value))

  const emptyForm = (): PlanCreateTaskForm => ({
    title: '',
    category: '',
    priority: 'media',
    date: '',
    time: '',
  })
  const taskForm = ref(emptyForm())

  const project = computed(() => projectsStore.getProjectById(projectId.value))

  /** Demo tasks for today + unscheduled inbox (UI preview only). */
  const projectTasks = computed(() => {
    const real = projectsStore.getTasksByProjectId(projectId.value)
    const mocks = buildMockPlanTimelineTasks(projectId.value, new Date()).map(
      t => ({
        ...t,
        completed: mockCompleted.value[t.id] ?? t.completed,
      }),
    )
    const mockIds = new Set(mocks.map(t => t.id))
    let combined = [...real.filter(t => !mockIds.has(t.id)), ...mocks]

    const key = calendarDayKey(weekStart.value)
    if (aiOverlayTasks.value && aiOverlayWeekKey.value === key) {
      combined = mergeWeekDraftTasks(
        combined,
        aiOverlayTasks.value,
        weekStart.value,
      )
    }
    return combined
  })
  const scheduledTasks = computed(
    () => splitPlanTasks(projectTasks.value).scheduled,
  )
  const unscheduledTasks = computed(
    () => splitPlanTasks(projectTasks.value).unscheduled,
  )
  const dayTasks = computed(() =>
    tasksForDay(scheduledTasks.value, selectedDay.value),
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

  watch(weekStart, start => {
    selectedDay.value = defaultSelectedDay(start)
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
    taskForm.value = emptyForm()
    showCreateTaskModal.value = true
  }

  function handleApplyWeekDraft(draft: WeekDraft) {
    const real = projectsStore.getTasksByProjectId(projectId.value)
    const mocks = buildMockPlanTimelineTasks(projectId.value, new Date())
    const mockIds = new Set(mocks.map(t => t.id))
    const base = [...real.filter(t => !mockIds.has(t.id)), ...mocks]
    if (weekHasScheduledTasks(base, weekStart.value)) {
      const ok = window.confirm(
        "Replace this week’s scheduled sessions with the AI draft?",
      )
      if (!ok) return
    }
    aiOverlayTasks.value = weekDraftToTasks(draft, projectId.value)
    aiOverlayWeekKey.value = draft.weekStart
    showGenerateWeekModal.value = false
  }

  const priorityToApi: Record<'alta' | 'media' | 'baja', 'HIGH' | 'MEDIUM' | 'LOW'> = {
    alta: 'HIGH',
    media: 'MEDIUM',
    baja: 'LOW',
  }

  function buildStartTime(): Date | undefined {
    if (!taskForm.value.date) return undefined
    const time = taskForm.value.time || '09:00'
    const [hh, mm] = time.split(':').map(Number)
    const [yy, mo, dd] = taskForm.value.date.split('-').map(Number)
    if (!yy || !mo || !dd) return undefined
    return new Date(yy, mo - 1, dd, hh ?? 9, mm ?? 0, 0, 0)
  }

  async function createTask() {
    if (!taskForm.value.title.trim()) return
    creating.value = true
    createError.value = null
    try {
      const startTime = buildStartTime()
      const result = await tasksStore.create({
        title: taskForm.value.title.trim(),
        category: taskForm.value.category || undefined,
        priority: priorityToApi[taskForm.value.priority],
        planId: projectId.value,
        ...(startTime ? { startTime, estimatedDuration: 30 } : {}),
      })
      if (!result.success) {
        createError.value = result.error
        return
      }
      await projectsStore.fetchPlanTasks(projectId.value)
      showCreateTaskModal.value = false
      taskForm.value = emptyForm()
    } finally {
      creating.value = false
    }
  }

  async function handleToggleComplete(task: Task, completed: boolean) {
    if (task.id.startsWith('mock-plan-')) {
      mockCompleted.value = { ...mockCompleted.value, [task.id]: completed }
      return
    }
    if (completingId.value === task.id) return
    completingId.value = task.id
    const previous = task.completed
    projectsStore.updateTask({ ...task, completed })
    try {
      const result = await tasksStore.markCompleted(task.id, completed)
      if (!result.success) {
        projectsStore.updateTask({ ...task, completed: previous })
      }
    } finally {
      completingId.value = null
    }
  }
</script>
