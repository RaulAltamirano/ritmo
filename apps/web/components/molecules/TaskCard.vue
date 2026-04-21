<template>
  <div
    class="tcard"
    :class="[
      task.isRunning
        ? 'bg-primary-50/70 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/50'
        : 'bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700/60',
      task.completed && 'opacity-60',
      isDragging && 'tcard--dragging',
    ]"
  >
    <div class="tcard-accent" :style="{ background: accentColor }"></div>

    <div class="tcard-body">
      <div v-if="showDragHandle" class="tcard-grip" aria-hidden="true">
        <GripVertical class="tcard-grip-icon" />
      </div>

      <div
        class="tcard-content tcard-content--clickable"
        role="button"
        tabindex="0"
        :aria-label="`Editar: ${task.title || task.name}`"
        @click="$emit('open-edit')"
        @keydown.enter.prevent="$emit('open-edit')"
        @keydown.space.prevent="$emit('open-edit')"
      >
        <span
          class="tcard-title"
          :class="[
            task.completed
              ? 'line-through text-gray-400 dark:text-gray-600'
              : 'text-gray-900 dark:text-white',
          ]"
        >
          {{ task.title || task.name }}
        </span>
        <div class="tcard-meta">
          <span v-if="task.duration" class="text-xs text-gray-400 dark:text-gray-500">
            {{ task.duration }}
          </span>
          <span
            v-if="task.duration && task.priority"
            class="text-xs text-gray-300 dark:text-gray-600"
            >·</span
          >
          <span
            v-if="task.priority"
            class="meta-priority"
            :class="[
              priorityClass[task.priority] ||
                'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700',
            ]"
          >
            {{ task.priority }}
          </span>
          <template v-if="task.totalTimeSpent">
            <span class="text-xs text-gray-300 dark:text-gray-600">·</span>
            <span class="text-xs text-gray-400 dark:text-gray-500"
              >{{ formatAccumulated(task.totalTimeSpent) }} acumulado</span
            >
          </template>
        </div>
      </div>

      <div
        v-if="task.isRunning"
        class="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400 tracking-wide flex-shrink-0"
      >
        {{ formatTime(task.timeRemaining || 0) }}
      </div>

      <div class="tcard-actions">
        <button
          v-if="!task.completed"
          class="tcard-btn"
          :class="[
            task.isRunning
              ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/60'
              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50',
          ]"
          :aria-label="task.isRunning ? 'Pausar tarea' : 'Iniciar tarea'"
          @click.stop="$emit('start-timer')"
        >
          <svg v-if="task.isRunning" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
          <svg v-else viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2.2L13.2 8 4 13.8V2.2z" />
          </svg>
        </button>

        <button
          v-if="!task.completed"
          class="tcard-btn bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
          aria-label="Marcar como completada"
          @click.stop="$emit('request-complete')"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="2,8.5 6,12.5 14,4" />
          </svg>
        </button>

        <button
          v-if="!task.completed"
          class="tcard-btn bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400"
          aria-label="Eliminar tarea"
          @click.stop="$emit('delete-task')"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>

        <div
          v-if="task.completed"
          class="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center"
        >
          <svg
            class="w-3 h-3"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="2,8.5 6,12.5 14,4" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { GripVertical } from 'lucide-vue-next'
  import type { Task } from '@/types/task'

  interface TaskCardProps {
    task: Task
    showDragHandle?: boolean
    isDragging?: boolean
  }

  const props = defineProps<TaskCardProps>()

  defineEmits<{
    'start-timer': []
    'request-complete': []
    'open-edit': []
    'delete-task': []
  }>()

  /* Accent bar colors — design system hex values */
  const priorityAccentHex: Record<string, string> = {
    alta: '#ef4444', // red-500
    media: '#f97316', // orange-500 (warning-500 in this config)
    baja: '#22c55e', // green-500
  }

  const accentColor = computed(() => {
    if (props.task.completed) return '#22c55e' // green-500
    if (props.task.isRunning) return '#0ea5e9' // primary-500
    return priorityAccentHex[props.task.priority ?? ''] ?? '#e2e8f0' // gray-200 fallback
  })

  /* Tailwind badge classes per priority */
  const priorityClass: Record<string, string> = {
    alta: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    media: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    baja: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const formatAccumulated = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const min = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${min}m` : `${min}m`
  }
</script>

<style scoped>
  .tcard {
    display: flex;
    align-items: stretch;
    border-width: 1px;
    border-style: solid;
    border-radius: 12px;
    overflow: hidden;
    transition:
      box-shadow 0.18s ease,
      transform 0.14s ease,
      opacity 0.2s ease;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .tcard:not(.opacity-60):hover {
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.07);
    transform: translateY(-1px);
  }

  .tcard-accent {
    width: 3px;
    flex-shrink: 0;
    transition: background 0.3s ease;
  }

  .tcard-body {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8125rem 1rem;
    min-width: 0;
  }

  .tcard-content {
    flex: 1;
    min-width: 0;
  }

  .tcard-content--clickable {
    cursor: pointer;
    border-radius: 8px;
    margin: -2px;
    padding: 2px;
    outline: none;
  }

  .tcard-content--clickable:hover {
    background: rgba(148, 163, 184, 0.12);
  }

  .dark .tcard-content--clickable:hover {
    background: rgba(148, 163, 184, 0.08);
  }

  .tcard-content--clickable:focus-visible {
    box-shadow: 0 0 0 2px var(--ph, #0ea5e9);
  }

  .tcard-title {
    display: block;
    font-size: 0.9375rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.1875rem;
    line-height: 1.35;
  }

  .tcard-meta {
    display: flex;
    align-items: center;
    gap: 0.3125rem;
    flex-wrap: wrap;
  }

  .meta-priority {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.1em 0.45em;
    border-radius: 4px;
  }

  .tcard-actions {
    display: flex;
    align-items: center;
    gap: 0.3125rem;
    flex-shrink: 0;
  }

  .tcard-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition:
      background 0.14s ease,
      transform 0.1s ease;
    outline: none;
  }

  .tcard-btn svg {
    width: 13px;
    height: 13px;
  }

  .tcard-btn:active {
    transform: scale(0.9);
  }

  .tcard--dragging,
  .tcard--dragging:hover {
    box-shadow: none !important;
    transform: none !important;
  }

  .tcard-grip {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 32px;
    margin-right: 2px;
    cursor: grab;
    color: #cbd5e1;
    opacity: 0;
    transition:
      opacity 0.15s ease,
      color 0.15s ease;
    border-radius: 4px;
  }

  .tcard:hover .tcard-grip {
    opacity: 1;
  }

  .tcard-grip:hover {
    color: #94a3b8;
  }

  .tcard-grip:active {
    cursor: grabbing;
  }

  .tcard-grip-icon {
    width: 13px;
    height: 13px;
  }

  /* Always visible on touch devices */
  @media (hover: none) {
    .tcard-grip {
      opacity: 0.4;
    }
  }

  /* Dark mode grip color */
  .dark .tcard-grip {
    color: #475569;
  }

  .dark .tcard-grip:hover {
    color: #64748b;
  }
</style>
