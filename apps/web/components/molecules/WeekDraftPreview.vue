<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ draft.summary }}</p>
    <ul class="space-y-3">
      <li
        v-for="day in days"
        :key="day.offset"
        class="border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800"
      >
        <p class="text-xs font-medium uppercase tracking-wide text-gray-400">
          {{ day.label }}
        </p>
        <ul v-if="day.sessions.length" class="mt-1 space-y-1">
          <li
            v-for="(session, index) in day.sessions"
            :key="`${day.offset}-${index}`"
            class="flex items-baseline justify-between gap-3 text-sm text-gray-900 dark:text-white"
          >
            <span>{{ session.title }}</span>
            <span class="shrink-0 text-gray-400">{{ session.durationMin }}m</span>
          </li>
        </ul>
        <p v-else class="mt-1 text-sm text-gray-400">—</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { WeekDraft } from '@/types/generateWeek'

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

  const props = defineProps<{
    draft: WeekDraft
  }>()

  const days = computed(() =>
    DAY_LABELS.map((label, offset) => ({
      offset,
      label,
      sessions: props.draft.sessions.filter(s => s.dayOffset === offset),
    })),
  )
</script>
