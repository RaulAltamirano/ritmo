<template>
  <div>
    <!-- Contenido principal con padding para navbar móvil -->
    <div class="lg:pl-0 pb-20 lg:pb-0">
      <DashboardTemplate
        :streak-data="streakData"
        :stats-data="statsData"
        :tasks="tasks"
        :progress-data="progressData"
        :achievements="achievements"
        :is-loading="isLoading"
        @quick-task="showQuickTaskModal = true"
        @create-task="createTask"
        @start-task="startTask"
        @delete-task="deleteTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Trophy, 
  Target, 
  Calendar, 
  BookOpen,
  Clock,
  Star,
  GraduationCap,
  Users,
  Presentation
} from 'lucide-vue-next'

// Importar componentes explícitamente
import DashboardTemplate from '@components/templates/DashboardTemplate.vue'
import QuickTaskInput from '@components/molecules/QuickTaskInput.vue'
import QuickNotes from '@components/molecules/QuickNotes.vue'
import BaseButton from '@components/atoms/BaseButton.vue'

// Meta de la página
useHead({
  title: 'Dashboard - Ritmo',
  meta: [
    { name: 'description', content: 'Tu dashboard personal de productividad y estudio' }
  ]
})

// Estado
const showQuickTaskModal = ref(false)
const isLoading = ref(false)

// Datos de ejemplo
const streakData = ref({
  streak: 5,
  sessionsThisWeek: 12,
  totalTime: '8h 30m',
  weeklyProgress: 75
})

const statsData = ref({
  totalSessions: 45,
  totalTime: '32h 15m',
  completedTasks: 28,
  productivityScore: 85
})

const tasks = ref([
  {
    id: '1',
    name: 'Estudiar React Hooks',
    createdAt: new Date('2024-01-15T10:00:00')
  },
  {
    id: '2',
    name: 'Completar proyecto de API',
    createdAt: new Date('2024-01-15T14:30:00')
  },
  {
    id: '3',
    name: 'Revisar documentación de TypeScript',
    createdAt: new Date('2024-01-16T09:00:00')
  }
])

const progressData = ref({
  weekly: [
    { sessions: 5 },
    { sessions: 3 },
    { sessions: 7 },
    { sessions: 4 }
  ],
  daily: [
    { name: 'Lun', sessions: 2 },
    { name: 'Mar', sessions: 1 },
    { name: 'Mié', sessions: 3 },
    { name: 'Jue', sessions: 0 },
    { name: 'Vie', sessions: 2 },
    { name: 'Sáb', sessions: 1 },
    { name: 'Dom', sessions: 3 }
  ],
  totalSessions: 12
})

const achievements = ref([
  {
    id: '1',
    title: 'Primera Sesión',
    description: 'Completa tu primera sesión de estudio',
    icon: Star,
    completed: true
  },
  {
    id: '2',
    title: 'Racha de 3 días',
    description: 'Mantén una racha de 3 días consecutivos',
    icon: Target,
    completed: true
  },
  {
    id: '3',
    title: 'Racha de 7 días',
    description: 'Mantén una racha de 7 días consecutivos',
    icon: Trophy,
    completed: false
  },
  {
    id: '4',
    title: '10 sesiones',
    description: 'Completa 10 sesiones de estudio',
    icon: BookOpen,
    completed: true
  },
  {
    id: '5',
    title: '5 horas de estudio',
    description: 'Acumula 5 horas de tiempo de estudio',
    icon: Clock,
    completed: false
  }
])

// Notas rápidas
const quickNotes = ref([
  {
    id: '1',
    title: 'Recordatorio examen',
    content: 'Estudiar capítulos 5-7 para el examen de matemáticas del viernes',
    category: 'Estudio',
    priority: 'high' as const,
    createdAt: new Date('2024-01-16T08:00:00')
  },
  {
    id: '2',
    title: 'Idea proyecto',
    content: 'Crear una app de gestión de tareas con Vue 3 y TypeScript',
    category: 'Ideas',
    priority: 'normal' as const,
    createdAt: new Date('2024-01-16T10:30:00')
  },
  {
    id: '3',
    title: 'Reunión equipo',
    content: 'Preparar presentación para la reunión del equipo mañana a las 10am',
    category: 'Trabajo',
    priority: 'high' as const,
    createdAt: new Date('2024-01-16T14:00:00')
  }
])

// Próximos eventos
const upcomingEvents = ref([
  {
    id: '1',
    title: 'Examen de Matemáticas',
    date: 'Viernes, 19 Ene',
    time: '14:00',
    priority: 'high' as const,
    icon: GraduationCap
  },
  {
    id: '2',
    title: 'Reunión del equipo',
    date: 'Mañana, 17 Ene',
    time: '10:00',
    priority: 'high' as const,
    icon: Users
  },
  {
    id: '3',
    title: 'Presentación del proyecto',
    date: 'Lunes, 22 Ene',
    time: '15:30',
    priority: 'normal' as const,
    icon: Presentation
  }
])

// Métodos
const createTask = async (name: string) => {
  isLoading.value = true
  try {
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newTask = {
      id: Date.now().toString(),
      name,
      createdAt: new Date()
    }
    
    tasks.value.unshift(newTask)
    
    // Mostrar notificación de éxito
    console.log('Tarea creada:', newTask)
  } catch (error) {
    console.error('Error al crear tarea:', error)
  } finally {
    isLoading.value = false
  }
}

const startTask = (task: any) => {
  console.log('Iniciando tarea:', task)
  // Aquí podrías implementar la lógica para iniciar una tarea
}

const deleteTask = (taskId: string) => {
  const index = tasks.value.findIndex(task => task.id === taskId)
  if (index !== -1) {
    tasks.value.splice(index, 1)
    console.log('Tarea eliminada:', taskId)
  }
}

const handleQuickTaskCreate = (name: string) => {
  createTask(name)
  showQuickTaskModal.value = false
}

const handleQuickTaskStart = (task: any) => {
  startTask(task)
  showQuickTaskModal.value = false
}

const handleQuickTaskDelete = (taskId: string) => {
  deleteTask(taskId)
  showQuickTaskModal.value = false
}

const handleUpdateNotes = (notes: any[]) => {
  quickNotes.value = notes
  console.log('Notas actualizadas:', notes)
}
</script> 