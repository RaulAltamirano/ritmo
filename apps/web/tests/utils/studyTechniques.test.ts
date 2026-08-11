import { describe, expect, it } from 'vitest'
import {
  formatPlanTimerLabel,
  resolveStudyTechnique,
  taskDurationMinutes,
} from '~/utils/studyTechniques'

describe('studyTechniques', () => {
  it('resolves technique from studyTechnique field', () => {
    const meta = resolveStudyTechnique({ studyTechnique: 'shadowing' })
    expect(meta?.label).toBe('Shadowing')
  })

  it('resolves technique from tags aliases', () => {
    const meta = resolveStudyTechnique({ tags: ['spaced-repetition'] })
    expect(meta?.id).toBe('spaced_repetition')
  })

  it('formats classic pomodoro duration', () => {
    expect(taskDurationMinutes({ estimatedTime: '25', duration: '25m' })).toBe(25)
    expect(formatPlanTimerLabel(25)).toBe('25 min · Pomodoro')
    expect(formatPlanTimerLabel(90)).toBe('90 min')
  })
})
