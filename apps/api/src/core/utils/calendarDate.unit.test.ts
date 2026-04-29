import { describe, expect, it } from 'vitest'
import { getCalendarDateForUser, parseCalendarDateString } from './calendarDate.js'

describe('getCalendarDateForUser', () => {
  it('maps UTC instant to civil date in Europe/Madrid', () => {
    // 2024-03-31 22:00 UTC → 2024-04-01 00:00 in Madrid (CEST)
    const d = new Date('2024-03-31T22:00:00.000Z')
    const cal = getCalendarDateForUser(d, 'Europe/Madrid')
    expect(cal.toISOString().slice(0, 10)).toBe('2024-04-01')
  })

  it('uses UTC calendar when timezone is UTC', () => {
    const d = new Date('2024-06-15T12:00:00.000Z')
    const cal = getCalendarDateForUser(d, 'UTC')
    expect(cal.toISOString().slice(0, 10)).toBe('2024-06-15')
  })
})

describe('parseCalendarDateString', () => {
  it('parses YYYY-MM-DD to UTC midnight date', () => {
    const cal = parseCalendarDateString('2025-01-20')
    expect(cal.toISOString()).toBe('2025-01-20T00:00:00.000Z')
  })
})
