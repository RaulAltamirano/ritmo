import { describe, expect, it } from 'vitest'
import {
  DEFAULT_TIMER_PRESETS,
  FREE_ESTIMATE_DURATION_VALUE,
  getEstimateDurationChoices,
  getEstimateDurationLabel,
  mapModeLabelToTimerMode,
} from '@/composables/timer/timerPresets'

describe('mapModeLabelToTimerMode', () => {
  it('maps the Pomodoro 25/5 preset to pomodoro', () => {
    expect(mapModeLabelToTimerMode(DEFAULT_TIMER_PRESETS[0].name)).toBe('pomodoro')
  })

  it('maps the 52/17 preset to custom (not ultradian)', () => {
    expect(mapModeLabelToTimerMode(DEFAULT_TIMER_PRESETS[1].name)).toBe('custom')
  })

  it('maps the 90/20 preset to ultradian', () => {
    expect(mapModeLabelToTimerMode(DEFAULT_TIMER_PRESETS[2].name)).toBe('ultradian')
  })

  it('recognises the "pomodoro" keyword in free-form labels', () => {
    expect(mapModeLabelToTimerMode('pomodoro variant')).toBe('pomodoro')
    expect(mapModeLabelToTimerMode('Pomodoro 25/5')).toBe('pomodoro')
  })

  it('recognises the "ultradian" keyword in free-form labels', () => {
    expect(mapModeLabelToTimerMode('ultradian sprint')).toBe('ultradian')
    expect(mapModeLabelToTimerMode('Ultradiano largo')).toBe('ultradian')
  })

  it('falls back to custom for unknown labels', () => {
    expect(mapModeLabelToTimerMode('My custom focus')).toBe('custom')
    expect(mapModeLabelToTimerMode('')).toBe('custom')
    expect(mapModeLabelToTimerMode('   ')).toBe('custom')
  })

  it('does NOT treat raw "52" or "17" numbers as ultradian', () => {
    expect(mapModeLabelToTimerMode('52 min block')).not.toBe('ultradian')
    expect(mapModeLabelToTimerMode('17 min')).not.toBe('ultradian')
  })
})

describe('getEstimateDurationChoices', () => {
  it('uses canonical work minutes from timer presets', () => {
    const choices = getEstimateDurationChoices()
    expect(choices.map(c => c.value)).toEqual(['25', '52', '90'])
    expect(choices.map(c => c.presetKey)).toEqual(['25_5', '52_17', '90_20'])
  })

  it('labels match docs/knowledge timer presets', () => {
    expect(getEstimateDurationLabel(DEFAULT_TIMER_PRESETS[0]!)).toBe(
      'Pomodoro clásico · 25 min',
    )
    expect(getEstimateDurationLabel(DEFAULT_TIMER_PRESETS[1]!)).toBe(
      'Bloque medio · 52 min',
    )
    expect(getEstimateDurationLabel(DEFAULT_TIMER_PRESETS[2]!)).toBe(
      'Bloque largo · 90 min',
    )
  })
})

describe('FREE_ESTIMATE_DURATION_VALUE', () => {
  it('is the sentinel string free', () => {
    expect(FREE_ESTIMATE_DURATION_VALUE).toBe('free')
  })
})
