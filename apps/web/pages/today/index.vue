<template>
  <TodayLayout
    :tasks="tasks"
    :is-quick-task-loading="isQuickTaskLoading"
    :phase-data="getPhaseDataForHeader"
    :phase-loading="circadianLoading"
    @toggle-filters="showFilters = !showFilters"
    @create-task="handleQuickTask"
    @delete-task="handleDeleteTask"
    @reorder-tasks="handleReorderTasks"
    @complete-task-with-feedback="handleCompleteTaskWithFeedback"
    @update-task="handleUpdateTask"
    @add-note="handleAddNote"
  />
</template>

<script setup lang="ts">
  import TodayLayout from '@/components/organisms/today/TodayLayout.vue'
  import { useActivityAdapter } from '@/composables/tasks/useActivityAdapter'
  import { useUserData } from '@/composables/shared/useUserData'
  import { useCircadian } from '@/composables/useCircadian'
  import { useActivitiesStore } from '@/stores/activities'
  import { useTimerStore } from '@/stores/timer'
  import type { Task, TaskCompletionFeedback } from '@/types/task'
  import { computed, onMounted, ref } from 'vue'

  definePageMeta({
    title: 'Today',
    description:
      "Focus on today's immediate tasks and optimize your daily productivity",
  })

  const activitiesStore = useActivitiesStore()
  const timerStore = useTimerStore()
  const { activitiesToTasks, taskToActivity } = useActivityAdapter()
  const { userTimezone } = useUserData()

  const { isLoading: circadianLoading, getPhaseDataForHeader } = useCircadian({
    autoRefresh: true,
    refreshInterval: 60_000,
    timezone: userTimezone,
  })

  const tasks = computed(() => activitiesToTasks(activitiesStore.todayActivities))
  const showFilters = ref(false)
  const isQuickTaskLoading = ref(false)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleQuickTask = async (taskName: string) => {
    if (!taskName.trim()) return

    isQuickTaskLoading.value = true
    try {
      await activitiesStore.create({
        title: taskName.trim(),
        startTime: new Date(),
        priority: 'MEDIUM',
        category: 'WORK',
        tags: ['quick-task'],
      })
    } finally {
      isQuickTaskLoading.value = false
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    await activitiesStore.remove(taskId)
  }

  const handleUpdateTask = async (task: Task) => {
    const payload = taskToActivity(task)
    const result = await activitiesStore.update(task.id, {
      title: payload.title?.trim() || (task.name || task.title || '').trim(),
      description: payload.description,
      priority: payload.priority,
      tags: payload.tags,
      ...(payload.type ? { category: payload.type } : {}),
    })

    if (!result.success) {
      console.error('[today] update failed:', result.error)
    }
  }

  const handleAddNote = async (taskId: string, note: string) => {
    const result = await activitiesStore.update(taskId, {
      description: note.trim() || undefined,
    })
    if (!result.success) {
      console.error('[today] add-note failed:', result.error)
    }
  }

  const handleReorderTasks = (_reorderedTasks: Task[]) => {
    // Reorder is local-only until the API supports an order field
  }

  const handleCompleteTaskWithFeedback = async (
    task: Task,
    feedback: TaskCompletionFeedback,
    resolve: () => void,
    reject: (error?: Error) => void,
  ) => {
    try {
      const result = await activitiesStore.markCompleted(task.id, true)
      if (!result.success)
        throw new Error(result.error ?? 'No se pudo completar la actividad')

      // Best-effort: persist feedback until a dedicated endpoint exists
      const feedbackNote = JSON.stringify({
        energyAfter: feedback.energyAfter,
        focusScore: feedback.focusScore,
        progressScore: feedback.progressScore,
        mentalDemand: feedback.mentalDemand,
        timeFit: feedback.timeFit,
        mainBlocker: feedback.mainBlocker,
      })
      await activitiesStore
        .update(task.id, { description: feedbackNote })
        .catch(() => {})

      resolve()
    } catch (err) {
      reject(
        err instanceof Error ? err : new Error('No se pudo completar la actividad'),
      )
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  const loadSampleTasks = async () => {
    if (!import.meta.env.DEV) return
    if (activitiesStore.activities.length > 0) return

    const samples = [
      { title: 'Study React Hooks and Context API', priority: 'HIGH' as const },
      { title: 'Complete the Node.js API REST project', priority: 'HIGH' as const },
      {
        title: 'Review advanced TypeScript documentation',
        priority: 'MEDIUM' as const,
      },
      {
        title: 'Prepare for the final project presentation',
        priority: 'HIGH' as const,
      },
      { title: 'Read chapter 3 of the productivity book', priority: 'LOW' as const },
    ]

    for (const sample of samples) {
      await activitiesStore.create({
        title: sample.title,
        startTime: new Date(),
        priority: sample.priority,
        category: 'WORK',
        tags: ['sample'],
      })
    }
  }

  onMounted(async () => {
    timerStore.loadPreferences()
    timerStore.loadDaySummary()
    await activitiesStore.fetchToday()
    await loadSampleTasks()
  })
</script>
