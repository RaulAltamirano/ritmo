<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header usando PageHeader -->
    <PageHeader
      title="Hoy"
      subtitle="Enfócate en lo que realmente importa"
      :actions="true"
    >
      <template #actions>
        <BaseButton
          variant="outline"
          @click="showFilters = !showFilters"
          class="flex items-center space-x-2"
        >
          <Filter :size="16" />
          <span>Filtros</span>
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Input de tarea rápida -->
    <div class="mb-6">
      <QuickTaskInput
        :is-loading="isQuickTaskLoading"
        @create-task="handleQuickTask"
      />
    </div>

    <!-- Lista de tareas -->
    <div v-if="tasks.length > 0">
      <TaskList 
        :tasks="tasks"
        @delete-task="handleDeleteTask"
        @reorder-tasks="handleReorderTasks"
      />
    </div>

    <!-- Estado vacío -->
    <div 
      v-else
      class="text-center py-16"
    >
      <div class="max-w-sm mx-auto">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Target class="text-gray-400" :size="24" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay tareas</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Usa el campo de arriba para crear tu primera tarea
        </p>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          💡 Escribe el nombre y presiona Enter
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Target, 
  Filter
} from 'lucide-vue-next'
import { ref, onMounted, watch } from 'vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import TaskList from '../components/molecules/TaskList.vue'
import QuickTaskInput from '../components/molecules/QuickTaskInput.vue'
import { useTimerStore } from '../stores/timer'
import { useActivities } from '../composables/useActivities'
import { useActivityAdapter } from '../composables/useActivityAdapter'

// Meta de la página
definePageMeta({
  title: 'Hoy - Tareas del día',
  description: 'Enfócate en las tareas inmediatas del día'
})

const timerStore = useTimerStore()
const { 
  activities,
  loading: activitiesLoading,
  error: activitiesError,
  todayActivities,
  createActivity,
  deleteActivity,
  updateActivity,
  fetchTodayActivities
} = useActivities()

const { activitiesToTasks } = useActivityAdapter()

// Convert activities to tasks for component compatibility
const tasks = computed(() => activitiesToTasks(todayActivities.value))

// Estado para filtros
const showFilters = ref(false)

// Estado para tareas rápidas
const isQuickTaskLoading = ref(false)

// Métodos para TaskList
const handleDeleteTask = async (taskId: string) => {
  await deleteActivity(taskId)
}

const handleReorderTasks = (tasks: any[]) => {
  // In a real app, you might want to update the order in the database
  console.log('Tasks reordered:', tasks)
}

// Método para crear tareas rápidas
const handleQuickTask = async (taskName: string) => {
  if (!taskName.trim()) return
  
  isQuickTaskLoading.value = true
  
  try {
    const newActivity = await createActivity({
      title: taskName,
      type: 'WORK',
      duration: 25,
      priority: 'MEDIUM',
      tags: ['quick-task']
    })
    
    if (newActivity) {
      console.log('Activity created:', newActivity)
    }
  } catch (error) {
    console.error('Error creating activity:', error)
  } finally {
    isQuickTaskLoading.value = false
  }
}

// Cargar tareas de ejemplo si no hay ninguna
const loadSampleTasks = async () => {
  if (todayActivities.value.length === 0) {
    const sampleTasks = [
      {
        title: 'Estudiar React Hooks y Context API',
        type: 'STUDY' as const,
        priority: 'HIGH' as const,
        duration: 45
      },
      {
        title: 'Completar proyecto de API REST con Node.js',
        type: 'WORK' as const,
        priority: 'HIGH' as const,
        duration: 60
      },
      {
        title: 'Revisar documentación de TypeScript avanzado',
        type: 'STUDY' as const,
        priority: 'MEDIUM' as const,
        duration: 30
      },
      {
        title: 'Preparar presentación del proyecto final',
        type: 'WORK' as const,
        priority: 'HIGH' as const,
        duration: 90
      },
      {
        title: 'Leer capítulo 3 del libro de productividad',
        type: 'OTHER' as const,
        priority: 'LOW' as const,
        duration: 20
      }
    ]
    
    for (const task of sampleTasks) {
      await createActivity({
        title: task.title,
        type: task.type,
        duration: task.duration,
        priority: task.priority,
        tags: ['sample']
      })
    }
  }
}

// Inicializar al montar la página
onMounted(async () => {
  // Cargar preferencias y resumen del día
  timerStore.loadPreferences()
  timerStore.loadDaySummary()
  
  // Cargar tareas del día
  await fetchTodayActivities()
  await loadSampleTasks()
})
</script> 