import { describe, expect, it } from 'vitest'
import {
  advanceBlock,
  applyDeloadToSlot,
  selectProgramCode,
  weekdayOffsetsForDays,
} from '../../../src/modules/training/services/WfitnessMotor.js'

describe('WfitnessMotor', () => {
  it('maps intermediate 3 days to intermediate_1_0', () => {
    expect(selectProgramCode('intermediate', 3)).toBe('intermediate_1_0')
  })

  it('maps intermediate 4 days to intermediate_2_0', () => {
    expect(selectProgramCode('intermediate', 4)).toBe('intermediate_2_0')
  })

  it('maps basic 4 days to basic_1_0', () => {
    expect(selectProgramCode('basic', 4)).toBe('basic_1_0')
  })

  it('advances accumulation then flips to deload', () => {
    expect(
      advanceBlock({
        blockPhase: 'accumulation',
        weekInBlock: 4,
        blockLengthWeeks: 4,
      }),
    ).toEqual({ blockPhase: 'deload', weekInBlock: 1 })
    expect(
      advanceBlock({
        blockPhase: 'deload',
        weekInBlock: 1,
        blockLengthWeeks: 4,
      }),
    ).toEqual({ blockPhase: 'accumulation', weekInBlock: 1 })
  })

  it('deload raises RIR toward 3-4', () => {
    const next = applyDeloadToSlot({
      setsReps: '10x4rp',
      targetRir: '2',
      targetRpe: '8',
    })

    expect(next.targetRir).toMatch(/3|4/)
  })

  it('spreads 3 training days Mon/Wed/Fri', () => {
    expect(weekdayOffsetsForDays(3)).toEqual([0, 2, 4])
  })
})
