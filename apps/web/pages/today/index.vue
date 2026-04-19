<template>
  <TodayLayout :tasks="tasks" :is-quick-task-loading="isQuickTaskLoading" :phase-data="getPhaseDataForHeader"
    :phase-loading="circadianLoading" @toggle-filters="showFilters = !showFilters" @create-task="handleQuickTask"
    @delete-task="handleDeleteTask" @reorder-tasks="handleReorderTasks" />
</template>

<script setup lang="ts">
import TodayLayout from '@/components/organisms/today/TodayLayout.vue'
import { useActivities } from '@/composables/tasks/useActivities'
import { useActivityAdapter } from '@/composables/tasks/useActivityAdapter'
import { useCircadian } from '@/composables/useCircadian'
import { useTimerStore } from '@/stores/timer'
import { computed, onMounted, ref } from 'vue'

// Page meta
definePageMeta({
  title: 'Today',
  description: "Focus on today's immediate tasks and optimize your daily productivity",
})

// El tema se maneja globalmente a través del plugin
// No necesitamos acceder a él aquí

const timerStore = useTimerStore()
const { todayActivities, createActivity, deleteActivity, fetchTodayActivities } =
  useActivities()

const { activitiesToTasks } = useActivityAdapter()

// Circadian phase data
const { isLoading: circadianLoading, getPhaseDataForHeader } = useCircadian({
  autoRefresh: true,
  refreshInterval: 60000, // 1 minute
})

// Convert activities to tasks for component compatibility
const tasks = computed(() => activitiesToTasks(todayActivities.value))

// Filter state
const showFilters = ref(false)

// Quick task state
const isQuickTaskLoading = ref(false)

// Methods for TaskList
const handleDeleteTask = async (taskId: string) => {
  await deleteActivity(taskId)
}

const handleReorderTasks = (_reorderedTasks: any[]) => {
  // In a real app, you might want to update the order in the database
}

// Method to create quick tasks
const handleQuickTask = async (taskName: string) => {
  if (!taskName.trim()) return

  isQuickTaskLoading.value = true

  try {
    const newActivity = await createActivity({
      title: taskName,
      startTime: new Date(),
      priority: 'MEDIUM',
      category: 'WORK',
      tags: ['quick-task'],
    })

    if (newActivity) {
      // Activity created successfully
    }
  } catch (error) {
    console.error('Error creating activity:', error)
  } finally {
    isQuickTaskLoading.value = false
  }
}

// Load sample tasks if none exist
const loadSampleTasks = async () => {
  if (todayActivities.value.length === 0) {
    const sampleTasks = [
      {
        title: 'Study React Hooks and Context API',
        priority: 'HIGH' as const,
      },
      {
        title: 'Complete the Node.js API REST project',
        priority: 'HIGH' as const,
      },
      {
        title: 'Review advanced TypeScript documentation',
        priority: 'MEDIUM' as const,
      },
      {
        title: 'Prepare for the final project presentation',
        priority: 'HIGH' as const,
      },
      {
        title: 'Read chapter 3 of the productivity book',
        priority: 'LOW' as const,
      },
    ]

    for (const task of sampleTasks) {
      await createActivity({
        title: task.title,
        startTime: new Date(),
        priority: task.priority,
        category: 'WORK',
        tags: ['sample'],
      })
    }
  }
}

// Initialize on page mount
onMounted(async () => {
  // Load preferences and day summary
  timerStore.loadPreferences()
  timerStore.loadDaySummary()

  // Load today's tasks
  await fetchTodayActivities()
  await loadSampleTasks()
})
</script>
