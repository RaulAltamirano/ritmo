import { describe, expect, it } from 'vitest'
import type { SetLog } from '@/types/training'
import {
  bestCompletedSet,
  formatLastSessionLine,
  formatLoadDelta,
  sessionProgressPoint,
  sessionVolumeKg,
  shouldDrawLineChart,
} from '@/utils/trainingSessionMetrics'

function set(partial: Partial<SetLog> & Pick<SetLog, 'id' | 'index'>): SetLog {
  return {
    reps: 10,
    rpe: 8,
    load: 70,
    unit: 'kg',
    completed: true,
    ...partial,
  }
}

describe('bestCompletedSet', () => {
  it('picks heaviest kg-eq, then higher reps', () => {
    const sets = [
      set({ id: '1', index: 1, load: 70, reps: 10 }),
      set({ id: '2', index: 2, load: 75, reps: 6 }),
      set({ id: '3', index: 3, load: 75, reps: 8 }),
      set({ id: '4', index: 4, load: 80, reps: 5, completed: false }),
    ]
    expect(bestCompletedSet(sets, null, null)?.id).toBe('3')
  })
})

describe('sessionVolumeKg', () => {
  it('sums completed convertible sets', () => {
    const sets = [
      set({ id: '1', index: 1, load: 70, reps: 10 }),
      set({ id: '2', index: 2, load: 70, reps: 8 }),
    ]
    expect(sessionVolumeKg(sets, null, null)).toBe(1260)
  })

  it('returns null if a completed set cannot convert', () => {
    const sets = [
      set({ id: '1', index: 1, unit: 'plates', load: 4 }),
    ]
    expect(sessionVolumeKg(sets, null, null)).toBeNull()
  })

  it('returns null rather than 0 when no sets are completed', () => {
    expect(sessionVolumeKg([], null, null)).toBeNull()
    expect(
      sessionVolumeKg([set({ id: '1', index: 1, completed: false })], null, null),
    ).toBeNull()
  })

  it('returns 0 when completed convertible sets have zero load', () => {
    expect(sessionVolumeKg([set({ id: '1', index: 1, load: 0 })], null, null)).toBe(0)
  })
})

describe('formatLastSessionLine', () => {
  it('renders Last: reps @RPE · native', () => {
    expect(formatLastSessionLine(set({ id: '1', index: 1, rpe: 7.5 }))).toBe(
      'Last: 10 @7.5 · 70kg',
    )
  })
})

describe('formatLoadDelta', () => {
  it('includes sign and number', () => {
    expect(formatLoadDelta(72.5, 70)).toBe('+2.5 kg')
    expect(formatLoadDelta(70, 70)).toBe('same')
    expect(formatLoadDelta(65, 70)).toBe('−5 kg')
  })
})

describe('sessionProgressPoint', () => {
  it('marks convertible when best set has kg-eq', () => {
    const point = sessionProgressPoint(
      {
        exerciseId: 'd1-e1',
        dayKey: '2026-08-10',
        note: null,
        sets: [set({ id: '1', index: 1 })],
      },
      null,
      null,
    )
    expect(point.convertible).toBe(true)
    expect(point.kgEq).toBe(70)
    expect(point.nativeLabel).toBe('70kg')
  })
})

describe('shouldDrawLineChart', () => {
  it('requires 4 convertible points', () => {
    const mk = (n: number) => ({
      dayKey: `d${n}`,
      kgEq: 70,
      e1rm: 98,
      volumeKg: 700,
      nativeLabel: '70kg',
      convertible: n < 3,
    })
    expect(shouldDrawLineChart([mk(0), mk(1), mk(2), mk(3)])).toBe(false)
    expect(
      shouldDrawLineChart([
        { ...mk(0), convertible: true },
        { ...mk(1), convertible: true },
        { ...mk(2), convertible: true },
        { ...mk(3), convertible: true },
      ]),
    ).toBe(true)
  })
})
