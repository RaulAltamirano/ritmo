import { defineStore } from 'pinia'

type WorkSessionConflictState = 'running' | 'paused' | 'pending_feedback'

/** UI para gate de check-in diario, conflicto 409 y modal de reflexión (work sessions remotos). */
export const useSessionGateStore = defineStore('sessionGate', {
  state: () => ({
    showDailyCheckin: false,
    showFeedback: false,
    feedbackWorkSessionId: null as string | null,
    /** Bloque remoto que impide iniciar otro (`POST /work-sessions` → 409). */
    conflict: null as null | {
      activeSessionId: string
      state: WorkSessionConflictState
    },
    pendingStartPayload: null as null | {
      task: { id: string; name: string; category?: string }
      mode: { minutes: number; name: string }
    },
    taskSwitchPrompt: null as null | {
      toTask: { id: string; name: string; category?: string }
      mode: { minutes: number; name: string; presetKey?: string; breakSec?: number }
      remainingSec: number
      canContinueRemaining: boolean
      fromTaskName: string
    },
  }),
  actions: {
    requestDailyCheckinForPendingStart() {
      this.showDailyCheckin = true
    },
    closeDailyCheckin() {
      this.showDailyCheckin = false
    },
    clearPendingStart() {
      this.pendingStartPayload = null
    },
    setPendingStart(
      task: { id: string; name: string; category?: string },
      mode: { minutes: number; name: string },
    ) {
      this.pendingStartPayload = { task, mode }
    },
    openFeedback(sessionId: string) {
      this.feedbackWorkSessionId = sessionId
      this.showFeedback = true
    },
    closeFeedback() {
      this.showFeedback = false
      this.feedbackWorkSessionId = null
    },
    openConflict(activeSessionId: string, state: WorkSessionConflictState) {
      this.conflict = { activeSessionId, state }
    },
    closeConflict() {
      this.conflict = null
    },
    openTaskSwitchPrompt(payload: NonNullable<typeof this.taskSwitchPrompt>) {
      this.taskSwitchPrompt = payload
    },
    closeTaskSwitchPrompt() {
      this.taskSwitchPrompt = null
    },
  },
})
