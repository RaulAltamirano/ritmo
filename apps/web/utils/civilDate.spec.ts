import { describe, expect, it, vi } from 'vitest'
import { getCivilDateYmd } from './civilDate'

describe('getCivilDateYmd', () => {
  it('returns Madrid civil date ahead of UTC near midnight', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-21T23:30:00.000Z'))
    expect(getCivilDateYmd('Europe/Madrid')).toBe('2026-04-22')
    vi.useRealTimers()
  })

  it('returns UTC civil date for a fixed instant', () => {
    const d = new Date('2026-06-01T12:00:00.000Z')
    expect(getCivilDateYmd('UTC', d)).toBe('2026-06-01')
  })
})
