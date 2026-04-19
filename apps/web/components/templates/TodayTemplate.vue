<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pt-6 pt-16">
      <!-- Header de Today -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Tareas de hoy -->
          <section aria-labelledby="today-tasks-heading">
            <BaseCard class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2
                  id="today-tasks-heading"
                  class="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Today's Tasks
                </h2>
                <BaseButton variant="primary" size="sm" @click="$emit('create-task')">
                  <Plus :size="16" class="mr-2" />
                  Add Task
                </BaseButton>
              </div>

              <TaskList
                :tasks="todayTasks"
                @start-timer="$emit('start-timer', $event)"
                @toggle-complete="$emit('toggle-complete', $event)"
                @delete-task="$emit('delete-task', $event)"
              />
            </BaseCard>
          </section>
        </div>

        <!-- Columna lateral -->
        <aside class="space-y-6">
          <!-- Progreso de hoy -->
          <section aria-labelledby="today-progress-heading">
            <BaseCard class="p-6">
              <h2
                id="today-progress-heading"
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
              >
                Today's Progress
              </h2>
              <ProgressVisual
                :weekly-data="todayProgress.weeklyData"
                :daily-data="todayProgress.dailyData"
                :total-sessions="todayProgress.totalSessions"
                :show-details="true"
              />
            </BaseCard>
          </section>

          <!-- Modos de enfoque -->
          <section aria-labelledby="focus-modes-heading">
            <BaseCard class="p-6">
              <h2
                id="focus-modes-heading"
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
              >
                Focus Modes
              </h2>
              <div class="space-y-3">
                <div
                  v-for="mode in focusModes"
                  :key="mode.id"
                  class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  @click="$emit('start-focus-mode', mode)"
                >
                  <div class="flex items-center space-x-3">
                    <div :class="mode.color" class="w-3 h-3 rounded-full"></div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ mode.name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ mode.duration }}
                      </p>
                    </div>
                  </div>
                  <component :is="mode.icon" :size="16" class="text-gray-400" />
                </div>
              </div>
            </BaseCard>
          </section>

          <!-- Logros de hoy -->
          <section aria-labelledby="today-achievements-heading">
            <BaseCard class="p-6">
              <h2
                id="today-achievements-heading"
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
              >
                Today's Achievements
              </h2>
              <div class="space-y-3">
                <div
                  v-for="achievement in todayAchievements"
                  :key="achievement.id"
                  class="flex items-center space-x-3 p-3 rounded-lg"
                  :class="
                    achievement.completed
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-50 dark:bg-gray-800'
                  "
                >
                  <component
                    :is="achievement.icon"
                    :size="20"
                    :class="
                      achievement.completed
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400'
                    "
                  />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ achievement.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ achievement.description }}
                    </p>
                  </div>
                  <BaseBadge v-if="achievement.completed" variant="success" size="sm">
                    ✓
                  </BaseBadge>
                </div>
              </div>
            </BaseCard>
          </section>
        </aside>
      </div>

      <!-- Botón flotante para móvil -->
      <div class="fixed bottom-20 right-6 lg:hidden z-50">
        <BaseButton
          variant="primary"
          size="lg"
          @click="$emit('create-task')"
          class="w-14 h-14 rounded-full shadow-large"
          aria-label="Crear nueva tarea"
        >
          <Plus :size="24" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Plus } from 'lucide-vue-next'

  // Importar componentes de @ritmo/ui
  import BaseBadge from '@ritmo/ui/components/atoms/feedback/BaseBadge.vue'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'

  // Importar componentes locales
  import ProgressVisual from '~/components/molecules/ProgressVisual.vue'
  import TaskList from '~/components/molecules/TaskList.vue'

  // Props
  interface Props {
    todayTasks: any[]
    todayProgress: {
      weeklyData: any[]
      dailyData: any[]
      totalSessions: number
    }
    focusModes: any[]
    todayAchievements: any[]
    todayDate: string
    isLoading: boolean
  }

  defineProps<Props>()

  // Emits
  defineEmits<{
    'create-task': []
    'start-timer': [task: any]
    'toggle-complete': [task: any]
    'delete-task': [taskId: string]
    'start-focus-mode': [mode: any]
    'finish-focus': [sessionData: any]
    'exit-focus-mode': []
  }>()
</script>

<style scoped>
  /* Estilos específicos para el template Today */
</style>
