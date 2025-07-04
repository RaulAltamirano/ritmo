<template>
  <BaseCard variant="elevated" padding="lg">
    <div class="space-y-8">
      <!-- Header con métricas principales -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <TrendingUp class="text-white" :size="20" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Tu Progreso</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Seguimiento de tu productividad</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            {{ totalSessions }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">sesiones totales</div>
        </div>
      </div>

      <!-- Métricas rápidas -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
          <div class="flex items-center space-x-2 mb-2">
            <Calendar class="text-blue-600 dark:text-blue-400" :size="16" />
            <span class="text-sm font-medium text-blue-700 dark:text-blue-300">Esta semana</span>
          </div>
          <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ weeklySessions }}</div>
          <div class="text-xs text-blue-600 dark:text-blue-400">sesiones</div>
        </div>
        
        <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
          <div class="flex items-center space-x-2 mb-2">
            <Target class="text-green-600 dark:text-green-400" :size="16" />
            <span class="text-sm font-medium text-green-700 dark:text-green-300">Meta semanal</span>
          </div>
          <div class="text-2xl font-bold text-green-900 dark:text-green-100">{{ weeklyGoal }}</div>
          <div class="text-xs text-green-600 dark:text-green-400">sesiones</div>
        </div>
      </div>

      <!-- Barra de progreso semanal -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Progreso semanal</h4>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ weeklyProgress }}%</span>
        </div>
        <div class="relative">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              class="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${weeklyProgress}%` }"
              role="progressbar"
              :aria-valuenow="weeklyProgress"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span>{{ weeklyGoal }}</span>
          </div>
        </div>
      </div>

      <!-- Gráfico de calor semanal -->
      <div class="space-y-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Actividad diaria</h4>
        <div class="grid grid-cols-7 gap-2" role="group" aria-label="Gráfico de calor de actividad diaria">
          <div 
            v-for="(day, index) in dailyData" 
            :key="index"
            class="text-center group"
          >
            <div 
              :class="[
                'w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer relative',
                getHeatmapColor(day.sessions)
              ]"
              :aria-label="`${day.name}: ${day.sessions} sesiones`"
              role="img"
              @mouseenter="showTooltip = index"
              @mouseleave="showTooltip = null"
            >
              {{ day.sessions > 0 ? day.sessions : '' }}
              
              <!-- Tooltip -->
              <div 
                v-if="showTooltip === index"
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-xs rounded-lg shadow-lg z-10 whitespace-nowrap"
              >
                {{ day.name }}: {{ day.sessions }} sesiones
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
              </div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{{ day.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { TrendingUp, Calendar, Target } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import BaseCard from '~/components/atoms/BaseCard.vue'

interface DayData {
  name: string
  sessions: number
}

interface WeekData {
  sessions: number
}

interface ProgressVisualProps {
  weeklyData: WeekData[]
  dailyData: DayData[]
  totalSessions: number
}

const props = defineProps<ProgressVisualProps>()

const showTooltip = ref<number | null>(null)
const selectedWeek = ref<number | null>(null)

// Computed properties
const weeklySessions = computed(() => {
  return props.dailyData.reduce((sum, day) => sum + day.sessions, 0)
})

const weeklyGoal = computed(() => {
  return 20 // Meta semanal configurable
})

const weeklyProgress = computed(() => {
  return Math.min(Math.round((weeklySessions.value / weeklyGoal.value) * 100), 100)
})

const averageSessions = computed(() => {
  const total = props.weeklyData.reduce((sum, week) => sum + week.sessions, 0)
  return total > 0 ? Math.round(total / props.weeklyData.length) : 0
})

const bestWeek = computed(() => {
  const max = Math.max(...props.weeklyData.map(week => week.sessions))
  return max > 0 ? max : 0
})

// Methods
const getHeatmapColor = (sessions: number) => {
  if (sessions === 0) return 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
  if (sessions <= 2) return 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 hover:bg-green-300 dark:hover:bg-green-700'
  if (sessions <= 4) return 'bg-green-400 dark:bg-green-700 text-white hover:bg-green-500 dark:hover:bg-green-600'
  if (sessions <= 6) return 'bg-green-600 dark:bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-500'
  return 'bg-green-800 dark:bg-green-500 text-white hover:bg-green-900 dark:hover:bg-green-400'
}

const getWeekColor = (sessions: number) => {
  if (sessions === 0) return 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
  if (sessions <= 5) return 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
  if (sessions <= 10) return 'bg-blue-400 dark:bg-blue-700 text-white'
  if (sessions <= 15) return 'bg-blue-600 dark:bg-blue-600 text-white'
  return 'bg-blue-800 dark:bg-blue-500 text-white'
}

const getWeekTrend = (sessions: number) => {
  if (sessions >= 15) return 'Excelente'
  if (sessions >= 10) return 'Muy bien'
  if (sessions >= 5) return 'Bien'
  return 'Regular'
}

const selectWeek = (index: number) => {
  selectedWeek.value = selectedWeek.value === index ? null : index
}
</script>

<style scoped>
/* Animaciones personalizadas */
.group:hover .scale-110 {
  transform: scale(1.1);
}

/* Gradientes personalizados */
.bg-gradient-to-br {
  background: linear-gradient(135deg, var(--tw-gradient-stops));
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}
</style> 