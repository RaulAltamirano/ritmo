import { describe, expect, it } from 'vitest'
import { buildMockTrainingLogs } from '@/data/mockTrainingLogs'
import {
  findExerciseLog,
  findLastSessionLine,
  findLoadSettings,
} from '@/utils/trainingLogLookup'

const monday = new Date(2026, 7, 10) // 10 Aug 2026

describe('mock training logs', () => {
  it('seeds prior Shoulder Press sessions before the anchor Monday', () => {
    const logs = buildMockTrainingLogs(monday)
    expect(findExerciseLog(logs, 'd1-e1', '2026-08-10')).toBeNull()
    expect(findLastSessionLine(logs, 'd1-e1', '2026-08-10', null, 80)).toMatch(
      /^Last: /,
    )
    const prior = logs.filter(l => l.exerciseId === 'd1-e1')
    expect(prior.length).toBeGreaterThanOrEqual(4)
  })
})

describe('findLoadSettings', () => {
  it('defaults to kg when missing', () => {
    expect(findLoadSettings([], 'unknown')).toEqual({
      exerciseId: 'unknown',
      plateKg: null,
      lastUnit: 'kg',
    })
  })
})
