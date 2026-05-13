<template>
  <TodayLayout
    :tasks="tasks"
    :is-quick-task-loading="isQuickTaskLoading"
    :phase-data="getPhaseDataForHeader"
    :phase-loading="circadianLoading"
    :day-total-seconds="dayTotalSeconds"
    :last-session-ended-at="summaryStore.lastSessionEndedAt"
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
  import { useTodayHandlers } from '@/composables/tasks/useTodayHandlers'
  import { useTodayTaskView } from '@/composables/tasks/useTodayTaskView'
  import { useUserData } from '@/composables/shared/useUserData'
  import { useCircadian } from '@/composables/useCircadian'
  import { useTasksStore } from '@/stores/tasks'
  import { useTimerStore } from '@/stores/timer'
  import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'
  import type { Task } from '@/types/task'
  import { onMounted, ref, watch } from 'vue'

  definePageMeta({
    title: 'Today',
    description:
      "Focus on today's immediate tasks and optimize your daily productivity",
  })

  const tasksStore = useTasksStore()
  const timerStore = useTimerStore()
  const summaryStore = useWorkSessionSummaryStore()
  const { userTimezone } = useUserData()

  const { isLoading: circadianLoading, getPhaseDataForHeader } = useCircadian({
    autoRefresh: true,
    refreshInterval: 60_000,
    timezone: userTimezone,
  })

  const {
    isQuickTaskLoading,
    handleQuickTask,
    handleDeleteTask,
    handleUpdateTask,
    handleAddNote,
    handleCompleteTaskWithFeedback,
  } = useTodayHandlers()

  const { tasks, dayTotalSeconds } = useTodayTaskView()
  const showFilters = ref(false)

  const handleReorderTasks = (_reorderedTasks: Task[]) => {
    // Reorder is local-only until the API supports an order field
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  const loadSampleTasks = async () => {
    if (!import.meta.env.DEV) return
    if (tasksStore.tasks.length > 0) return

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
      await tasksStore.create({
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
    await Promise.all([tasksStore.fetchToday(), summaryStore.refresh()])
    await loadSampleTasks()
  })

  // Refresh summary whenever the active session ends (activeTask goes set → null)
  watch(
    () => timerStore.activeTask?.id ?? null,
    (curr, prev) => {
      if (prev && !curr) {
        void summaryStore.refresh()
      }
    },
  )
</script>
