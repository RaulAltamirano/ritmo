import { describe, expect, it } from 'vitest'
import { mockWeeklyPlan } from '@/data/mockWeeklyPlan'
import { calendarDayKey, startOfWeekMonday } from '@/utils/planWeek'
import {
  addDays,
  buildWeekColumns,
  sessionCountByDayKey,
} from '@/utils/trainingWeek'

describe('trainingWeek', () => {
  it('sessionCountByDayKey marks Mon/Tue/Thu/Fri for mock plan on a Monday week', () => {
    // Week of Mon Aug 10 – Sun Aug 16, 2026
    const weekStart = startOfWeekMonday(new Date(2026, 7, 10))
    expect(weekStart.getDay()).toBe(1)
    expect(weekStart.getDate()).toBe(10)

    const counts = sessionCountByDayKey(weekStart, mockWeeklyPlan)

    expect(counts[calendarDayKey(addDays(weekStart, 0))]).toBe(1) // Mon
    expect(counts[calendarDayKey(addDays(weekStart, 1))]).toBe(1) // Tue
    expect(counts[calendarDayKey(addDays(weekStart, 2))]).toBe(0) // Wed rest
    expect(counts[calendarDayKey(addDays(weekStart, 3))]).toBe(1) // Thu
    expect(counts[calendarDayKey(addDays(weekStart, 4))]).toBe(1) // Fri
    expect(counts[calendarDayKey(addDays(weekStart, 5))]).toBe(0) // Sat
    expect(counts[calendarDayKey(addDays(weekStart, 6))]).toBe(0) // Sun
  })

  it('buildWeekColumns maps weekday sessions under Monday weekStart', () => {
    const weekStart = startOfWeekMonday(new Date(2026, 7, 10))
    const columns = buildWeekColumns(weekStart, mockWeeklyPlan)
    expect(columns).toHaveLength(7)
    expect(columns[0]?.trainingDay?.name).toBe('Empuje / Tracción A')
    expect(columns[2]?.trainingDay).toBeNull()
    expect(columns[3]?.trainingDay?.name).toBe('Empuje / Tracción B')
  })
})
