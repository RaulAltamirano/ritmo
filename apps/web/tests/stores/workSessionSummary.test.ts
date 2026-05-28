import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'

vi.mock('@/config/environment', () => ({
  loadConfig: () => ({ api: { baseUrl: 'http://api.test' } }),
}))

describe('useWorkSessionSummaryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    ;(globalThis as any).$fetch = vi.fn()
  })

  it('starts empty', () => {
    const s = useWorkSessionSummaryStore()
    expect(s.totalSeconds).toBe(0)
    expect(s.perTask).toEqual({})
    expect(s.lastSessionEndedAt).toBeNull()
    expect(s.getSecondsFor('anything')).toBe(0)
  })

  it('fetches and stores the summary', async () => {
    ;(globalThis as any).$fetch.mockResolvedValueOnce({
      data: {
        calendarDate: '2026-04-21',
        totalSeconds: 1500,
        perTask: { t1: 900, t2: 600 },
        lastSessionEndedAt: '2026-04-21T15:00:00.000Z',
      },
    })
    const s = useWorkSessionSummaryStore()
    await s.refresh()
    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      'http://api.test/work-sessions/today-summary',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(s.totalSeconds).toBe(1500)
    expect(s.perTask).toEqual({ t1: 900, t2: 600 })
    expect(s.lastSessionEndedAt).toBe('2026-04-21T15:00:00.000Z')
    expect(s.getSecondsFor('t1')).toBe(900)
    expect(s.getSecondsFor('unknown')).toBe(0)
  })

  it('records the error and leaves totals at zero on fetch failure', async () => {
    ;(globalThis as any).$fetch.mockRejectedValueOnce(new Error('offline'))
    const s = useWorkSessionSummaryStore()
    await s.refresh()
    expect(s.totalSeconds).toBe(0)
    expect(s.lastError).toBe('offline')
    expect(s.loading).toBe(false)
  })
})
