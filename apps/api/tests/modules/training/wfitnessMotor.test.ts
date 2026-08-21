import { describe, expect, it } from 'vitest'
import { PROGRAM_TEMPLATE_SEEDS } from '../../../src/modules/training/data/programTemplates.seed.js'
import {
  advanceBlock,
  applyDeloadToSlot,
  selectProgramCode,
  weekdayOffsetsForDays,
} from '../../../src/modules/training/services/WfitnessMotor.js'

describe('WfitnessMotor', () => {
  it.each([
    ['basic', 3, 'basic_1_0'],
    ['basic', 4, 'basic_1_0'],
    ['basic', 5, 'basic_2_0'],
    ['basic', 6, 'basic_2_0'],
    ['intermediate', 3, 'intermediate_1_0'],
    ['intermediate', 4, 'intermediate_2_0'],
    ['intermediate', 5, 'intermediate_2_0'],
    ['intermediate', 6, 'intermediate_2_0'],
    ['advanced', 3, 'intermediate_1_0'],
    ['advanced', 4, 'advanced_1_1'],
    ['advanced', 5, 'advanced_1_1'],
    ['advanced', 6, 'advanced_1_1'],
  ] as const)('maps %s at %i days to seeded template %s', (level, days, expected) => {
    const code = selectProgramCode(level, days)

    expect(code).toBe(expected)
    expect(PROGRAM_TEMPLATE_SEEDS.some(seed => seed.code === code)).toBe(true)
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
