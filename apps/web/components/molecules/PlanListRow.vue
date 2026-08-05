<template>
  <div
    role="link"
    tabindex="0"
    class="flex items-center gap-3 min-h-[3.5rem] px-3 py-2 rounded-lg border border-outline bg-surface hover:bg-surface-overlay cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <div
      class="w-1 self-stretch rounded-full shrink-0"
      :class="colorClasses[project.color]?.accent || colorClasses.blue.accent"
    />

    <div class="flex-1 min-w-0">
      <p class="font-medium truncate">{{ project.name }}</p>
      <p class="text-sm text-gray-500 line-clamp-1">{{ project.description }}</p>
    </div>

    <span
      class="px-2 py-1 text-xs font-medium rounded-full shrink-0"
      :class="statusClasses[project.status]"
    >
      {{ statusLabels[project.status] }}
    </span>

    <div class="flex items-center gap-2 shrink-0">
      <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
        <div
          class="h-1 rounded-full"
          :class="colorClasses[project.color]?.progress || colorClasses.blue.progress"
          :style="{ width: `${project.progress}%` }"
        />
      </div>
      <span class="text-sm text-gray-500">{{ project.progress }}%</span>
    </div>

    <span class="text-sm text-gray-500 shrink-0">{{ project.pendingTasks }} pending</span>

    <ChevronRight class="text-gray-400 shrink-0" :size="16" />
  </div>
</template>

<script setup lang="ts">
  import { ChevronRight } from 'lucide-vue-next'
  import type { PlanListRowProps } from '@/types/project'

  const props = defineProps<PlanListRowProps>()

  const handleClick = async () => {
    try {
      await navigateTo(`/plans/${props.project.id}`)
    } catch (error) {
      console.error('PlanListRow: failed to navigate to plan', error)
    }
  }

  // Same class reused for the accent bar and the progress fill, so a single
  // map keeps both in sync when a new plan color is added.
  const colorClasses: Record<string, { accent: string; progress: string }> = {
    blue: { accent: 'bg-blue-500', progress: 'bg-blue-500' },
    purple: { accent: 'bg-purple-500', progress: 'bg-purple-500' },
    green: { accent: 'bg-green-500', progress: 'bg-green-500' },
    red: { accent: 'bg-red-500', progress: 'bg-red-500' },
    yellow: { accent: 'bg-yellow-500', progress: 'bg-yellow-500' },
    pink: { accent: 'bg-pink-500', progress: 'bg-pink-500' },
    indigo: { accent: 'bg-indigo-500', progress: 'bg-indigo-500' },
    teal: { accent: 'bg-teal-500', progress: 'bg-teal-500' },
    orange: { accent: 'bg-orange-500', progress: 'bg-orange-500' },
    cyan: { accent: 'bg-cyan-500', progress: 'bg-cyan-500' },
    emerald: { accent: 'bg-emerald-500', progress: 'bg-emerald-500' },
    rose: { accent: 'bg-rose-500', progress: 'bg-rose-500' },
  }

  const statusClasses: Record<string, string> = {
    activo: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
    en_progreso:
      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
    planificado: 'bg-surface-overlay text-gray-800 dark:text-gray-400',
    pausado: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400',
    completado: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
  }

  const statusLabels: Record<string, string> = {
    activo: 'Active',
    en_progreso: 'In progress',
    planificado: 'Planned',
    pausado: 'Paused',
    completado: 'Completed',
  }
</script>

<style scoped>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
