/**
 * Store del timer flotante: sesión local, remota (work session API), resumen del día, storage cifrado.
 * Refactor largo: extraer `remote` / resumen a stores dedicados en un PR aparte.
 */
import { defineStore } from 'pinia'
import {
  DEFAULT_TIMER_PRESETS,
  mapPresetKeyToTimerMode,
  timerPresetsDtoToTimerModes,
} from '@/composables/timer/timerPresets'
import type { TimerMode } from '@/types/task'
import { loadConfig } from '@/config/environment'
import { abandonWorkSession, patchWorkSession } from '@/services/workSessionsApi'
import {
  breakRemainingSec,
  effectivePausedSec,
  focusRemainingSec,
} from '@/composables/timer/timerClock'
import {
  clearLastTrackedWorkSessionId,
  setLastTrackedWorkSessionId,
} from '@/utils/lastTrackedWorkSession'
import { needsWorkSessionFeedback } from '@/utils/workSessionFeedback'
import { parseFetchError } from '@/utils/parseFetchError'
import { secureSet, secureGet } from '@/utils/secureStorage'
import { useNotify } from '@/composables/shared/useNotify'
import { useSessionGateStore } from '@/stores/sessionGate'

interface TimerTask {
  id: string
  name: string
  timeLeft: number
  totalTime: number
  type: string
  presetKey?: string
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

function resolveHydratedPresetKey(
  presetKey: string | undefined,
  timerMode: string | null,
  targetDurationSec: number,
  timerModes: TimerMode[],
): string | undefined {
  if (presetKey) return presetKey
  const durationMatches = timerModes.filter(mode => mode.time === targetDurationSec)
  if (durationMatches.length === 1) return durationMatches[0]?.presetKey
  return durationMatches.find(
    mode =>
      mode.presetKey &&
      mapPresetKeyToTimerMode(mode.presetKey) === (timerMode ?? 'custom'),
  )?.presetKey
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
    /** Fallos transitorios de heartbeat consecutivos antes de desvincular */
    remoteHeartbeatFailures: 0,

    /** Fase actual del ciclo foco → descanso → reflexión. */
    phase: 'focus' as 'focus' | 'break',
    /** Segundos configurados para el descanso del preset; `null` si no aplica. */
    breakDurationSec: null as number | null,
    /** Instante en que la sesión entró en descanso (local o remoto). */
    breakStartedAt: null as Date | null,
    /** Pausas acumuladas durante el descanso (segundos). */
    breakPausedDurationSec: 0,

    /** Presets mostrados en TaskItem / ajustes; sincronizados con GET /users/preferences. */
    timerModes: [...DEFAULT_TIMER_PRESETS] as TimerMode[],

    /** Modal de descanso visible (UI); el descanso sigue en FloatingTimer al cerrar. */
    breakModalOpen: false,
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
      if (state.phase === 'break') return 'Descanso'
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
      mode: {
        minutes: number
        name: string
        breakSec?: number
        presetKey?: string
      },
    ) {
      // Si ya hay una tarea activa, solo cambiar la tarea sin reiniciar el timer.
      // El caller (useTaskTimer) ya cerró el bloque remoto previo antes de llegar
      // aquí, así que no bloqueamos por `remoteWorkSessionId`.
      if (this.activeTask && this.activeTask.id !== task.id) {
        // Cambiar solo la información de la tarea, mantener el tiempo restante
        this.activeTask.id = task.id
        this.activeTask.name = task.name
        this.activeTask.category = task.category
        this.activeTask.type = mode.name
        this.activeTask.presetKey = mode.presetKey
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
          presetKey: mode.presetKey,
          category: task.category,
          startedAt: new Date(),
          totalPausedTime: 0,
        }

        this.activeTask = newTask
        this.phase = 'focus'
        this.breakDurationSec = mode.breakSec ?? null
        this.breakStartedAt = null
        this.breakPausedDurationSec = 0
        this.breakModalOpen = false
        this.isPaused = false
        this.isRunning = true
        this.startTimerInterval()

        // Cargar día si no está cargado
        if (!this.currentDaySummary) {
          void this.loadDaySummary()
        }
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
      this.remoteHeartbeatFailures = 0
      clearLastTrackedWorkSessionId()
      const gate = useSessionGateStore()
      if (gate.taskSwitchPrompt) gate.closeTaskSwitchPrompt()
    },

    bindRemoteWorkSession(sessionId: string) {
      this.clearRemoteHeartbeat()
      this.remoteWorkSessionId = sessionId
      this.remoteHeartbeatFailures = 0
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

    computeFocusRemaining(nowMs: number): number {
      if (!this.activeTask) return 0
      return focusRemainingSec({
        targetDurationSec: this.activeTask.totalTime,
        startMs: this.activeTask.startedAt?.getTime() ?? nowMs,
        pausedAccumulatedSec: this.activeTask.totalPausedTime,
        pausedAt: this.activeTask.pausedAt,
        nowMs,
      })
    },

    computeBreakRemaining(nowMs: number): number {
      if (!this.activeTask || this.breakDurationSec == null || !this.breakStartedAt)
        return 0
      return breakRemainingSec({
        breakDurationSec: this.breakDurationSec,
        breakStartedMs: this.breakStartedAt.getTime(),
        breakPausedAccumulatedSec: this.breakPausedDurationSec,
        pausedAt: this.activeTask.pausedAt,
        nowMs,
      })
    },

    effectiveFocusPausedSec(nowMs: number): number {
      return effectivePausedSec(
        this.activeTask?.totalPausedTime ?? 0,
        this.activeTask?.pausedAt,
        nowMs,
      )
    },

    effectiveBreakPausedSec(nowMs: number): number {
      return effectivePausedSec(
        this.breakPausedDurationSec,
        this.activeTask?.pausedAt,
        nowMs,
      )
    },

    /**
     * Restaura el timer flotante desde `GET /work-sessions/active`.
     * Reflexión sigue siendo responsabilidad del caller si `state === pending_feedback`.
     * El flag `breakModalOpen` puede abrirse en hidratación `on_break`.
     */
    hydrateFromActiveRemoteSession(payload: {
      id: string
      state: 'running' | 'paused' | 'on_break' | 'pending_feedback'
      startTime: string
      targetDurationSec: number
      pausedDurationSec: number
      breakDurationSec?: number | null
      breakStartedAt?: string | null
      breakPausedDurationSec?: number | null
      task: { id: string; title: string }
      timerMode: string | null
      presetKey?: string
    }) {
      if (this.activeTask) return

      const targetRaw = payload.targetDurationSec
      if (targetRaw === null || targetRaw === undefined || targetRaw < 1) return
      const target = targetRaw
      let modeLabel = 'Personalizado'
      if (payload.timerMode === 'pomodoro') modeLabel = 'Pomodoro'
      else if (payload.timerMode === 'ultradian') modeLabel = 'Ultradiano'

      const nowMs = Date.now()
      const isBreak = payload.state === 'on_break'
      const breakDuration = payload.breakDurationSec ?? null
      const breakStartedAt = payload.breakStartedAt
        ? new Date(payload.breakStartedAt)
        : null

      let timeLeft = 0
      const pausedTotal = payload.pausedDurationSec ?? 0
      if (isBreak && breakDuration != null && breakStartedAt) {
        timeLeft = breakRemainingSec({
          breakDurationSec: breakDuration,
          breakStartedMs: breakStartedAt.getTime(),
          breakPausedAccumulatedSec: payload.breakPausedDurationSec ?? 0,
          nowMs,
        })
      } else {
        timeLeft = focusRemainingSec({
          targetDurationSec: target,
          startMs: new Date(payload.startTime).getTime(),
          pausedAccumulatedSec: pausedTotal,
          nowMs,
        })
      }
      const presetKey = resolveHydratedPresetKey(
        payload.presetKey,
        payload.timerMode,
        target,
        this.timerModes,
      )

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
          presetKey,
          startedAt: new Date(payload.startTime),
          totalPausedTime: pausedTotal,
        }
        this.phase = isBreak ? 'break' : 'focus'
        this.breakDurationSec = breakDuration
        this.breakStartedAt = breakStartedAt
        this.breakPausedDurationSec = payload.breakPausedDurationSec ?? 0
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
        totalTime: isBreak && breakDuration != null ? breakDuration : target,
        type: modeLabel,
        presetKey,
        startedAt: new Date(payload.startTime),
        totalPausedTime: pausedTotal,
      }
      this.phase = isBreak ? 'break' : 'focus'
      this.breakDurationSec = breakDuration
      this.breakStartedAt = breakStartedAt
      this.breakPausedDurationSec = payload.breakPausedDurationSec ?? 0
      this.isPaused = payload.state === 'paused'
      this.isRunning = payload.state === 'running' || isBreak

      if (!this.currentDaySummary) {
        void this.loadDaySummary()
      }

      if (this.isRunning && timeLeft > 0) {
        this.startTimerInterval()
      }

      if (isBreak && this.isRunning && timeLeft > 0) {
        this.breakModalOpen = true
      }

      this.bindRemoteWorkSession(payload.id)
    },

    async patchRemoteHeartbeat() {
      if (!this.remoteWorkSessionId) return
      const nowMs = Date.now()
      const isBreak = this.phase === 'break'
      const body: {
        lastClientSeenAt: string
        state: 'running' | 'paused' | 'on_break' | 'pending_feedback'
        pausedDurationSec: number
        breakPausedDurationSec?: number
      } = {
        lastClientSeenAt: new Date().toISOString(),
        state: isBreak ? 'on_break' : this.isPaused ? 'paused' : 'running',
        pausedDurationSec: this.effectiveFocusPausedSec(nowMs),
      }
      if (isBreak) {
        body.breakPausedDurationSec = this.effectiveBreakPausedSec(nowMs)
      }
      try {
        await patchWorkSession(this.remoteWorkSessionId, body)
        this.remoteHeartbeatFailures = 0
      } catch (e: unknown) {
        const { status } = parseFetchError(e)
        // Sesión inexistente / terminal / conflicto: dejar de hacer heartbeat
        if (status === 404 || status === 410 || status === 409) {
          this.clearRemoteWorkSession()
          this.showNotification(
            'Sesión remota finalizada',
            'El bloque en el servidor ya no está activo. El timer local sigue.',
            'warning',
          )
          return
        }
        this.remoteHeartbeatFailures += 1
        if (this.remoteHeartbeatFailures >= 3) {
          this.clearRemoteWorkSession()
          this.showNotification(
            'Sin conexión con el bloque',
            'Se dejó de sincronizar el heartbeat tras varios fallos.',
            'warning',
          )
        }
      }
    },

    // Detener timer actual — abandona el WorkSession remoto si hay uno.
    // Local UI always stops; on abandon failure we keep remoteWorkSessionId
    // so conflict/retry flows can still resolve the server block.
    async stopTimer() {
      if (!this.activeTask) return
      this.stopTimerInterval()
      const sid = this.remoteWorkSessionId
      this.activeTask = null
      this.isPaused = false
      this.isRunning = false
      this.clearRemoteHeartbeat()

      if (!sid) {
        this.clearRemoteWorkSession()
        this.resetBreakState()
        return
      }

      try {
        await abandonWorkSession(sid)
        this.clearRemoteWorkSession()
        this.resetBreakState()
      } catch {
        this.remoteWorkSessionId = sid
        setLastTrackedWorkSessionId(sid)
        this.showNotification(
          'No se pudo abandonar el bloque',
          'El timer se detuvo aquí, pero el bloque remoto sigue activo. Reintenta o resuélvelo al iniciar otra tarea.',
          'error',
        )
        throw new Error('WORK_SESSION_ABANDON_FAILED')
      }
    },

    resetBreakState() {
      this.phase = 'focus'
      this.breakDurationSec = null
      this.breakStartedAt = null
      this.breakPausedDurationSec = 0
      this.breakModalOpen = false
    },

    openBreakModal() {
      if (this.phase !== 'break' || !this.activeTask) return
      this.breakModalOpen = true
    },

    dismissBreakModal() {
      this.breakModalOpen = false
    },

    // Pausar timer
    pauseTimer() {
      if (this.activeTask && this.isRunning) {
        this.isPaused = true
        this.isRunning = false
        this.activeTask.pausedAt = new Date()
        this.stopTimerInterval()
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
          if (this.phase === 'break') {
            this.breakPausedDurationSec += pausedDuration
          } else {
            this.activeTask.totalPausedTime += pausedDuration
          }
          this.activeTask.pausedAt = undefined
        }

        this.startTimerInterval()
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
      }
    },

    // Cerrar timer
    closeTimer() {
      this.stopTimerInterval()
      this.activeTask = null
      this.phase = 'focus'
      this.breakDurationSec = null
      this.breakStartedAt = null
      this.breakPausedDurationSec = 0
      this.breakModalOpen = false
      this.isPaused = false
      this.isRunning = false
      this.clearRemoteWorkSession()
    },

    /** Entra en la fase de descanso sincronizada con el servidor. */
    enterBreakPhase(breakDurationSec: number) {
      if (!this.activeTask) return
      this.phase = 'break'
      this.breakDurationSec = breakDurationSec
      this.breakStartedAt = new Date()
      this.breakPausedDurationSec = 0
      this.activeTask.pausedAt = undefined
      this.activeTask.totalTime = breakDurationSec
      this.activeTask.timeLeft = breakDurationSec
      this.isPaused = false
      this.isRunning = true
      this.breakModalOpen = true
      const minutes = Math.round(breakDurationSec / 60)
      this.showNotification('Descanso', `${minutes} min de descanso`, 'info')
      this.startTimerInterval()
    },

    /** Salta el descanso y pasa directamente a la reflexión. */
    async skipBreak() {
      await this.finishBreak()
    },

    /**
     * Finaliza el descanso (natural o por skip) y abre reflexión si hay
     * sesión remota; en local cierra el bloque como completado.
     */
    async finishBreak() {
      this.stopTimerInterval()
      this.breakModalOpen = false
      this.isRunning = false
      if (this.remoteWorkSessionId) {
        const sid = this.remoteWorkSessionId
        try {
          await patchWorkSession(sid, {
            lastClientSeenAt: new Date().toISOString(),
            state: 'pending_feedback',
            pausedDurationSec: this.activeTask?.totalPausedTime ?? 0,
          })
        } catch (e: unknown) {
          const { status } = parseFetchError(e)
          if (status === 404 || status === 410 || status === 409) {
            this.clearRemoteWorkSession()
          }
          this.showNotification(
            'No se pudo finalizar el descanso',
            'Reintenta o cierra el timer.',
            'error',
          )
          throw new Error('WORK_SESSION_FINISH_BREAK_FAILED')
        }
        if (process.client) {
          const cfg = loadConfig()
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
        return
      }
      this.completeTask()
    },

    /** Fin de cuenta atrás del foco: descanso o reflexión/cierre. */
    onTimerNaturalFinished() {
      this.stopTimerInterval()
      this.isRunning = false
      // Cancel pending heartbeat synchronously to avoid a race where the
      // scheduled tick fires during the transition PATCH window
      // and overwrites the state back to running/paused on the server.
      this.clearRemoteHeartbeat()

      const hasBreak = (this.breakDurationSec ?? 0) > 0

      if (this.remoteWorkSessionId) {
        const sid = this.remoteWorkSessionId
        if (hasBreak) {
          void (async () => {
            try {
              await patchWorkSession(sid, {
                lastClientSeenAt: new Date().toISOString(),
                state: 'on_break',
                pausedDurationSec: this.activeTask?.totalPausedTime ?? 0,
              })
              this.enterBreakPhase(this.breakDurationSec!)
              this.bindRemoteWorkSession(sid)
            } catch (e: unknown) {
              const { status } = parseFetchError(e)
              if (status === 404 || status === 410 || status === 409) {
                this.clearRemoteWorkSession()
              }
              this.showNotification(
                'No se pudo iniciar el descanso',
                'El bloque remoto no cambió de fase; no abras la reflexión todavía.',
                'error',
              )
            }
          })()
          return
        }
        void (async () => {
          try {
            await patchWorkSession(sid, {
              lastClientSeenAt: new Date().toISOString(),
              state: 'pending_feedback',
              pausedDurationSec: this.activeTask?.totalPausedTime ?? 0,
            })
          } catch (e: unknown) {
            const { status } = parseFetchError(e)
            if (status === 404 || status === 410 || status === 409) {
              this.clearRemoteWorkSession()
            }
            this.showNotification(
              'No se pudo abrir la reflexión',
              'El bloque remoto puede estar desfasado; reintenta o ciérralo.',
              'warning',
            )
          }
          if (process.client && sid) {
            const cfg = loadConfig()
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

      if (hasBreak) {
        this.enterBreakPhase(this.breakDurationSec!)
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
        if (!this.activeTask || !this.isRunning || this.isPaused) return
        const now = Date.now()
        if (this.phase === 'break') {
          this.activeTask.timeLeft = this.computeBreakRemaining(now)
          if (this.activeTask.timeLeft <= 0) {
            void this.finishBreak()
          }
        } else {
          this.activeTask.timeLeft = this.computeFocusRemaining(now)
          if (this.activeTask.timeLeft <= 0) {
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
      if (process.client || process.env.VITEST) {
        // useNotify is module-scoped (safe from Pinia actions). The old
        // CustomEvent had no listener, so blocks/warnings were silent.
        useNotify().notify(title, { message, type })
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
