<template>
  <div class="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex flex-col gap-2 group transition-all duration-200 hover:shadow-lg">
    <div class="flex items-center justify-between mb-1">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate" :title="task.title || task.name">{{ task.title || task.name }}</h3>
      <span v-if="task.priority" :class="priorityClass(task.priority)">{{ priorityLabel(task.priority) }}</span>
    </div>
    <div class="flex items-center gap-2 mb-1">
      <span v-if="showDeadline && task.deadline" :class="['text-xs', alertDeadline ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-500 dark:text-gray-400']">
        <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        {{ formatDate(task.deadline) }}
      </span>
    </div>
    <div class="flex items-center gap-2 mb-2">
      <div v-if="members && members.length" class="flex -space-x-2">
        <img v-for="member in members" :key="member.id" :src="member.avatar" :alt="member.name" class="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 shadow" />
      </div>
      <span v-else class="text-xs text-gray-400">No members</span>
    </div>
    <div class="flex items-center gap-2 mt-auto">
      <button
        @click="$emit('start-timer', task)"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
        aria-label="Start timer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.868v4.264a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
        Start
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  task: any,
  members?: any[],
  showDeadline?: boolean,
  alertDeadline?: boolean
}>()

function formatDate(date: string | Date | undefined) {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function priorityLabel(priority: string) {
  if (priority === 'alta') return 'High'
  if (priority === 'media') return 'Medium'
  if (priority === 'baja') return 'Low'
  return priority
}

function priorityClass(priority: string) {
  if (priority === 'alta') return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2 py-0.5 rounded text-xs font-medium'
  if (priority === 'media') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-0.5 rounded text-xs font-medium'
  if (priority === 'baja') return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded text-xs font-medium'
  return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium'
}
</script> 