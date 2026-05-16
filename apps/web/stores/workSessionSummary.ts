import { defineStore } from 'pinia'
import { loadConfig } from '@/config/environment'

export const useWorkSessionSummaryStore = defineStore('workSessionSummary', {
  state: () => ({
    calendarDate: '' as string,
    totalSeconds: 0 as number,
    perTask: {} as Record<string, number>,
    lastSessionEndedAt: null as string | null,
    lastError: null as string | null,
    loading: false as boolean,
  }),

  getters: {
    getSecondsFor:
      state =>
      (taskId: string): number =>
        state.perTask[taskId] ?? 0,
  },

  actions: {
    async refresh(): Promise<void> {
      this.loading = true
      this.lastError = null
      try {
        const cfg = loadConfig()
        const res = await $fetch(`${cfg.api.baseUrl}/work-sessions/today-summary`, {
          credentials: 'include',
        })
        const d = res.data
        this.calendarDate = d.calendarDate
        this.totalSeconds = d.totalSeconds
        this.perTask = { ...d.perTask }
        this.lastSessionEndedAt = d.lastSessionEndedAt
      } catch (e) {
        this.lastError = e instanceof Error ? e.message : 'unknown error'
      } finally {
        this.loading = false
      }
    },
  },
})
