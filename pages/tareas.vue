<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header de página -->
    <PageHeader
      title="Tareas"
      subtitle="Gestiona tus tareas y proyectos"
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
        
        <BaseButton
          variant="primary"
          @click="showTaskForm = true"
          class="flex items-center space-x-2"
        >
          <Plus :size="16" />
          <span>Nueva Tarea</span>
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filtros y búsqueda -->
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Búsqueda -->
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar tareas..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Search 
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              :size="16"
            />
          </div>
        </div>
        
        <!-- Filtros -->
        <div class="flex gap-2">
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>
          
          <select
            v-model="categoryFilter"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todas las categorías</option>
            <option value="Estudio">Estudio</option>
            <option value="Trabajo">Trabajo</option>
            <option value="Personal">Personal</option>
            <option value="Salud">Salud</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista de tareas -->
    <div class="space-y-4">
      <div 
        v-for="task in filteredTasks" 
        :key="task.id"
        class="animate-fade-in"
      >
        <TaskItem 
          :task="task"
          @toggle-complete="toggleTaskComplete(task)"
          @start-timer="startTimer(task)"
          @stop-timer="stopTimer(task)"
          @edit="editTask(task)"
          @delete="deleteTask(task)"
        >
          <!-- Acciones de tarea -->
          <div class="flex items-center space-x-2">
            <BaseButton
              variant="ghost"
              size="sm"
              @click="startTask(task)"
              class="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
            >
              <Play :size="14" />
            </BaseButton>
            
            <BaseButton
              variant="ghost"
              size="sm"
              @click="editTask(task)"
              class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
            >
              <Edit3 :size="14" />
            </BaseButton>
            
            <BaseButton
              variant="ghost"
              size="sm"
              @click="deleteTask(task.id)"
              class="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            >
              <Trash2 :size="14" />
            </BaseButton>
          </div>
        </TaskItem>
      </div>
      
      <!-- Estado vacío -->
      <div 
        v-if="filteredTasks.length === 0"
        class="text-center py-12"
      >
        <CheckSquare :size="64" class="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay tareas</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Crea tu primera tarea para comenzar</p>
        <BaseButton
          variant="primary"
          @click="showTaskForm = true"
          class="flex items-center space-x-2"
        >
          <Plus :size="16" />
          <span>Crear Tarea</span>
        </BaseButton>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div 
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeModals"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {{ showEditModal ? 'Editar Tarea' : 'Nueva Tarea' }}
        </h3>
        
        <TaskForm 
          :initial-data="editingTask"
          :is-editing="showEditModal"
          @submit="handleTaskSubmit"
          @cancel="closeModals"
        >
          <!-- Botones de acción -->
          <div class="flex items-center space-x-2">
            <BaseButton
              variant="outline"
              @click="closeTaskForm"
            >
              Cancelar
            </BaseButton>
            
            <BaseButton
              variant="primary"
              @click="saveTask"
              :disabled="!formData.name.trim()"
            >
              {{ editingTask ? 'Actualizar' : 'Crear' }} Tarea
            </BaseButton>
          </div>
        </TaskForm>
      </div>
    </div>

    <!-- Modo Focus -->
    <div 
      v-if="isFocusMode && activeTask"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    >
      <div class="text-center text-white p-8">
        <h2 class="text-3xl font-bold mb-4">{{ activeTask.title }}</h2>
        
        <!-- Cronómetro grande -->
        <div class="text-8xl font-mono mb-8">
          {{ formatTime(activeTask.timeRemaining) }}
        </div>
        
        <!-- Controles -->
        <div class="flex items-center justify-center space-x-4">
          <BaseButton
            variant="outline"
            @click="pauseTimer"
            class="text-white border-white hover:bg-white hover:text-black"
          >
            <Pause :size="20" />
            Pausar
          </BaseButton>
          
          <BaseButton
            variant="outline"
            @click="stopTimer"
            class="text-white border-white hover:bg-white hover:text-black"
          >
            <Square :size="20" />
            Detener
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Calendar, Clock, CheckCircle, Trash2, Edit3, Filter, Search, CheckSquare, Pause, Square } from 'lucide-vue-next'
import BaseButton from '~/components/atoms/BaseButton.vue'
import TaskForm from '~/components/molecules/TaskForm.vue'
import TaskItem from '~/components/molecules/TaskItem.vue'
import BaseCard from '~/components/atoms/BaseCard.vue'
import PageHeader from '~/components/molecules/PageHeader.vue'

// Datos de ejemplo
const tasks = ref([
  {
    id: '1',
    title: 'Estudiar para el examen de matemáticas',
    duration: '45 min',
    category: 'Estudio',
    priority: 'high' as const,
    completed: false,
    isRunning: false,
    timeRemaining: 45 * 60, // 45 minutos en segundos
    description: 'Repasar capítulos 1-5 del libro de texto',
    deadline: ''
  },
  {
    id: '2',
    title: 'Revisar documentación del proyecto',
    duration: '30 min',
    category: 'Trabajo',
    priority: 'medium' as const,
    completed: false,
    isRunning: false,
    timeRemaining: 30 * 60,
    description: 'Actualizar la documentación técnica',
    deadline: ''
  },
  {
    id: '3',
    title: 'Leer capítulo 5 del libro',
    duration: '25 min',
    category: 'Estudio',
    priority: 'low' as const,
    completed: true,
    isRunning: false,
    timeRemaining: 25 * 60,
    description: 'Lectura obligatoria para la próxima clase',
    deadline: ''
  }
])

// Estado de la aplicación
const searchQuery = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingTask = ref<any>(null)
const isFocusMode = ref(false)
const activeTask = ref<any>(null)
const formData = ref({
  name: '',
  description: '',
  category: '',
  priority: 'medium',
  dueDate: null
})

// Filtrado de tareas
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    // Filtro de búsqueda
    const matchesSearch = !searchQuery.value || 
      task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // Filtro de estado
    const matchesStatus = statusFilter.value === 'all' ||
      (statusFilter.value === 'completed' && task.completed) ||
      (statusFilter.value === 'pending' && !task.completed)
    
    // Filtro de categoría
    const matchesCategory = categoryFilter.value === 'all' ||
      task.category === categoryFilter.value
    
    return matchesSearch && matchesStatus && matchesCategory
  })
})

// Métodos
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const toggleTaskComplete = (task: any) => {
  task.completed = !task.completed
  if (task.completed && task.isRunning) {
    stopTimer(task)
  }
}

const startTimer = (task: any) => {
  // Detener cualquier otro cronómetro activo
  tasks.value.forEach(t => {
    if (t.id !== task.id && t.isRunning) {
      t.isRunning = false
    }
  })
  
  task.isRunning = true
  activeTask.value = task
  
  // Iniciar el cronómetro
  const interval = setInterval(() => {
    if (task.timeRemaining > 0 && task.isRunning) {
      task.timeRemaining--
    } else {
      clearInterval(interval)
      task.isRunning = false
      if (task.timeRemaining === 0) {
        // Tarea completada por tiempo
        task.completed = true
        // Aquí se podría mostrar una notificación
      }
    }
  }, 1000)
}

const stopTimer = (task: any) => {
  task.isRunning = false
  if (activeTask.value?.id === task.id) {
    activeTask.value = null
  }
}

const editTask = (task: any) => {
  editingTask.value = { ...task }
  formData.value = { ...task }
  showEditModal.value = true
}

const deleteTask = (task: any) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index > -1) {
      tasks.value.splice(index, 1)
    }
  }
}

const handleTaskSubmit = (data: any) => {
  if (showEditModal.value && editingTask.value) {
    // Actualizar tarea existente
    const task = tasks.value.find(t => t.id === editingTask.value.id)
    if (task) {
      Object.assign(task, {
        ...data,
        timeRemaining: parseInt(data.duration) * 60,
        duration: `${data.duration} min`
      })
    }
  } else {
    // Crear nueva tarea
    const newTask = {
      id: Date.now().toString(),
      ...data,
      completed: false,
      isRunning: false,
      timeRemaining: parseInt(data.duration) * 60,
      duration: `${data.duration} min`
    }
    tasks.value.unshift(newTask)
  }
  
  closeModals()
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTask.value = null
  formData.value = {
    name: '',
    description: '',
    category: '',
    priority: 'medium',
    dueDate: null
  }
}

const toggleFocusMode = () => {
  if (isFocusMode.value) {
    isFocusMode.value = false
    activeTask.value = null
  } else {
    const pendingTask = tasks.value.find(t => !t.completed)
    if (pendingTask) {
      activeTask.value = pendingTask
      isFocusMode.value = true
    }
  }
}

const pauseTimer = () => {
  if (activeTask.value) {
    activeTask.value.isRunning = false
  }
}

const startTask = (task: any) => {
  // Implementar lógica para iniciar tarea
  console.log('Iniciando tarea:', task)
}

const closeTaskForm = () => {
  closeModals()
}

const saveTask = () => {
  handleTaskSubmit(formData.value)
}

// Meta tags
useHead({
  title: 'Tareas - Ritmo',
  meta: [
    { name: 'description', content: 'Gestiona tus tareas y proyectos de manera eficiente' }
  ]
})
</script> 