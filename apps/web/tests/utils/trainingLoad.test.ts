import { describe, expect, it } from 'vitest'
import {
  estimated1Rm,
  formatNativeLoad,
  loadToKgEq,
  roundKgEq,
} from '@/utils/trainingLoad'

describe('roundKgEq', () => {
  it('rounds to the nearest 0.5 kg', () => {
    expect(roundKgEq(69.853168)).toBe(70)
    expect(roundKgEq(70.24)).toBe(70)
    expect(roundKgEq(70.25)).toBe(70.5)
  })
})

describe('loadToKgEq', () => {
  it('returns kg as-is', () => {
    expect(
      loadToKgEq({ load: 70, unit: 'kg', plateKg: null, bodyweightKg: null }),
    ).toBe(70)
  })

  it('converts lbs and rounds to 0.5 kg', () => {
    expect(
      loadToKgEq({ load: 154, unit: 'lbs', plateKg: null, bodyweightKg: null }),
    ).toBe(70)
  })

  it('multiplies plates by plateKg', () => {
    expect(
      loadToKgEq({ load: 4, unit: 'plates', plateKg: 10, bodyweightKg: null }),
    ).toBe(40)
    expect(
      loadToKgEq({ load: 4, unit: 'plates', plateKg: null, bodyweightKg: null }),
    ).toBeNull()
  })

  it('adds BW extra to bodyweight', () => {
    expect(
      loadToKgEq({ load: 10, unit: 'bw', plateKg: null, bodyweightKg: 80 }),
    ).toBe(90)
    expect(
      loadToKgEq({ load: null, unit: 'bw', plateKg: null, bodyweightKg: 80 }),
    ).toBe(80)
    expect(
      loadToKgEq({ load: 0, unit: 'bw', plateKg: null, bodyweightKg: null }),
    ).toBeNull()
  })

  it('returns null when load is missing for kg/lbs/plates', () => {
    expect(
      loadToKgEq({ load: null, unit: 'kg', plateKg: null, bodyweightKg: null }),
    ).toBeNull()
  })
})

describe('formatNativeLoad', () => {
  it('formats each unit', () => {
    expect(formatNativeLoad(70, 'kg')).toBe('70kg')
    expect(formatNativeLoad(154, 'lbs')).toBe('154lbs')
    expect(formatNativeLoad(4, 'plates')).toBe('4P')
    expect(formatNativeLoad(null, 'bw')).toBe('BW')
    expect(formatNativeLoad(0, 'bw')).toBe('BW')
    expect(formatNativeLoad(10, 'bw')).toBe('BW+10kg')
  })
})

describe('estimated1Rm', () => {
  it('uses Epley with RIR = 10 - RPE', () => {
    // 70kg × 10 reps @8 → RIR 2 → 70 * (1 + 12/30) = 98
    expect(estimated1Rm(70, 10, 8)).toBe(98)
  })
})
