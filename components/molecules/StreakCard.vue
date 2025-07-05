<template>
  <div class="space-y-6">
    <!-- Streak Collapsible Section -->
    <div :class="['bg-gradient-to-br from-primary-50 to-gray-50 dark:from-primary-900/20 dark:to-gray-900/20 rounded-xl p-6', currentStreakLevel.color]">
      <!-- Collapsible Header -->
      <div 
        class="flex items-center justify-between cursor-pointer"
        @click="toggleStreakSection"
        role="button"
        tabindex="0"
        @keydown.enter="toggleStreakSection"
        @keydown.space="toggleStreakSection"
      >
        <div class="flex items-center space-x-3">
          <div :class="['w-10 h-10 rounded-full flex items-center justify-center', currentStreakLevel.color, currentStreakLevel.animation]">
            <Flame class="text-primary-600 dark:text-primary-400" :size="20" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Your Streak</h2>
            <template v-if="!isStreakExpanded">
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ streak }} {{ streak === 1 ? 'day' : 'days' }} in a row</p>
              <span class="block text-xs font-semibold mt-1" :class="[`text-${currentStreakLevel.accent}`]">{{ currentStreakLevel.name }}</span>
            </template>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <!-- Mini design always visible -->
          <template v-if="!isStreakExpanded">
            <div class="flex items-center space-x-3">
              <div :class="['text-3xl font-bold', `text-${currentStreakLevel.accent}`, currentStreakLevel.animation]">{{ streak }}</div>
              <div class="flex space-x-1">
                <div 
                  v-for="day in 7" 
                  :key="day"
                  :class="[
                    'w-4 h-4 rounded-full border-2 transition-all duration-300',
                    day <= streak 
                      ? `bg-${currentStreakLevel.accent} border-${currentStreakLevel.accent}`
                      : 'bg-transparent border-gray-300 dark:border-gray-600'
                  ]"
                >
                  <Check v-if="day <= streak" class="text-white w-2.5 h-2.5 mx-auto mt-0.5" />
                </div>
              </div>
            </div>
          </template>
          <ChevronDown 
            :class="[
              'w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200',
              isStreakExpanded ? 'rotate-180' : ''
            ]"
          />
        </div>
      </div>
      <!-- Expandable Content -->
      <div 
        v-show="isStreakExpanded"
        class="mt-6 space-y-6"
        role="region"
        aria-label="Streak details"
      >
        <!-- Main streak number -->
        <div class="text-center">
          <div :class="['text-6xl font-bold mb-3', `text-${currentStreakLevel.accent}`, currentStreakLevel.animation]" role="status" aria-live="polite">{{ streak }}</div>
          <p class="text-xl text-gray-700 dark:text-gray-300 font-medium mb-6">
            {{ streak === 1 ? 'day' : 'days' }} in a row
          </p>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2" :class="[`bg-${currentStreakLevel.accent}/10`, `text-${currentStreakLevel.accent}`]">
            {{ currentStreakLevel.name }}
          </span>
        </div>
        <!-- Days visualization -->
        <div class="flex justify-center space-x-3 mb-8" role="group" aria-label="Consecutive days visualization">
          <div 
            v-for="day in 7" 
            :key="day"
            :class="[
              'w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center',
              day <= streak 
                ? `bg-${currentStreakLevel.accent} border-${currentStreakLevel.accent} shadow-lg` 
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            ]"
            :aria-label="`Day ${day}: ${day <= streak ? 'Completed' : 'Pending'}`"
            role="img"
          >
            <Check v-if="day <= streak" class="text-white" :size="20" />
            <span v-else class="text-gray-400 dark:text-gray-500 text-sm font-medium">{{ day }}</span>
          </div>
        </div>
        <!-- Motivational message -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="text-center">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3', currentStreakLevel.color, currentStreakLevel.animation]">
              <Flame class="text-primary-600 dark:text-primary-400" :size="20" />
            </div>
            <p class="text-base text-gray-800 dark:text-gray-200 font-medium mb-1">{{ motivationalMessage }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ motivationalSubtext }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Tasks Section -->
    <div class="space-y-4">
      <div class="">
      </div>
      <!-- Category filters -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in availableCategories"
          :key="category"
          @click="selectedCategory = selectedCategory === category ? null : category"
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            selectedCategory === category
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ category }}
        </button>
      </div>   
    </div>
  </div>
</template>

<script setup lang="ts">
import { Flame, Check, CheckSquare, Play, Trash2, Timer, Clock, Zap, Infinity, ChevronDown, MoreVertical, GripVertical } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Task {
  id: string
  name: string
  createdAt: Date
  category?: string
}

interface TimerMode {
  id: string
  name: string
  description: string
  duration: string
  icon: any
  color: string
  minutes: number
}

interface StreakCardProps {
  streak: number
  sessionsThisWeek: number
  totalTime: string
  weeklyProgress: number
  tasks: Task[]
}

const props = defineProps<StreakCardProps>()

const emit = defineEmits<{
  'start-task': [{ task: Task, mode: TimerMode }]
  'delete-task': [taskId: string]
  'reorder-tasks': [tasks: Task[]]
}>()

const showModeSelector = ref<string | null>(null)
const isStreakExpanded = ref(false)
const selectedCategory = ref<string | null>(null)
const draggedIndex = ref<number | null>(null)

// Timer modes available with solid colors
const timerModes: TimerMode[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: 'Pomodoro Technique',
    duration: '25 min',
    icon: Clock,
    color: 'bg-red-500',
    minutes: 25
  },
  {
    id: 'focus',
    name: 'Focus',
    description: 'Focused session',
    duration: '30 min',
    icon: Timer,
    color: 'bg-blue-500',
    minutes: 30
  },
  {
    id: 'pomodoro-xl',
    name: 'Pomodoro XL',
    description: 'Extended Pomodoro',
    duration: '50 min',
    icon: Clock,
    color: 'bg-orange-500',
    minutes: 50
  },
  {
    id: 'free',
    name: 'Free',
    description: 'No time limit',
    duration: '∞',
    icon: Infinity,
    color: 'bg-purple-500',
    minutes: 0
  }
]

// --- Streak Levels ---
const streakLevels = [
  {
    min: 0,
    name: 'Getting Started',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    accent: 'primary-400',
    animation: '',
    message: "Let's build your streak!",
    subtext: 'Every journey begins with a single step.'
  },
  {
    min: 1,
    name: 'On Fire',
    color: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    accent: 'primary-500',
    animation: 'animate-pulse-soft',
    message: 'You are on fire! Keep it up!',
    subtext: 'Consistency is the key to progress.'
  },
  {
    min: 3,
    name: 'Momentum',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    accent: 'green-500',
    animation: 'animate-fade-in',
    message: 'Momentum is building!',
    subtext: 'Habits are forming, stay focused.'
  },
  {
    min: 7,
    name: 'Flow State',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    accent: 'blue-500',
    animation: 'animate-pulse-soft',
    message: 'You are in the flow!',
    subtext: 'Your discipline is inspiring.'
  },
  {
    min: 14,
    name: 'Peak Performer',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    accent: 'orange-500',
    animation: 'animate-slide-up',
    message: 'Peak performance unlocked!',
    subtext: 'You are unstoppable.'
  },
  {
    min: 21,
    name: 'Limit Breaker',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    accent: 'primary-600',
    animation: 'animate-pulse-soft',
    message: 'Limit breaker! You are next level.',
    subtext: 'Your streak is legendary.'
  },
  {
    min: 30,
    name: 'Unstoppable',
    color: 'bg-primary-200 text-primary-900 dark:bg-primary-900/40 dark:text-primary-100',
    accent: 'primary-700',
    animation: 'animate-pulse-soft animate-glow',
    message: 'Unstoppable! You are a productivity machine.',
    subtext: 'You inspire everyone around you.'
  }
]

const currentStreakLevel = computed(() => {
  // Find the highest level that matches the current streak
  return streakLevels.slice().reverse().find(level => props.streak >= level.min) || streakLevels[0]
})

// Computed properties
const availableCategories = computed(() => {
  const categories = new Set<string>()
  props.tasks.forEach(task => {
    if (task.category) {
      categories.add(task.category)
    }
  })
  return Array.from(categories).sort()
})

const filteredTasks = computed(() => {
  if (!selectedCategory.value) {
    return props.tasks
  }
  return props.tasks.filter(task => task.category === selectedCategory.value)
})

// --- Animations ---
// Add a custom glow animation for the highest level
// ... existing code ...
// Mensajes motivacionales y subtextos ahora vienen de currentStreakLevel
const motivationalMessage = computed(() => currentStreakLevel.value.message)
const motivationalSubtext = computed(() => currentStreakLevel.value.subtext)

// Métodos
const toggleStreakSection = () => {
  isStreakExpanded.value = !isStreakExpanded.value
}

const startTaskQuick = (task: Task) => {
  // Iniciar con Pomodoro por defecto
  const pomodoroMode = timerModes.find(mode => mode.id === 'pomodoro')!
  emit('start-task', { task, mode: pomodoroMode })
}

const startTask = (task: Task, mode: TimerMode) => {
  showModeSelector.value = null
  emit('start-task', { task, mode })
}

// Colores de categoría actualizados con la paleta de Ritmo
const getCategoryColor = (category: string): string => {
  const colors = {
    'Work': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Study': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Personal': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'Project': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  }
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const formatDate = (date: Date): string => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'today'
  if (diffDays === 2) return 'yesterday'
  if (diffDays <= 7) return `${diffDays - 1} days ago`
  
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short' 
  })
}

// Drag and drop functionality
const onDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()
  
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    return
  }
  
  const newTasks = [...props.tasks]
  const draggedTask = newTasks[draggedIndex.value]
  
  // Remove dragged item
  newTasks.splice(draggedIndex.value, 1)
  
  // Insert at new position
  newTasks.splice(dropIndex, 0, draggedTask)
  
  emit('reorder-tasks', newTasks)
  draggedIndex.value = null
}

// Cerrar selector al hacer clic fuera
const closeModeSelector = () => {
  showModeSelector.value = null
}

// Event listeners
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      closeModeSelector()
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeModeSelector)
})
</script>

<style scoped>
/* Custom Animations */
@keyframes glow {
  0% { box-shadow: 0 0 8px 2px #a855f7; }
  50% { box-shadow: 0 0 24px 8px #a855f7; }
  100% { box-shadow: 0 0 8px 2px #a855f7; }
}
.animate-glow {
  animation: glow 1.5s infinite;
}
/* Animaciones personalizadas */
.group:hover .shadow-md {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}
/* Drag and drop styles */
[draggable="true"] {
  cursor: grab;
}
[draggable="true"]:active {
  cursor: grabbing;
}
</style> 