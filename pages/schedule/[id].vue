<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header con navegación -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <BaseButton
            variant="outline"
            size="sm"
            @click="$router.back()"
            aria-label="Volver"
          >
            <ArrowLeft :size="16" class="mr-2" />
            Volver
          </BaseButton>
          
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ schedule?.title || 'Horario' }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ schedule?.description || 'Detalles del horario' }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <BaseButton
            variant="outline"
            size="sm"
            @click="editSchedule"
            aria-label="Editar horario"
          >
            <Edit :size="16" class="mr-2" />
            Editar
          </BaseButton>
          
          <BaseButton
            variant="primary"
            size="sm"
            @click="showCreateTaskModal = true"
            aria-label="Crear tarea"
          >
            <Plus :size="16" class="mr-2" />
            Nueva Tarea
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Layout principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Panel izquierdo: Información del horario -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Información del horario -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información del horario
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horario
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ schedule?.startTime }} - {{ schedule?.endTime }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Días
              </label>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="day in schedule?.days" 
                  :key="day"
                  class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {{ getDayLabel(day) }}
                </span>
              </div>
            </div>
            
            <div v-if="schedule?.category">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <span 
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getCategoryColor(schedule.category)
                ]"
              >
                {{ schedule.category }}
              </span>
            </div>
            
            <div v-if="schedule?.priority">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad
              </label>
              <span 
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityColor(schedule.priority)
                ]"
              >
                {{ getPriorityLabel(schedule.priority) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Lista de tareas -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Tareas relacionadas
              </h2>
              <BaseButton
                variant="outline"
                size="sm"
                @click="showCreateTaskModal = true"
                aria-label="Agregar tarea"
              >
                <Plus :size="16" class="mr-2" />
                Agregar
              </BaseButton>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="relatedTasks.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare :size="24" class="text-gray-400" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay tareas
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Crea tu primera tarea para este horario
              </p>
              <BaseButton
                variant="primary"
                @click="showCreateTaskModal = true"
              >
                Crear tarea
              </BaseButton>
            </div>
            
            <div v-else class="space-y-3">
              <TaskItem
                v-for="task in relatedTasks"
                :key="task.id"
                :task="task"
                @toggle-complete="handleToggleComplete"
                @start-timer="handleStartTimer"
                @stop-timer="handleStopTimer"
                @edit="handleEditTask"
                @delete="handleDeleteTask"
                @archive="handleArchiveTask"
                @add-note="handleAddNote"
                @update-task="handleUpdateTask"
                @start-with-mode="handleStartWithMode"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho: Chat con IA -->
      <div class="lg:col-span-1">
        <AIChatInterface
          :schedule-id="scheduleId"
          :initial-context="aiContext"
          @create-task="handleCreateTask"
          @add-note="handleAddNote"
          @update-schedule="handleUpdateSchedule"
        />
      </div>
    </div>

    <!-- Modal de creación de tarea -->
    <div 
      v-if="showCreateTaskModal"
      class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="showCreateTaskModal = false"
    >
      <div 
        class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
        @click.stop
      >
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Nueva tarea
          </h3>
        </div>

        <form @submit.prevent="createTask" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título
            </label>
            <input
              v-model="taskForm.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nombre de la tarea"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select
              v-model="taskForm.category"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Sin categoría</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Estudio">Estudio</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridad
            </label>
            <select
              v-model="taskForm.priority"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div class="flex items-center gap-3 pt-4">
            <BaseButton
              variant="outline"
              type="button"
              @click="showCreateTaskModal = false"
              class="flex-1"
            >
              Cancelar
            </BaseButton>
            
            <BaseButton
              variant="primary"
              type="submit"
              class="flex-1"
            >
              Crear tarea
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  CheckSquare 
} from 'lucide-vue-next'
import type { Schedule, Task } from '~/types/calendar'
import BaseButton from '~/components/atoms/BaseButton.vue'
import TaskItem from '~/components/molecules/TaskItem.vue'
import AIChatInterface from '~/components/molecules/AIChatInterface.vue'

// Route
const route = useRoute()
const scheduleId = route.params.id as string

// Meta de la página
useHead({
  title: 'Detalle del Horario - Ritmo',
  meta: [
    { name: 'description', content: 'Gestiona tu horario con IA asistente' }
  ]
})

// Estado
const schedule = ref<Schedule | null>(null)
const tasks = ref<Task[]>([])
const showCreateTaskModal = ref(false)
const taskForm = ref({
  title: '',
  category: '',
  priority: 'media' as 'alta' | 'media' | 'baja'
})

// Computed
const relatedTasks = computed(() => {
  return tasks.value.filter(task => task.scheduleId === scheduleId)
})

const aiContext = computed(() => {
  if (!schedule.value) return ''
  
  return `Estás ayudando con el horario "${schedule.value.title}" que se ejecuta de ${schedule.value.startTime} a ${schedule.value.endTime} los días ${schedule.value.days.join(', ')}. Tiene ${relatedTasks.value.length} tareas relacionadas.`
})

// Métodos
const loadSchedule = async () => {
  // Simular carga de datos
  schedule.value = {
    id: scheduleId,
    title: 'Horario de trabajo',
    description: 'Horario principal de trabajo y estudio',
    startTime: '09:00',
    endTime: '17:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    color: '#3B82F6',
    projectId: '1',
    category: 'Trabajo',
    priority: 'alta',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const loadTasks = async () => {
  // Simular carga de tareas
  tasks.value = [
    {
      id: '1',
      name: 'Revisar código',
      title: 'Revisar código',
      createdAt: new Date(),
      category: 'Trabajo',
      priority: 'alta',
      completed: false,
      projectId: '1',
      scheduleId: scheduleId
    },
    {
      id: '2',
      name: 'Documentar API',
      title: 'Documentar API',
      createdAt: new Date(),
      category: 'Trabajo',
      priority: 'media',
      completed: false,
      projectId: '1',
      scheduleId: scheduleId
    }
  ]
}

const editSchedule = () => {
  // Implementar edición del horario
  console.log('Editar horario:', schedule.value?.id)
}

const createTask = () => {
  const newTask: Task = {
    id: Date.now().toString(),
    name: taskForm.value.title,
    title: taskForm.value.title,
    createdAt: new Date(),
    category: taskForm.value.category,
    priority: taskForm.value.priority,
    completed: false,
    projectId: schedule.value?.projectId,
    scheduleId: scheduleId
  }
  
  tasks.value.push(newTask)
  showCreateTaskModal.value = false
  taskForm.value = { title: '', category: '', priority: 'media' }
}

const handleCreateTask = (taskData: any) => {
  const newTask: Task = {
    id: Date.now().toString(),
    name: taskData.title || 'Nueva tarea',
    title: taskData.title || 'Nueva tarea',
    createdAt: new Date(),
    category: taskData.category,
    priority: taskData.priority || 'media',
    completed: false,
    projectId: schedule.value?.projectId,
    scheduleId: scheduleId
  }
  
  tasks.value.push(newTask)
}

const handleToggleComplete = (task: Task) => {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index > -1) {
    tasks.value[index].completed = !tasks.value[index].completed
  }
}

const handleStartTimer = (task: Task) => {
  // Implementar inicio de timer
  console.log('Iniciar timer para:', task.name)
}

const handleStopTimer = (task: Task) => {
  // Implementar parada de timer
  console.log('Parar timer para:', task.name)
}

const handleEditTask = (task: Task) => {
  // Implementar edición de tarea
  console.log('Editar tarea:', task.id)
}

const handleDeleteTask = (task: Task) => {
  tasks.value = tasks.value.filter(t => t.id !== task.id)
}

const handleArchiveTask = (task: Task) => {
  // Implementar archivado de tarea
  console.log('Archivar tarea:', task.id)
}

const handleAddNote = (taskId: string, note: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.notes = note
    task.hasNotes = true
  }
}

const handleUpdateTask = (task: Task) => {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index > -1) {
    tasks.value[index] = { ...task }
  }
}

const handleStartWithMode = (task: Task, mode: any) => {
  // Implementar inicio con modo específico
  console.log('Iniciar tarea con modo:', task.name, mode)
}

const handleUpdateSchedule = (scheduleData: any) => {
  // Implementar actualización del horario
  console.log('Actualizar horario:', scheduleData)
}

const getDayLabel = (day: string): string => {
  const labels = {
    'monday': 'Lun',
    'tuesday': 'Mar',
    'wednesday': 'Mié',
    'thursday': 'Jue',
    'friday': 'Vie',
    'saturday': 'Sáb',
    'sunday': 'Dom'
  }
  return labels[day as keyof typeof labels] || day
}

const getCategoryColor = (category: string): string => {
  const colors = {
    'Trabajo': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    'Estudio': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    'Personal': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
  }
  return colors[category as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
}

const getPriorityColor = (priority: string): string => {
  const colors = {
    'alta': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    'media': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
    'baja': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
}

const getPriorityLabel = (priority: string): string => {
  const labels = {
    'alta': 'Alta',
    'media': 'Media',
    'baja': 'Baja'
  }
  return labels[priority as keyof typeof labels] || priority
}

// Lifecycle
onMounted(() => {
  loadSchedule()
  loadTasks()
})
</script> 