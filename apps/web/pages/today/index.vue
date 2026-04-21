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
  import { useTodayHandlers } from '@/composables/tasks/useTodayHandlers'
  import { useActivityAdapter } from '@/composables/tasks/useActivityAdapter'
  import { useUserData } from '@/composables/shared/useUserData'
  import { useCircadian } from '@/composables/useCircadian'
  import { useActivitiesStore } from '@/stores/activities'
  import { useTimerStore } from '@/stores/timer'
  import type { Task } from '@/types/task'
  import { computed, onMounted, ref } from 'vue'

  definePageMeta({
    title: 'Today',
    description:
      "Focus on today's immediate tasks and optimize your daily productivity",
  })

  const activitiesStore = useActivitiesStore()
  const timerStore = useTimerStore()
  const { activitiesToTasks } = useActivityAdapter()
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

  const tasks = computed(() => activitiesToTasks(activitiesStore.todayActivities))
  const showFilters = ref(false)

  const handleReorderTasks = (_reorderedTasks: Task[]) => {
    // Reorder is local-only until the API supports an order field
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
