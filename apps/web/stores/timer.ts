/**
 * Store del timer flotante: sesión local, remota (work session API), resumen del día, storage cifrado.
 * Refactor largo: extraer `remote` / resumen a stores dedicados en un PR aparte.
 */
import { defineStore } from 'pinia'
import {
  DEFAULT_TIMER_PRESETS,
  timerPresetsDtoToTimerModes,
} from '@/composables/timer/timerPresets'
import type { TimerMode } from '@/types/task'
import { loadConfig } from '@/config/environment'
import { abandonWorkSession, patchWorkSession } from '@/services/workSessionsApi'
import {
  clearLastTrackedWorkSessionId,
  setLastTrackedWorkSessionId,
} from '@/utils/lastTrackedWorkSession'
import { needsWorkSessionFeedback } from '@/utils/workSessionFeedback'
import { secureSet, secureGet } from '@/utils/secureStorage'

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
      productivity: 0,
    },

    // Estado del timer
    timerInterval: null as NodeJS.Timeout | null,
    lastUpdateTime: 0,

    /** Bloque `WorkSession` en API (opcional) */
    remoteWorkSessionId: null as string | null,
    /** Heartbeat con jitter (~60s ±5s): usa `setTimeout` encadenado */
    remoteHeartbeatTimer: null as ReturnType<typeof setTimeout> | null,

    /** Presets mostrados en TaskItem / ajustes; sincronizados con GET /users/preferences. */
    timerModes: [...DEFAULT_TIMER_PRESETS] as TimerMode[],
  }),

  getters: {
    // Getters para el timer
    hasActiveTask: state => !!state.activeTask,
    isTimerVisible: state => state.showFloatingTimer && !!state.activeTask,

    // Getters para estadísticas del día
    getDailyProgress: state => {
      if (state.dailyStats.totalTasks === 0) return 0
      return Math.round(
        (state.dailyStats.completedTasks / state.dailyStats.totalTasks) * 100,
      )
    },

    getFormattedStudyTime: state => {
      const hours = Math.floor(state.dailyStats.totalStudyTime / 3600)
      const minutes = Math.floor((state.dailyStats.totalStudyTime % 3600) / 60)
      return `${hours}h ${minutes}m`
    },

    // Getters para el timer
    getProgressPercentage: state => {
      if (!state.activeTask?.totalTime) return 0
      return Math.round(
        ((state.activeTask.totalTime - state.activeTask.timeLeft) /
          state.activeTask.totalTime) *
          100,
      )
    },

    getElapsedTime: state => {
      if (!state.activeTask) return 0
      return state.activeTask.totalTime - state.activeTask.timeLeft
    },

    getFormattedTimeLeft: state => {
      if (!state.activeTask) return '00:00'
      const minutes = Math.floor(state.activeTask.timeLeft / 60)
      const seconds = state.activeTask.timeLeft % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },

    /** Etiqueta de estado del bloque actual (timer visible). */
    workBlockStatusLabel: state => {
      if (!state.activeTask) return ''
      if (state.isPaused) return 'Pausado'
      if (state.isRunning) return 'En marcha'
      return 'Detenido'
    },

    /** Vista corta del id de WorkSession remoto (sync API), o null. */
    remoteWorkSessionIdPreview: state => {
      const id = state.remoteWorkSessionId
      if (!id) return null
      return id.length > 12 ? `${id.slice(0, 8)}…` : id
    },
  },

  actions: {
    // Acciones para el timer flotante
    toggleFloatingTimer() {
      this.showFloatingTimer = !this.showFloatingTimer
      void this.savePreferences()
    },

    // Iniciar una nueva tarea
    startTask(
      task: { id: string; name: string; category?: string },
      mode: { minutes: number; name: string },
    ) {
      // Si ya hay una tarea activa, solo cambiar la tarea sin reiniciar el timer
      if (this.activeTask && this.activeTask.id !== task.id) {
        if (this.remoteWorkSessionId) {
          this.showNotification(
            'No se puede cambiar de tarea',
            'Finaliza o abandona el bloque remoto actual antes de cambiar de tarea.',
            'warning',
          )
          return
        }
        // Cambiar solo la información de la tarea, mantener el tiempo restante
        this.activeTask.id = task.id
        this.activeTask.name = task.name
        this.activeTask.category = task.category
        this.activeTask.type = mode.name

        // Mostrar notificación de cambio de tarea
        this.showNotification(
          'Tarea cambiada',
          `Ahora trabajando en: ${task.name}`,
          'info',
        )
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
          totalPausedTime: 0,
        }

        this.activeTask = newTask
        this.isPaused = false
        this.isRunning = true
        this.startTimerInterval()

        // Cargar día si no está cargado
        if (!this.currentDaySummary) {
          void this.loadDaySummary()
        }

        // Mostrar notificación
        this.showNotification('Tarea iniciada', `Comenzando: ${task.name}`, 'info')
      }
    },

    clearRemoteHeartbeat() {
      if (this.remoteHeartbeatTimer) {
        clearTimeout(this.remoteHeartbeatTimer)
        this.remoteHeartbeatTimer = null
      }
    },

    clearRemoteWorkSession() {
      this.clearRemoteHeartbeat()
      this.remoteWorkSessionId = null
      clearLastTrackedWorkSessionId()
    },

    bindRemoteWorkSession(sessionId: string) {
      this.clearRemoteHeartbeat()
      this.remoteWorkSessionId = sessionId
      setLastTrackedWorkSessionId(sessionId)
      void this.patchRemoteHeartbeat()
      const scheduleNext = () => {
        const ms = 55_000 + Math.floor(Math.random() * 10_000)
        this.remoteHeartbeatTimer = setTimeout(() => {
          if (!this.remoteWorkSessionId) return
          void this.patchRemoteHeartbeat().then(() => {
            if (this.remoteWorkSessionId) scheduleNext()
          })
        }, ms)
      }
      scheduleNext()
    },

    /**
     * Restaura el timer flotante desde `GET /work-sessions/active`.
     * No abre modales; el caller debe abrir reflexión si `state === pending_feedback`.
     */
    hydrateFromActiveRemoteSession(payload: {
      id: string
      state: 'running' | 'paused' | 'pending_feedback'
      startTime: string
      targetDurationSec: number
      pausedDurationSec: number
      task: { id: string; title: string }
      timerMode: string | null
    }) {
      if (this.activeTask) return

      const targetRaw = payload.targetDurationSec
      if (targetRaw === null || targetRaw === undefined || targetRaw < 1) return
      const target = targetRaw
      let modeLabel = 'Personalizado'
      if (payload.timerMode === 'pomodoro') modeLabel = 'Pomodoro'
      else if (payload.timerMode === 'ultradian') modeLabel = 'Ultradiano'

      const startMs = new Date(payload.startTime).getTime()
      const wallSec = Math.floor((Date.now() - startMs) / 1000)
      const pausedTotal = payload.pausedDurationSec ?? 0
      const worked = Math.max(0, wallSec - pausedTotal)
      const timeLeft = Math.max(0, target - worked)

      const needsFeedback = needsWorkSessionFeedback({
        state: payload.state,
        timeLeftSec: timeLeft,
      })

      if (needsFeedback) {
        this.activeTask = {
          id: payload.task.id,
          name: payload.task.title,
          timeLeft: 0,
          totalTime: target,
          type: modeLabel,
          startedAt: new Date(payload.startTime),
          totalPausedTime: pausedTotal,
        }
        this.isPaused = false
        this.isRunning = false
        this.remoteWorkSessionId = payload.id
        setLastTrackedWorkSessionId(payload.id)
        this.clearRemoteHeartbeat()
        return
      }

      this.activeTask = {
        id: payload.task.id,
        name: payload.task.title,
        timeLeft,
        totalTime: target,
        type: modeLabel,
        startedAt: new Date(payload.startTime),
        totalPausedTime: pausedTotal,
      }
      this.isPaused = payload.state === 'paused'
      this.isRunning = payload.state === 'running'

      if (!this.currentDaySummary) {
        void this.loadDaySummary()
      }

      if (this.isRunning && timeLeft > 0) {
        this.startTimerInterval()
      }

      this.bindRemoteWorkSession(payload.id)
    },

    async patchRemoteHeartbeat() {
      if (!this.remoteWorkSessionId) return
      const { loadConfig } = await import('@/config/environment')
      const cfg = loadConfig()
      try {
        await $fetch(`${cfg.api.baseUrl}/work-sessions/${this.remoteWorkSessionId}`, {
          method: 'PATCH',
          credentials: 'include',
          body: {
            lastClientSeenAt: new Date().toISOString(),
            state: this.isPaused ? 'paused' : 'running',
            pausedDurationSec: this.activeTask?.totalPausedTime ?? 0,
          },
        })
      } catch {
        /* red inestable: no bloquear UI */
      }
    },

    // Detener timer actual
    stopTimer() {
      if (this.activeTask) {
        this.stopTimerInterval()
        this.activeTask = null
        this.isPaused = false
        this.isRunning = false
        this.clearRemoteWorkSession()
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
        this.showNotification(
          'Timer pausado',
          `${this.activeTask.name} está en pausa`,
          'warning',
        )
      }
    },

    // Reanudar timer
    resumeTimer() {
      if (this.activeTask && this.isPaused) {
        this.isPaused = false
        this.isRunning = true

        // Calcular tiempo pausado
        if (this.activeTask.pausedAt) {
          const pausedDuration = Math.floor(
            (Date.now() - this.activeTask.pausedAt.getTime()) / 1000,
          )
          this.activeTask.totalPausedTime += pausedDuration
          this.activeTask.pausedAt = undefined
        }

        this.startTimerInterval()

        // Mostrar notificación
        this.showNotification(
          'Timer reanudado',
          `Continuando: ${this.activeTask.name}`,
          'info',
        )
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
        this.showNotification(
          'Timer reiniciado',
          `${this.activeTask.name} se ha reiniciado`,
          'info',
        )
      }
    },

    // Cerrar timer
    closeTimer() {
      this.stopTimerInterval()
      this.activeTask = null
      this.isPaused = false
      this.isRunning = false
      this.clearRemoteWorkSession()
    },

    /** Fin de cuenta atrás: reflexión remota o cierre local. */
    onTimerNaturalFinished() {
      this.stopTimerInterval()
      this.isRunning = false
      // Cancel pending heartbeat synchronously to avoid a race where the
      // scheduled tick fires during the pending_feedback PATCH window
      // and overwrites the state back to running/paused on the server.
      this.clearRemoteHeartbeat()
      if (this.remoteWorkSessionId) {
        void (async () => {
          const cfg = loadConfig()
          const sid = this.remoteWorkSessionId
          try {
            await patchWorkSession(sid!, {
              lastClientSeenAt: new Date().toISOString(),
              state: 'pending_feedback',
              pausedDurationSec: this.activeTask?.totalPausedTime ?? 0,
            })
          } catch {
            /* continuar para mostrar modal */
          }
          if (process.client && sid) {
            if (cfg.timer?.reflectionModalRequired === false) {
              try {
                await abandonWorkSession(sid)
              } catch {
                /* sin bloqueo UI */
              }
              this.closeTimer()
              return
            }
            const { useSessionGateStore } = await import('@/stores/sessionGate')
            useSessionGateStore().openFeedback(sid)
          }
        })()
        return
      }
      this.completeTask()
    },

    // Completar tarea actual (local / sin bloque remoto)
    completeTask() {
      if (this.activeTask) {
        const timeSpent = this.activeTask.totalTime - this.activeTask.timeLeft

        this.addTaskToDay({
          id: this.activeTask.id,
          name: this.activeTask.name,
          type: this.activeTask.type,
          timeSpent,
          completed: true,
          category: this.activeTask.category,
        })

        this.showNotification(
          '¡Tarea completada!',
          `${this.activeTask.name} ha sido completada exitosamente`,
          'success',
        )

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
            if (this.activeTask.timeLeft === 300) {
              // 5 minutos
              this.showNotification(
                'Tiempo crítico',
                `Quedan 5 minutos para completar: ${this.activeTask.name}`,
                'warning',
              )
            } else if (this.activeTask.timeLeft === 60) {
              // 1 minuto
              this.showNotification(
                '¡Último minuto!',
                `Queda 1 minuto para completar: ${this.activeTask.name}`,
                'error',
              )
            }
          } else {
            this.onTimerNaturalFinished()
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
    showNotification(
      title: string,
      message: string,
      type: 'success' | 'info' | 'warning' | 'error' = 'info',
    ) {
      if (process.client) {
        // Emitir evento para mostrar notificación
        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: { title, message, type },
          }),
        )
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
        tasks: [],
      }
      this.resetDailyStats()
      void this.saveDaySummary()
    },

    endDay() {
      if (this.currentDaySummary) {
        this.currentDaySummary.totalStudyTime = this.dailyStats.totalStudyTime
        this.currentDaySummary.completedTasks = this.dailyStats.completedTasks
        this.currentDaySummary.totalTasks = this.dailyStats.totalTasks
        this.currentDaySummary.productivity = this.dailyStats.productivity
        void this.saveDaySummary()

        // Mostrar resumen del día
        this.showDaySummary()
      }
    },

    addTaskToDay(task: {
      id: string
      name: string
      type: string
      timeSpent: number
      completed: boolean
      category?: string
    }) {
      if (this.currentDaySummary) {
        this.currentDaySummary.tasks.push(task)
        this.dailyStats.totalTasks++
        if (task.completed) {
          this.dailyStats.completedTasks++
        }
        this.dailyStats.totalStudyTime += task.timeSpent
        this.updateProductivity()
        void this.saveDaySummary()
      }
    },

    updateProductivity() {
      if (this.dailyStats.totalTasks > 0) {
        const completionRate =
          this.dailyStats.completedTasks / this.dailyStats.totalTasks
        const timeEfficiency = Math.min(this.dailyStats.totalStudyTime / (8 * 3600), 1) // 8 horas como referencia
        this.dailyStats.productivity = Math.round(
          (completionRate * 0.7 + timeEfficiency * 0.3) * 100,
        )
      }
    },

    resetDailyStats() {
      this.dailyStats = {
        totalStudyTime: 0,
        completedTasks: 0,
        totalTasks: 0,
        productivity: 0,
      }
    },

    // Persistencia de datos usando SecureStorage
    async savePreferences() {
      if (process.client) {
        await secureSet(
          'timer-preferences',
          {
            showFloatingTimer: this.showFloatingTimer,
          },
          { encryption: true, ttl: 30 * 24 * 60 * 60 * 1000 },
        ) // 30 days
      }
    },

    async loadPreferences() {
      if (process.client) {
        const saved = await secureGet('timer-preferences')
        if (saved) {
          this.showFloatingTimer = saved.showFloatingTimer ?? true
        }
      }
    },

    /** Carga `timerPresets` desde el backend (spec §5.4). Sin auth o error → defaults locales. */
    async syncTimerPresetsFromApi() {
      if (!import.meta.client) return
      try {
        const { useThemeApi } = await import('@/composables/shared/useThemeApi')
        const { getUserPreferences } = useThemeApi()
        const res = await getUserPreferences()
        const tp = res?.preferences?.timerPresets as
          | {
              presets?: Array<{
                key: string
                workSec: number
                breakSec: number
                label?: string
              }>
            }
          | undefined
        if (tp?.presets && tp.presets.length > 0) {
          this.timerModes = timerPresetsDtoToTimerModes({ presets: tp.presets })
        } else {
          this.timerModes = [...DEFAULT_TIMER_PRESETS]
        }
      } catch {
        this.timerModes = [...DEFAULT_TIMER_PRESETS]
      }
    },

    async saveDaySummary() {
      if (process.client && this.currentDaySummary) {
        const key = `day-summary-${this.currentDaySummary.date}`
        await secureSet(key, this.currentDaySummary, {
          encryption: true,
          ttl: 365 * 24 * 60 * 60 * 1000, // 1 year
        })
      }
    },

    async loadDaySummary(date?: string) {
      if (process.client) {
        const targetDate = date ?? new Date().toISOString().split('T')[0]
        const key = `day-summary-${targetDate}`
        const saved = await secureGet(key)
        if (saved) {
          this.currentDaySummary = saved
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
          window.dispatchEvent(
            new CustomEvent('show-day-summary', {
              detail: this.currentDaySummary,
            }),
          )
        }
      }
    },

    // Cleanup al desmontar
    cleanup() {
      this.stopTimerInterval()
    },
  },
})
