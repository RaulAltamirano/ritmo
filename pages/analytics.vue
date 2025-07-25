<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header de página -->
    <PageHeader
      title="Analíticas"
      subtitle="Insights y progreso - Visualiza tu productividad"
      :actions="true"
    >
      <template #actions>
        <BaseButton
          variant="outline"
          @click="exportData"
          class="flex items-center space-x-2"
        >
          <Download :size="16" />
          <span>Exportar</span>
        </BaseButton>
        
        <BaseButton
          variant="primary"
          @click="showFilters = !showFilters"
          class="flex items-center space-x-2"
        >
          <Filter :size="16" />
          <span>Filtros</span>
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Métricas principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <CheckSquare class="text-blue-600 dark:text-blue-400" :size="24" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Tareas completadas</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.completedTasks }}</p>
            <p class="text-sm text-green-600 dark:text-green-400">+12% vs semana pasada</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Clock class="text-green-600 dark:text-green-400" :size="24" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Tiempo enfocado</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatHours(stats.focusedHours) }}</p>
            <p class="text-sm text-green-600 dark:text-green-400">+8% vs semana pasada</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Target class="text-purple-600 dark:text-purple-400" :size="24" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Productividad</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.productivityScore }}%</p>
            <p class="text-sm text-green-600 dark:text-green-400">+5% vs semana pasada</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <TrendingUp class="text-orange-600 dark:text-orange-400" :size="24" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Racha actual</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.currentStreak }}</p>
            <p class="text-sm text-green-600 dark:text-green-400">días consecutivos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos y visualizaciones -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Gráfico de productividad semanal -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Productividad Semanal
        </h3>
        <div class="h-64 flex items-end justify-between space-x-2">
          <div 
            v-for="(day, index) in weeklyData" 
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {{ day.label }}
            </div>
            <div 
              class="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"
              :style="{ height: `${day.value}%` }"
            ></div>
            <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
              {{ day.value }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Distribución de tareas por categoría -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tareas por Categoría
        </h3>
        <div class="space-y-4">
          <div 
            v-for="category in categoryData" 
            :key="category.name"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div 
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: category.color }"
              ></div>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ category.name }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  class="h-2 rounded-full"
                  :style="{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color 
                  }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                {{ category.percentage }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Análisis detallado -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Horas más productivas -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Horas Más Productivas
        </h3>
        <div class="space-y-3">
          <div 
            v-for="hour in productiveHours" 
            :key="hour.time"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <Clock class="text-gray-400" :size="16" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ hour.time }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  class="h-2 bg-green-500 rounded-full"
                  :style="{ width: `${hour.productivity}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ hour.productivity }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Logros recientes -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Logros Recientes
        </h3>
        <div class="space-y-4">
          <div 
            v-for="achievement in recentAchievements" 
            :key="achievement.id"
            class="flex items-start space-x-3"
          >
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy class="text-yellow-600 dark:text-yellow-400" :size="16" />
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ achievement.title }}</h4>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ achievement.description }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ achievement.date }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recomendaciones -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recomendaciones
        </h3>
        <div class="space-y-4">
          <div 
            v-for="recommendation in recommendations" 
            :key="recommendation.id"
            class="flex items-start space-x-3"
          >
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb class="text-blue-600 dark:text-blue-400" :size="16" />
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ recommendation.title }}</h4>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ recommendation.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  CheckSquare, 
  Clock, 
  Target, 
  TrendingUp, 
  Download, 
  Filter,
  Trophy,
  Lightbulb
} from 'lucide-vue-next'
import { ref } from 'vue'
import BaseButton from '~/components/atoms/BaseButton.vue'
import PageHeader from '~/components/molecules/PageHeader.vue'

// Meta de la página
definePageMeta({
  title: 'Analíticas - Insights y progreso',
  description: 'Visualiza tu productividad y progreso'
})

// Estadísticas principales
const stats = ref({
  completedTasks: 47,
  focusedHours: 32.5,
  productivityScore: 87,
  currentStreak: 12
})

// Datos semanales
const weeklyData = ref([
  { label: 'Lun', value: 85 },
  { label: 'Mar', value: 92 },
  { label: 'Mié', value: 78 },
  { label: 'Jue', value: 95 },
  { label: 'Vie', value: 88 },
  { label: 'Sáb', value: 65 },
  { label: 'Dom', value: 70 }
])

// Datos por categoría
const categoryData = ref([
  { name: 'Trabajo', percentage: 35, color: '#3B82F6' },
  { name: 'Estudio', percentage: 28, color: '#10B981' },
  { name: 'Personal', percentage: 22, color: '#F59E0B' },
  { name: 'Salud', percentage: 15, color: '#EF4444' }
])

// Horas más productivas
const productiveHours = ref([
  { time: '09:00', productivity: 95 },
  { time: '14:00', productivity: 88 },
  { time: '16:00', productivity: 82 },
  { time: '10:00', productivity: 78 },
  { time: '15:00', productivity: 75 }
])

// Logros recientes
const recentAchievements = ref([
  {
    id: 1,
    title: 'Racha de 12 días',
    description: 'Has completado tareas por 12 días consecutivos',
    date: 'Hace 2 horas'
  },
  {
    id: 2,
    title: 'Meta semanal alcanzada',
    description: 'Completaste el 100% de tus tareas de la semana',
    date: 'Ayer'
  },
  {
    id: 3,
    title: 'Nuevo récord de enfoque',
    description: '6 horas de trabajo enfocado en un día',
    date: 'Hace 3 días'
  }
])

// Recomendaciones
const recommendations = ref([
  {
    id: 1,
    title: 'Optimiza tus mañanas',
    description: 'Tu productividad es más alta entre 9-11 AM. Programa tareas importantes en ese horario.'
  },
  {
    id: 2,
    title: 'Reduce las distracciones',
    description: 'Considera usar el modo enfoque más frecuentemente para mejorar tu concentración.'
  },
  {
    id: 3,
    title: 'Balance trabajo-estudio',
    description: 'Tu tiempo de estudio ha disminuido. Considera dedicar más tiempo a esta categoría.'
  }
])

// Estado
const showFilters = ref(false)

// Methods
const exportData = () => {
  // Lógica para exportar datos
  console.log('Exportando datos...')
}

const formatHours = (hours: number): string => {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours}h ${minutes}m`
}
</script> 