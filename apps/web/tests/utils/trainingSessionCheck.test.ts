import { describe, expect, it } from 'vitest'
import type { ExerciseLog, TrainingDay } from '@/types/training'
import {
  emptySessionCheck,
  findSessionCheck,
  isPlannedSessionComplete,
  saveSessionCheckEnd,
  saveSessionCheckStart,
  skipSessionCheckPhase,
  strengthLabel,
  upsertSessionCheck,
} from '@/utils/trainingSessionCheck'

const day: TrainingDay = {
  id: 'd',
  dayNumber: 1,
  name: 'Test day',
  focus: 'upper',
  weekday: 1,
  exercises: [
    {
      id: 'e1',
      block: 'a',
      name: 'Press',
      setsReps: '10x2rp',
      targetRir: '2',
      rpe: '8',
    },
    {
      id: 'e2',
      block: 'b',
      name: 'Row',
      setsReps: '10x2rp',
      targetRir: '2',
      rpe: '8',
    },
  ],
}

function doneSet(id: string, index: number) {
  return {
    id,
    index,
    reps: 10,
    rpe: 8,
    load: 50,
    unit: 'kg' as const,
    completed: true,
  }
}

function log(exerciseId: string, sets: ExerciseLog['sets']): ExerciseLog {
  return { exerciseId, dayKey: '2026-08-17', note: null, sets }
}

describe('emptySessionCheck / upsert / skip / save', () => {
  it('starts both phases at none', () => {
    expect(emptySessionCheck('2026-08-17')).toEqual({
      dayKey: '2026-08-17',
      startStatus: 'none',
      endStatus: 'none',
      start: null,
      end: null,
    })
  })

  it('finds an existing check or returns an empty one for the day', () => {
    const saved = saveSessionCheckStart(emptySessionCheck('2026-08-17'), {
      preparation: 4,
      motivation: 3,
      strength: 4,
    })
    expect(findSessionCheck([saved], '2026-08-17')).toEqual(saved)
    expect(findSessionCheck([saved], '2026-08-18')).toEqual(
      emptySessionCheck('2026-08-18'),
    )
  })

  it('replaces the matching dayKey on upsert', () => {
    const first = emptySessionCheck('2026-08-17')
    const skipped = skipSessionCheckPhase(first, 'start')
    expect(upsertSessionCheck([first], skipped)).toEqual([skipped])
  })

  it('clears the start payload when skipping start', () => {
    const saved = saveSessionCheckStart(emptySessionCheck('d'), {
      preparation: 2,
      motivation: 2,
      strength: 2,
    })
    expect(skipSessionCheckPhase(saved, 'start')).toMatchObject({
      startStatus: 'skipped',
      start: null,
    })
  })

  it('saves end without touching start', () => {
    const start = saveSessionCheckStart(emptySessionCheck('d'), {
      preparation: 5,
      motivation: 5,
      strength: 4,
    })
    const end = saveSessionCheckEnd(start, { fatigue: 3, pain: 1, strength: 3 })
    expect(end.startStatus).toBe('saved')
    expect(end.end).toEqual({ fatigue: 3, pain: 1, strength: 3 })
  })
})

describe('strengthLabel', () => {
  it('maps 1–5 to the energy ladder labels', () => {
    expect(strengthLabel(1)).toBe('Very low')
    expect(strengthLabel(4)).toBe('High')
    expect(strengthLabel(5)).toBe('Very high')
  })
})

describe('isPlannedSessionComplete', () => {
  it('is false for rest days and empty plans', () => {
    expect(isPlannedSessionComplete(null, [], '2026-08-17')).toBe(false)
    expect(
      isPlannedSessionComplete({ ...day, exercises: [] }, [], '2026-08-17'),
    ).toBe(false)
  })

  it('is false until every exercise meets the planned completed count', () => {
    const logs = [
      log('e1', [doneSet('s1', 1), doneSet('s2', 2)]),
      log('e2', [doneSet('s1', 1)]),
    ]
    expect(isPlannedSessionComplete(day, logs, '2026-08-17')).toBe(false)
  })

  it('is true when each exercise has at least the planned completed sets', () => {
    const logs = [
      log('e1', [doneSet('s1', 1), doneSet('s2', 2)]),
      log('e2', [doneSet('s1', 1), doneSet('s2', 2)]),
    ]
    expect(isPlannedSessionComplete(day, logs, '2026-08-17')).toBe(true)
  })

  it('ignores extra incomplete rows past the planned count', () => {
    const extra = {
      id: 's3',
      index: 3,
      reps: null,
      rpe: null,
      load: null,
      unit: 'kg' as const,
      completed: false,
    }
    const logs = [
      log('e1', [doneSet('s1', 1), doneSet('s2', 2), extra]),
      log('e2', [doneSet('s1', 1), doneSet('s2', 2)]),
    ]
    expect(isPlannedSessionComplete(day, logs, '2026-08-17')).toBe(true)
  })
})
