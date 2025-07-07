<template>
  <div>
    <!-- Cognitive Phase Indicator -->
    <div class="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-4">
      <div class="relative">
        <CognitivePhaseIndicator />
      </div>
    </div>
    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pt-6 pt-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Racha del estudiante con tareas -->
          <section aria-labelledby="streak-heading">
            <StreakCard 
              :streak="streakData.streak"
              :sessions-this-week="streakData.sessionsThisWeek"
              :total-time="streakData.totalTime"
              :weekly-progress="streakData.weeklyProgress"
              :tasks="tasks"
              @start-task="handleStartTask"
              @delete-task="$emit('delete-task', $event)"
            />
          </section>

          <!-- Notas Inteligentes -->
          <section aria-labelledby="smart-notes-heading">
              <QuickNotes
                :initial-notes="smartNotes"
                @improve-note="onImproveNote"
                @note-to-tasks="onNoteToTasks"
                @update-notes="onUpdateNotes"
              />
          </section>
        </div>
        
        <!-- Columna lateral -->
        <aside class="space-y-6">
          <!-- Sección de progreso rediseñada -->
          <section aria-labelledby="progress-heading">
            <ProgressVisual 
              :weekly-data="progressData.weekly"
              :daily-data="progressData.daily"
              :total-sessions="progressData.totalSessions"
            />
          </section>
          
          <!-- Logros -->
          <section aria-labelledby="achievements-heading">
            <BaseCard variant="elevated" padding="lg">
              <div class="flex items-center space-x-2 mb-4">
                <Trophy class="text-orange-500" :size="20" />
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Logros</h3>
              </div>
              
              <div class="space-y-4" role="list" aria-label="Lista de logros">
                <div 
                  v-for="achievement in achievements" 
                  :key="achievement.id"
                  class="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  :aria-label="`Logro: ${achievement.title} - ${achievement.description}`"
                  role="listitem"
                >
                  <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <component :is="achievement.icon" class="text-primary-600 dark:text-primary-400" :size="20" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ achievement.title }}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ achievement.description }}</p>
                  </div>
                  <div 
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      achievement.completed 
                        ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    ]"
                    role="status"
                  >
                    {{ achievement.completed ? 'Completado' : 'En progreso' }}
                  </div>
                </div>
                
                <!-- Estado vacío para logros -->
                <div 
                  v-if="achievements.length === 0"
                  class="text-center py-6 text-gray-500 dark:text-gray-400"
                  role="status"
                  aria-label="No hay logros disponibles"
                >
                  <Trophy class="mx-auto mb-2 text-gray-300 dark:text-gray-600" :size="32" />
                  <p class="text-sm">No hay logros disponibles</p>
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
          @click="$emit('quick-task')"
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
import { Trophy, Plus, StickyNote } from 'lucide-vue-next'
import { ref } from 'vue'

// Importar componentes explícitamente
import StreakCard from '@components/molecules/StreakCard.vue'
import ProgressVisual from '@components/molecules/ProgressVisual.vue'
import BaseCard from '@components/atoms/BaseCard.vue'
import BaseButton from '@components/atoms/BaseButton.vue'
import CognitivePhaseIndicator from '@components/molecules/CognitivePhaseIndicator.vue'
import QuickNotes from '@components/molecules/QuickNotes.vue'

interface StreakData {
  streak: number
  sessionsThisWeek: number
  totalTime: string
  weeklyProgress: number
}

interface WeekData {
  sessions: number
}

interface DayData {
  name: string
  sessions: number
}

interface ProgressData {
  weekly: WeekData[]
  daily: DayData[]
  totalSessions: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  completed: boolean
}

interface Task {
  id: string
  name: string
  createdAt: Date
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

interface DashboardTemplateProps {
  streakData: StreakData
  tasks: Task[]
  progressData: ProgressData
  achievements: Achievement[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<DashboardTemplateProps>(), {
  isLoading: false
})

// Estado del modo focus
const focusMode = ref({
  isActive: false,
  task: null as Task | null,
  mode: null as TimerMode | null
})

const emit = defineEmits<{
  'quick-task': []
  'create-task': [name: string]
  'start-task': [task: Task]
  'delete-task': [taskId: string]
  'finish-session': [{
    task: Task
    mode: TimerMode
    timeSpent: number
    completed: boolean
  }]
}>()

const handleStartTask = ({ task, mode }: { task: Task, mode: TimerMode }) => {
  focusMode.value = {
    isActive: true,
    task,
    mode
  }
}

const handleFinishSession = (sessionData: {
  task: Task
  mode: TimerMode
  timeSpent: number
  completed: boolean
}) => {
  focusMode.value.isActive = false
  emit('finish-session', sessionData)
}

const handleExitFocusMode = () => {
  focusMode.value.isActive = false
}

// Notas inteligentes de ejemplo
const smartNotes = ref([
  {
    id: '1',
    title: 'Ejemplo: Resumen de clase',
    content: 'Hoy aprendí sobre la fotosíntesis y sus fases.',
    category: 'Estudio',
    priority: 'normal' as 'normal',
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'Idea para proyecto',
    content: 'Crear una app que ayude a organizar tareas automáticamente.',
    category: 'Ideas',
    priority: 'high' as 'high',
    createdAt: new Date()
  }
])

const onImproveNote = (note: any) => {
  // Aquí podrías conectar con tu backend/IA
  // Por ahora solo log
  console.log('Mejorar nota:', note)
}
const onNoteToTasks = (note: any) => {
  // Aquí podrías conectar con tu backend/IA
  // Por ahora solo log
  console.log('Convertir nota en tareas:', note)
}
const onUpdateNotes = (notes: any) => {
  smartNotes.value = notes
}
</script> 