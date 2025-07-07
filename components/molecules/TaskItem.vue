<template>
  <div 
    :class="[
      'relative bg-white dark:bg-gray-800/80 rounded-xl border transition-all duration-300 overflow-visible group backdrop-blur-sm',
      task.completed 
        ? 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20' 
        : task.isRunning
        ? 'border-purple-200 dark:border-purple-800/30 bg-purple-50/50 dark:bg-purple-900/10 shadow-sm'
        : 'border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600/50 hover:shadow-lg'
    ]"
  >
    <div class="p-5">
      <div class="flex items-start space-x-4">
        <!-- Contenido principal -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-3 mb-2">
            <h3 
              :class="[
                'text-base font-medium truncate',
                task.completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'
              ]"
            >
              {{ task.title }}
            </h3>
            <span 
              v-if="task.category" 
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                getCategoryColor(task.category)
              ]"
            >
              {{ task.category }}
            </span>
            <!-- Indicador de notas mejorado -->
            <div
              v-if="task.hasNotes || task.notes"
              class="flex items-center space-x-1 px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30"
            >
              <svg class="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-medium text-yellow-700 dark:text-yellow-300">Notas</span>
            </div>
          </div>
          
          <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <span>{{ task.duration }}</span>
            </div>
            <!-- Tiempo acumulado -->
            <div v-if="task.totalTimeSpent" class="flex items-center space-x-1">
              <span>•</span>
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <span>{{ formatAccumulatedTime(task.totalTimeSpent) }}</span>
            </div>
            <div v-if="task.priority" class="flex items-center space-x-2">
              <span>•</span>
              <span 
                :class="[
                  'capitalize font-medium',
                  task.priority === 'alta' && 'text-red-600 dark:text-red-400',
                  task.priority === 'media' && 'text-orange-600 dark:text-orange-400',
                  task.priority === 'baja' && 'text-green-600 dark:text-green-400'
                ]"
              >
                {{ task.priority }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Controles del cronómetro optimizados -->
        <div class="flex items-center space-x-3">
          <!-- Timer activo con diseño mejorado -->
          <div 
            v-if="task.isRunning" 
            class="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-800/30"
          >
            <span class="text-lg font-mono font-bold text-purple-700 dark:text-purple-300">
              {{ formatTime(task.timeRemaining || 0) }}
            </span>
          </div>
          
          <!-- Controles principales intuitivos -->
          <div class="flex items-center space-x-2">
            <!-- Botón principal de control (Play/Pause) -->
            <button
              v-if="!task.completed"
              @click="$emit('start-timer')"
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm border',
                task.isRunning 
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/30 hover:bg-orange-200 dark:hover:bg-orange-900/50' 
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/30 hover:bg-green-200 dark:hover:bg-green-900/50'
              ]"
              :aria-label="task.isRunning ? 'Pausar cronómetro' : 'Iniciar cronómetro'"
            >
              <svg 
                :class="task.isRunning ? 'w-5 h-5' : 'w-5 h-5'" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path v-if="task.isRunning" fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Botón de detener (Stop) -->
            <button
              v-if="task.isRunning"
              @click="$emit('stop-timer')"
              class="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 flex items-center justify-center transition-all duration-200"
              aria-label="Detener cronómetro"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <!-- Menú de opciones -->
          <div class="relative menu-container" :data-task-id="task.id">
            <button
              ref="menuButtonRef"
              @click.stop="toggleMenu"
              class="menu-button w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600/30 flex items-center justify-center transition-all duration-200"
              aria-label="Más opciones"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Menú desplegable con posición fija -->
  <Teleport to="body">
    <div 
      v-if="isMenuOpen"
      :style="menuPosition"
      class="fixed w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[999999]"
      @click.stop
    >
      <button
        @click="handleEditClick"
        class="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center space-x-3 transition-all duration-200"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        <span>Editar tarea</span>
      </button>
      
      <button
        @click="handleNoteClick"
        class="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center space-x-3 transition-all duration-200"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span>{{ task.hasNotes || task.notes ? 'Ver notas' : 'Agregar nota' }}</span>
      </button>
      
      <button
        @click="handleArchiveClick"
        class="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center space-x-3 transition-all duration-200"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
        </svg>
        <span>Archivar</span>
      </button>
      
      <div class="border-t border-gray-100 dark:border-gray-700 my-1"></div>
      
      <button
        @click="handleDeleteClick"
        class="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-all duration-200"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>Eliminar</span>
      </button>
    </div>
  </Teleport>
  
  <!-- Modal de notas -->
  <div 
    v-if="showNoteModal"
    class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="showNoteModal = false"
  >
    <div 
      class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
      @click.stop
    >
      <div class="p-4 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h5 class="text-lg font-semibold text-gray-900 dark:text-white">Notas de la tarea</h5>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ task.title }}</p>
          </div>
          <button
            @click="showNoteModal = false"
            class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-4">
        <textarea
          v-model="noteText"
          placeholder="Escribe tus notas aquí..."
          class="w-full h-32 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        ></textarea>
      </div>
      
      <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex space-x-3">
        <button
          @click="showNoteModal = false"
          class="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          @click="saveNote"
          class="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all duration-200"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
  
  <!-- Modal de edición mejorado con selección de técnicas -->
  <div 
    v-if="showEditModal && editingTask"
    class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="showEditModal = null"
  >
    <div 
      class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="p-4 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h5 class="text-lg font-semibold text-gray-900 dark:text-white">Editar tarea</h5>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Modifica los detalles y técnica de tiempo</p>
          </div>
            <button
            @click="showEditModal = null"
            class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-4 space-y-6">
        <!-- Información básica -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input
              v-model="editingTask.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
            <select
              v-model="editingTask.category"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Sin categoría</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Estudio">Estudio</option>
              <option value="Personal">Personal</option>
              <option value="Urgente">Urgente</option>
              <option value="Proyecto">Proyecto</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
            <select
              v-model="editingTask.priority"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>
        
        <!-- Selección de técnica de tiempo -->
        <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
          <h6 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Técnica de tiempo</h6>
          <div class="grid grid-cols-1 gap-3">
            <button
              v-for="mode in timerModes"
              :key="mode.id"
              @click="selectTimerMode(mode)"
              :class="[
                'flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
                selectedTimerMode?.id === mode.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
              ]"
            >
              <div class="flex items-center space-x-3">
                <div 
                  class="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                  :class="mode.color"
                >
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ mode.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ mode.description }}</div>
                </div>
              </div>
              <div class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ mode.duration }}</div>
            </button>
          </div>
        </div>
      </div>
      
      <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex space-x-3">
        <button
          @click="showEditModal = null"
          class="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          @click="saveEdit"
          class="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { Task, TimerMode, TaskItemProps } from '../../types/task'

const props = defineProps<TaskItemProps>()

const emit = defineEmits<{
  'toggle-complete': []
  'start-timer': []
  'stop-timer': []
  'edit': [task: Task]
  'delete': [task: Task]
  'archive': [task: Task]
  'add-note': [taskId: string, note: string]
  'update-task': [task: Task]
  'start-with-mode': [task: Task, mode: TimerMode]
}>()

// Estado local del menú
const isMenuOpen = ref(false)

const showNoteModal = ref(false)
const showEditModal = ref<boolean | null>(null)
const noteText = ref('')
const editingTask = ref<Task | null>(null)
const selectedTimerMode = ref<TimerMode | null>(null)

// Referencia al botón del menú para calcular posición
const menuButtonRef = ref<HTMLElement>()

// Posición del menú calculada
const menuPosition = computed(() => {
  if (!menuButtonRef.value || !isMenuOpen.value) return {}
  
  const rect = menuButtonRef.value.getBoundingClientRect()
  const menuWidth = 192 // w-48 = 12rem = 192px
  const menuHeight = 200 // altura aproximada del menú
  
  // Calcular posición
  let left = rect.right - menuWidth
  let top = rect.bottom + 8 // mt-2 = 8px
  
  // Ajustar si se sale de la pantalla
  if (left < 0) left = 8
  if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 8
  if (top + menuHeight > window.innerHeight) top = rect.top - menuHeight - 8
  
  return {
    left: `${left}px`,
    top: `${top}px`
  }
})

// Técnicas de tiempo disponibles
const timerModes: TimerMode[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: '25 minutos de trabajo concentrado',
    duration: '25m',
    time: 25 * 60,
    color: 'bg-red-500',
    icon: 'Timer'
  },
  {
    id: 'pomodoro-xl',
    name: 'Pomodoro XL',
    description: '45 minutos de trabajo extendido',
    duration: '45m',
    time: 45 * 60,
    color: 'bg-orange-500',
    icon: 'Timer'
  },
  {
    id: 'flow',
    name: 'Flow State',
    description: '90 minutos de inmersión profunda',
    duration: '90m',
    time: 90 * 60,
    color: 'bg-purple-500',
    icon: 'Timer'
  },
  {
    id: 'quick',
    name: 'Quick Focus',
    description: '15 minutos de trabajo rápido',
    duration: '15m',
    time: 15 * 60,
    color: 'bg-green-500',
    icon: 'Timer'
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Tiempo a tu medida',
    duration: '30m',
    time: 30 * 60,
    color: 'bg-blue-500',
    icon: 'Timer'
  }
]

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Colores de categoría mejorados
const getCategoryColor = (category: string): string => {
  const colors = {
    'Trabajo': 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30',
    'Estudio': 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/30',
    'Personal': 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30',
    'Urgente': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/30',
    'Proyecto': 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30'
  }
  return colors[category as keyof typeof colors] || 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600/30'
}

const handleEdit = () => {
  emit('edit', props.task)
}

const handleDelete = () => {
  emit('delete', props.task)
}

const handleArchive = () => {
  emit('archive', props.task)
}

// Métodos para notas
const openNoteModal = () => {
  editingTask.value = props.task
  noteText.value = props.task.notes || ''
  showNoteModal.value = true
}

const saveNote = () => {
  if (noteText.value.trim()) {
    emit('add-note', props.task.id, noteText.value.trim())
    showNoteModal.value = false
    noteText.value = ''
    editingTask.value = null
  }
}

// Métodos para edición
const openEditModal = () => {
  editingTask.value = { ...props.task }
  // Establecer la técnica de tiempo actual basada en la duración
  const currentDuration = props.task.duration || '25m'
  selectedTimerMode.value = timerModes.find(mode => mode.duration === currentDuration) || timerModes[0]
  showEditModal.value = true
}

const selectTimerMode = (mode: TimerMode) => {
  selectedTimerMode.value = mode
}

const saveEdit = () => {
  if (editingTask.value && selectedTimerMode.value) {
    editingTask.value.lastEdited = new Date()
    editingTask.value.duration = selectedTimerMode.value.duration
    emit('update-task', editingTask.value)
    showEditModal.value = null
    editingTask.value = null
    selectedTimerMode.value = null
  }
}

// Métodos para controlar el menú
const toggleMenu = () => {
  // Emitir evento para cerrar otros menús
  window.dispatchEvent(new CustomEvent('close-other-menus', { detail: { exceptId: props.task.id } }))
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleEditClick = () => {
  openEditModal()
  closeMenu()
}

const handleNoteClick = () => {
  openNoteModal()
  closeMenu()
}

const handleArchiveClick = () => {
  handleArchive()
  closeMenu()
}

const handleDeleteClick = () => {
  handleDelete()
  closeMenu()
}

// Formatear tiempo acumulado
const formatAccumulatedTime = (seconds: number): string => {
  if (!seconds) return '0m'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Cerrar menú al hacer clic fuera
onMounted(() => {
  // Event listener para cerrar otros menús
  const handleCloseOtherMenus = (event: CustomEvent) => {
    if (event.detail.exceptId !== props.task.id) {
      closeMenu()
    }
  }
  
  // Event listener para clic fuera
  const handleClickOutside = (e: Event) => {
    const target = e.target as HTMLElement
    if (!target?.closest('.menu-container') && isMenuOpen.value) {
      closeMenu()
    }
  }
  
  window.addEventListener('close-other-menus', handleCloseOtherMenus as EventListener)
  document.addEventListener('click', handleClickOutside)
  
  // Cleanup function
  onUnmounted(() => {
    window.removeEventListener('close-other-menus', handleCloseOtherMenus as EventListener)
    document.removeEventListener('click', handleClickOutside)
  })
})
</script> 

<style scoped>
/* Transiciones suaves */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Efectos de hover mejorados */
.group:hover {
  transform: translateY(-1px);
}

/* Animación para el timer activo */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.bg-purple-50 {
  animation: pulse 2s infinite;
}
</style> 