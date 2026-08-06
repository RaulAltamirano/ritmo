<template>
  <div
    class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="emit('close')"
  >
    <div
      class="w-full max-w-md bg-surface rounded-xl shadow-2xl border border-outline"
      @click.stop
    >
      <div class="p-6 border-b border-outline">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">New task</h3>
      </div>
      <form class="p-6 space-y-4" @submit.prevent="emit('submit')">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            for="plan-task-title"
          >
            Title
          </label>
          <input
            id="plan-task-title"
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Task name"
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            for="plan-task-category"
          >
            Category
          </label>
          <select
            id="plan-task-category"
            v-model="form.category"
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
            for="plan-task-priority"
          >
            Priority
          </label>
          <select
            id="plan-task-priority"
            v-model="form.priority"
            class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="baja">Low</option>
            <option value="media">Medium</option>
            <option value="alta">High</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              for="plan-task-date"
            >
              Day <span class="font-normal text-content-secondary">(optional)</span>
            </label>
            <input
              id="plan-task-date"
              v-model="form.date"
              type="date"
              class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              for="plan-task-time"
            >
              Time <span class="font-normal text-content-secondary">(optional)</span>
            </label>
            <input
              id="plan-task-time"
              v-model="form.time"
              type="time"
              class="w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <p v-if="error" class="text-sm text-red-600 dark:text-red-400" role="alert">
          {{ error }}
        </p>
        <div class="flex items-center gap-3 pt-4">
          <BaseButton
            variant="outline"
            type="button"
            class="flex-1"
            :disabled="loading"
            @click="emit('close')"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            type="submit"
            class="flex-1"
            :loading="loading"
          >
            {{ loading ? 'Creating…' : 'Create task' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'

  export interface PlanCreateTaskForm {
    title: string
    category: string
    priority: 'alta' | 'media' | 'baja'
    date: string
    time: string
  }

  const form = defineModel<PlanCreateTaskForm>({ required: true })

  defineProps<{
    loading?: boolean
    error?: string | null
  }>()

  const emit = defineEmits<{
    close: []
    submit: []
  }>()
</script>
