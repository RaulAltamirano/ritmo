import { ref, computed } from 'vue'
import { useTimerStore } from '../stores/timer'
import { useNotifications } from './useNotifications'

export interface Task {
  id: string
  name: string
  description?: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
  createdAt: Date
  completedAt?: Date
  estimatedTime?: number // en minutos
  actualTime?: number // en minutos
  tags?: string[]
}

export interface TaskFilters {
  category?: string
  priority?: string
  status?: 'all' | 'active' | 'completed'
  search?: string
}

// Función para generar IDs únicos
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useTasks = () => {
  const tasks = ref<Task[]>([])
  const filters = ref<TaskFilters>({
    status: 'all'
  })
  
  const timerStore = useTimerStore()
  const { showSuccess, showInfo, showWarning } = useNotifications()

  // Computed properties
  const filteredTasks = computed(() => {
    let result = tasks.value

    // Filtrar por estado
    if (filters.value.status === 'active') {
      result = result.filter(task => !task.completedAt)
    } else if (filters.value.status === 'completed') {
      result = result.filter(task => task.completedAt)
    }

    // Filtrar por categoría
    if (filters.value.category) {
      result = result.filter(task => task.category === filters.value.category)
    }

    // Filtrar por prioridad
    if (filters.value.priority) {
      result = result.filter(task => task.priority === filters.value.priority)
    }

    // Filtrar por búsqueda
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      result = result.filter(task => 
        task.name.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm) ||
        task.category?.toLowerCase().includes(searchTerm)
      )
    }

    return result
  })

  const activeTasks = computed(() => 
    tasks.value.filter(task => !task.completedAt)
  )

  const completedTasks = computed(() => 
    tasks.value.filter(task => task.completedAt)
  )

  const categories = computed(() => {
    const categoriesSet = new Set<string>()
    tasks.value.forEach(task => {
      if (task.category) {
        categoriesSet.add(task.category)
      }
    })
    return Array.from(categoriesSet).sort()
  })

  const taskStats = computed(() => {
    const total = tasks.value.length
    const completed = completedTasks.value.length
    const active = activeTasks.value.length
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      completed,
      active,
      completionRate: Math.round(completionRate)
    }
  })

  // Métodos
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateUniqueId(),
      createdAt: new Date()
    }

    tasks.value.unshift(newTask)
    showSuccess('Tarea creada', `"${newTask.name}" ha sido agregada a tu lista`)
    
    return newTask
  }

  // Método para crear tareas rápidas (solo con nombre)
  const addQuickTask = (name: string) => {
    if (!name.trim()) return null
    
    const newTask: Task = {
      id: generateUniqueId(),
      name: name.trim(),
      createdAt: new Date(),
      priority: 'medium',
      estimatedTime: 25
    }

    tasks.value.unshift(newTask)
    showSuccess('Tarea rápida creada', `"${newTask.name}" ha sido agregada`)
    
    return newTask
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index !== -1) {
      const oldTask = tasks.value[index]
      tasks.value[index] = { ...oldTask, ...updates }
      showInfo('Tarea actualizada', `"${tasks.value[index].name}" ha sido modificada`)
      return tasks.value[index]
    }
    return null
  }

  const deleteTask = (id: string) => {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index !== -1) {
      const taskName = tasks.value[index].name
      
      // Si la tarea está activa en el timer, detenerla
      if (timerStore.activeTask?.id === id) {
        timerStore.stopTimer()
      }
      
      tasks.value.splice(index, 1)
      showWarning('Tarea eliminada', `"${taskName}" ha sido eliminada`)
      return true
    }
    return false
  }

  const completeTask = (id: string) => {
    const task = tasks.value.find(t => t.id === id)
    if (task && !task.completedAt) {
      task.completedAt = new Date()
      
      // Si la tarea está activa en el timer, completarla
      if (timerStore.activeTask?.id === id) {
        timerStore.completeTask()
      }
      
      showSuccess('¡Tarea completada!', `"${task.name}" ha sido marcada como completada`)
      return true
    }
    return false
  }

  const uncompleteTask = (id: string) => {
    const task = tasks.value.find(t => t.id === id)
    if (task && task.completedAt) {
      task.completedAt = undefined
      showInfo('Tarea reactivada', `"${task.name}" ha sido reactivada`)
      return true
    }
    return false
  }

  const startTask = (id: string, mode: { minutes: number; name: string }) => {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      timerStore.startTask(task, mode)
      return true
    }
    return false
  }

  const reorderTasks = (newOrder: Task[]) => {
    tasks.value = newOrder
  }

  const setFilters = (newFilters: Partial<TaskFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      status: 'all'
    }
  }

  const getTaskById = (id: string) => {
    return tasks.value.find(task => task.id === id)
  }

  const getTasksByCategory = (category: string) => {
    return tasks.value.filter(task => task.category === category)
  }

  const getTasksByPriority = (priority: string) => {
    return tasks.value.filter(task => task.priority === priority)
  }

  // Persistencia
  const saveTasks = () => {
    if (process.client) {
      localStorage.setItem('tasks', JSON.stringify(tasks.value))
    }
  }

  const loadTasks = () => {
    if (process.client) {
      const saved = localStorage.getItem('tasks')
      if (saved) {
        try {
          const parsedTasks = JSON.parse(saved)
          // Convertir fechas de string a Date
          tasks.value = parsedTasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined
          }))
        } catch (error) {
          console.error('Error loading tasks:', error)
        }
      }
    }
  }

  return {
    // Estado
    tasks: readonly(tasks),
    filters: readonly(filters),
    
    // Computed
    filteredTasks,
    activeTasks,
    completedTasks,
    categories,
    taskStats,
    
    // Métodos
    addTask,
    addQuickTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    startTask,
    reorderTasks,
    setFilters,
    clearFilters,
    getTaskById,
    getTasksByCategory,
    getTasksByPriority,
    
    // Persistencia
    saveTasks,
    loadTasks
  }
} 