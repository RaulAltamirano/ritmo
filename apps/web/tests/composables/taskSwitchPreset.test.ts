import { describe, expect, it } from 'vitest'
import {
  areSameTimerPreset,
  canContinueRemainingOnSwitch,
} from '@/composables/timer/taskSwitchPreset'

describe('areSameTimerPreset', () => {
  it('matches equal presetKeys', () => {
    expect(
      areSameTimerPreset(
        { minutes: 25, presetKey: '25_5' },
        { minutes: 25, presetKey: '25_5' },
      ),
    ).toBe(true)
  })

  it('differs on different presetKeys even if minutes somehow match', () => {
    expect(
      areSameTimerPreset(
        { minutes: 25, presetKey: '25_5' },
        { minutes: 25, presetKey: '25_10' },
      ),
    ).toBe(false)
  })

  it('falls back to minutes when either key missing', () => {
    expect(
      areSameTimerPreset({ minutes: 90 }, { minutes: 90, presetKey: '90_20' }),
    ).toBe(true)
    expect(areSameTimerPreset({ minutes: 90 }, { minutes: 25 })).toBe(false)
  })
})

describe('canContinueRemainingOnSwitch', () => {
  it('allows when remaining fits B', () => {
    expect(canContinueRemainingOnSwitch(1200, 25)).toBe(true) // 20m <= 25m
    expect(canContinueRemainingOnSwitch(1500, 25)).toBe(true)
  })

  it('blocks when remaining exceeds B', () => {
    expect(canContinueRemainingOnSwitch(3000, 25)).toBe(false) // 50m > 25m
  })
})
