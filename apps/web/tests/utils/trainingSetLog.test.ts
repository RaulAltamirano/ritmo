import { describe, expect, it } from 'vitest'
import type { SetLog } from '@/types/training'
import {
  dayLogStatus,
  emptySetLog,
  ensureSetRows,
  isSetComplete,
  isSetStarted,
  validateRpe,
} from '@/utils/trainingSetLog'

describe('emptySetLog', () => {
  it('starts empty with remembered unit', () => {
    const row = emptySetLog(1, 'plates')
    expect(row).toMatchObject({
      id: 'set-1',
      index: 1,
      reps: null,
      rpe: null,
      load: null,
      unit: 'plates',
      completed: false,
    })
  })
})

describe('ensureSetRows', () => {
  it('creates parsed empty rows when there is no log', () => {
    const rows = ensureSetRows(null, '10x4rp', 'kg')
    expect(rows).toHaveLength(4)
    expect(rows[0]?.unit).toBe('kg')
  })

  it('keeps existing sets', () => {
    const existing: SetLog = {
      id: 's1',
      index: 1,
      reps: 10,
      rpe: 8,
      load: 70,
      unit: 'kg',
      completed: true,
    }
    const rows = ensureSetRows(
      { exerciseId: 'e1', dayKey: '2026-08-10', note: null, sets: [existing] },
      '10x4rp',
      'kg',
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]?.id).toBe('s1')
  })
})

describe('validateRpe', () => {
  it('allows empty and 0.5 steps', () => {
    expect(validateRpe(null)).toBeNull()
    expect(validateRpe(7.5)).toBeNull()
    expect(validateRpe(7.2)).toBe('RPE is 1–10 in 0.5 steps')
    expect(validateRpe(0)).toBe('RPE is 1–10 in 0.5 steps')
  })
})

describe('isSetComplete', () => {
  it('requires load for kg but not for BW extra', () => {
    const base = emptySetLog(1, 'kg')
    expect(isSetComplete({ ...base, reps: 10, rpe: 8, load: 70 })).toBe(true)
    expect(isSetComplete({ ...base, reps: 10, rpe: 8, load: null })).toBe(false)
    expect(
      isSetComplete({ ...base, unit: 'bw', reps: 10, rpe: 8, load: null }),
    ).toBe(true)
  })
})

describe('dayLogStatus', () => {
  it('ignores placeholder rows', () => {
    expect(
      dayLogStatus([
        {
          exerciseId: 'e1',
          dayKey: '2026-08-10',
          note: null,
          sets: [emptySetLog(1, 'kg')],
        },
      ]),
    ).toBe('none')
  })

  it('marks incomplete when a started set is missing fields', () => {
    const started: SetLog = { ...emptySetLog(1, 'kg'), reps: 10 }
    expect(
      dayLogStatus([
        { exerciseId: 'e1', dayKey: 'd', note: null, sets: [started] },
      ]),
    ).toBe('incomplete')
  })

  it('marks logged when started sets are complete', () => {
    const done: SetLog = {
      ...emptySetLog(1, 'kg'),
      reps: 10,
      rpe: 8,
      load: 70,
      completed: true,
    }
    expect(isSetStarted(done)).toBe(true)
    expect(
      dayLogStatus([
        { exerciseId: 'e1', dayKey: 'd', note: null, sets: [done, emptySetLog(2, 'kg')] },
      ]),
    ).toBe('logged')
  })
})
