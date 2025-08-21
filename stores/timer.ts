import { defineStore } from 'pinia'

interface TimerTask {
  id: string
  name: string
  timeLeft: number
  totalTime: number
  type: string
  category?: string
  startedAt?: Date
  pausedAt?: Date
  totalPausedTime: number
}

interface DaySummary {
  date: string
  totalStudyTime: number
  completedTasks: number
  totalTasks: number
  productivity: number
  tasks: Array<{
    id: string
    name: string
    completed: boolean
    timeSpent: number
    type: string
    category?: string
  }>
}

export const useTimerStore = defineStore('timer', {
  state: () => ({
    // Estado del timer flotante
    showFloatingTimer: true,
    activeTask: null as TimerTask | null,
    isPaused: false,
    isRunning: false,
    
    // Estado del día
    currentDaySummary: null as DaySummary | null,
    dailyStats: {
      totalStudyTime: 0,
      completedTasks: 0,
      totalTasks: 0,
      productivity: 0
    },
    
    // Estado del timer
    timerInterval: null as NodeJS.Timeout | null,
    lastUpdateTime: 0
  }),

  getters: {
    // Getters para el timer
    hasActiveTask: (state) => !!state.activeTask,
    isTimerVisible: (state) => state.showFloatingTimer && !!state.activeTask,
    
    // Getters para estadísticas del día
    getDailyProgress: (state) => {
      if (state.dailyStats.totalTasks === 0) return 0
      return Math.round((state.dailyStats.completedTasks / state.dailyStats.totalTasks) * 100)
    },
    
    getFormattedStudyTime: (state) => {
      const hours = Math.floor(state.dailyStats.totalStudyTime / 3600)
      const minutes = Math.floor((state.dailyStats.totalStudyTime % 3600) / 60)
      return `${hours}h ${minutes}m`
    },
    
    // Getters para el timer
    getProgressPercentage: (state) => {
      if (!state.activeTask || !state.activeTask.totalTime) return 0
      return Math.round(((state.activeTask.totalTime - state.activeTask.timeLeft) / state.activeTask.totalTime) * 100)
    },
    
    getElapsedTime: (state) => {
      if (!state.activeTask) return 0
      return state.activeTask.totalTime - state.activeTask.timeLeft
    },
    
    getFormattedTimeLeft: (state) => {
      if (!state.activeTask) return '00:00'
      const minutes = Math.floor(state.activeTask.timeLeft / 60)
      const seconds = state.activeTask.timeLeft % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  },

  actions: {
    // Acciones para el timer flotante
    toggleFloatingTimer() {
      this.showFloatingTimer = !this.showFloatingTimer
      this.savePreferences()
    },

    // Iniciar una nueva tarea
    startTask(task: { id: string; name: string; category?: string }, mode: { minutes: number; name: string }) {
      // Si ya hay una tarea activa, solo cambiar la tarea sin reiniciar el timer
      if (this.activeTask && this.activeTask.id !== task.id) {
        // Cambiar solo la información de la tarea, mantener el tiempo restante
        this.activeTask.id = task.id
        this.activeTask.name = task.name
        this.activeTask.category = task.category
        this.activeTask.type = mode.name
        
        // Mostrar notificación de cambio de tarea
        this.showNotification('Tarea cambiada', `Ahora trabajando en: ${task.name}`, 'info')
        return
      }
      
      // Si no hay tarea activa o es la misma tarea, iniciar normalmente
      if (!this.activeTask) {
        const totalTime = mode.minutes * 60
        const newTask: TimerTask = {
          id: task.id,
          name: task.name,
          timeLeft: totalTime,
          totalTime,
          type: mode.name,
          category: task.category,
          startedAt: new Date(),
          totalPausedTime: 0
        }
        
        this.activeTask = newTask
        this.isPaused = false
        this.isRunning = true
        this.startTimerInterval()
        
        // Cargar día si no está cargado
        if (!this.currentDaySummary) {
          this.loadDaySummary()
        }
        
        // Mostrar notificación
        this.showNotification('Tarea iniciada', `Comenzando: ${task.name}`, 'info')
      }
    },

    // Detener timer actual
    stopTimer() {
      if (this.activeTask) {
        this.stopTimerInterval()
        this.activeTask = null
        this.isPaused = false
        this.isRunning = false
      }
    },

    // Pausar timer
    pauseTimer() {
      if (this.activeTask && this.isRunning) {
        this.isPaused = true
        this.isRunning = false
        this.activeTask.pausedAt = new Date()
        this.stopTimerInterval()
        
        // Mostrar notificación
        this.showNotification('Timer pausado', `${this.activeTask.name} está en pausa`, 'warning')
      }
    },

    // Reanudar timer
    resumeTimer() {
      if (this.activeTask && this.isPaused) {
        this.isPaused = false
        this.isRunning = true
        
        // Calcular tiempo pausado
        if (this.activeTask.pausedAt) {
          const pausedDuration = Math.floor((Date.now() - this.activeTask.pausedAt.getTime()) / 1000)
          this.activeTask.totalPausedTime += pausedDuration
          this.activeTask.pausedAt = undefined
        }
        
        this.startTimerInterval()
        
        // Mostrar notificación
        this.showNotification('Timer reanudado', `Continuando: ${this.activeTask.name}`, 'info')
      }
    },

    // Reiniciar timer
    resetTimer() {
      if (this.activeTask) {
        this.activeTask.timeLeft = this.activeTask.totalTime
        this.activeTask.startedAt = new Date()
        this.activeTask.pausedAt = undefined
        this.activeTask.totalPausedTime = 0
        this.isPaused = false
        this.isRunning = true
        
        if (this.timerInterval) {
          this.stopTimerInterval()
        }
        this.startTimerInterval()
        
        // Mostrar notificación
        this.showNotification('Timer reiniciado', `${this.activeTask.name} se ha reiniciado`, 'info')
      }
    },

    // Cerrar timer
    closeTimer() {
      this.stopTimerInterval()
      this.activeTask = null
      this.isPaused = false
      this.isRunning = false
    },

    // Completar tarea actual
    completeTask() {
      if (this.activeTask) {
        const timeSpent = this.activeTask.totalTime - this.activeTask.timeLeft
        
        // Agregar tarea completada al día
        this.addTaskToDay({
          id: this.activeTask.id,
          name: this.activeTask.name,
          type: this.activeTask.type,
          timeSpent,
          completed: true,
          category: this.activeTask.category
        })
        
        // Mostrar notificación de éxito
        this.showNotification('¡Tarea completada!', `${this.activeTask.name} ha sido completada exitosamente`, 'success')
        
        this.closeTimer()
      }
    },

    // Iniciar intervalo del timer
    startTimerInterval() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
      }
      
      this.lastUpdateTime = Date.now()
      this.timerInterval = setInterval(() => {
        if (this.activeTask && this.isRunning && !this.isPaused) {
          if (this.activeTask.timeLeft > 0) {
            this.activeTask.timeLeft--
            
            // Notificaciones de tiempo crítico
            if (this.activeTask.timeLeft === 300) { // 5 minutos
              this.showNotification('Tiempo crítico', `Quedan 5 minutos para completar: ${this.activeTask.name}`, 'warning')
            } else if (this.activeTask.timeLeft === 60) { // 1 minuto
              this.showNotification('¡Último minuto!', `Queda 1 minuto para completar: ${this.activeTask.name}`, 'error')
            }
          } else {
            // Timer completado
            this.completeTask()
          }
        }
      }, 1000)
    },

    // Detener intervalo del timer
    stopTimerInterval() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    // Actualizar tiempo del timer (para sincronización)
    updateTimerTime(timeLeft: number) {
      if (this.activeTask) {
        this.activeTask.timeLeft = Math.max(0, timeLeft)
      }
    },

    // Mostrar notificación (método helper)
    showNotification(title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') {
      if (process.client) {
        // Emitir evento para mostrar notificación
        window.dispatchEvent(new CustomEvent('show-notification', {
          detail: { title, message, type }
        }))
      }
    },

    // Acciones para el resumen del día
    startDay() {
      const today = new Date().toISOString().split('T')[0]
      this.currentDaySummary = {
        date: today,
        totalStudyTime: 0,
        completedTasks: 0,
        totalTasks: 0,
        productivity: 0,
        tasks: []
      }
      this.resetDailyStats()
      this.saveDaySummary()
    },

    endDay() {
      if (this.currentDaySummary) {
        this.currentDaySummary.totalStudyTime = this.dailyStats.totalStudyTime
        this.currentDaySummary.completedTasks = this.dailyStats.completedTasks
        this.currentDaySummary.totalTasks = this.dailyStats.totalTasks
        this.currentDaySummary.productivity = this.dailyStats.productivity
        this.saveDaySummary()
        
        // Mostrar resumen del día
        this.showDaySummary()
      }
    },

    addTaskToDay(task: { id: string; name: string; type: string; timeSpent: number; completed: boolean; category?: string }) {
      if (this.currentDaySummary) {
        this.currentDaySummary.tasks.push(task)
        this.dailyStats.totalTasks++
        if (task.completed) {
          this.dailyStats.completedTasks++
        }
        this.dailyStats.totalStudyTime += task.timeSpent
        this.updateProductivity()
        this.saveDaySummary()
      }
    },

    updateProductivity() {
      if (this.dailyStats.totalTasks > 0) {
        const completionRate = this.dailyStats.completedTasks / this.dailyStats.totalTasks
        const timeEfficiency = Math.min(this.dailyStats.totalStudyTime / (8 * 3600), 1) // 8 horas como referencia
        this.dailyStats.productivity = Math.round((completionRate * 0.7 + timeEfficiency * 0.3) * 100)
      }
    },

    resetDailyStats() {
      this.dailyStats = {
        totalStudyTime: 0,
        completedTasks: 0,
        totalTasks: 0,
        productivity: 0
      }
    },

    // Persistencia de datos
    savePreferences() {
      if (process.client) {
        localStorage.setItem('timer-preferences', JSON.stringify({
          showFloatingTimer: this.showFloatingTimer
        }))
      }
    },

    loadPreferences() {
      if (process.client) {
        const saved = localStorage.getItem('timer-preferences')
        if (saved) {
          const preferences = JSON.parse(saved)
          this.showFloatingTimer = preferences.showFloatingTimer ?? true
        }
      }
    },

    saveDaySummary() {
      if (process.client && this.currentDaySummary) {
        const key = `day-summary-${this.currentDaySummary.date}`
        localStorage.setItem(key, JSON.stringify(this.currentDaySummary))
      }
    },

    loadDaySummary(date?: string) {
      if (process.client) {
        const targetDate = date || new Date().toISOString().split('T')[0]
        const key = `day-summary-${targetDate}`
        const saved = localStorage.getItem(key)
        if (saved) {
          this.currentDaySummary = JSON.parse(saved)
          if (this.currentDaySummary) {
            this.dailyStats.totalStudyTime = this.currentDaySummary.totalStudyTime
            this.dailyStats.completedTasks = this.currentDaySummary.completedTasks
            this.dailyStats.totalTasks = this.currentDaySummary.totalTasks
            this.dailyStats.productivity = this.currentDaySummary.productivity
          }
        } else {
          this.startDay()
        }
      }
    },

    // Mostrar resumen del día
    showDaySummary() {
      if (this.currentDaySummary) {
        // Emitir evento para mostrar el modal
        if (process.client) {
          // Usar un evento personalizado para mostrar el modal
          window.dispatchEvent(new CustomEvent('show-day-summary', {
            detail: this.currentDaySummary
          }))
        }
      }
    },

    // Cleanup al desmontar
    cleanup() {
      this.stopTimerInterval()
    }
  }
}) 