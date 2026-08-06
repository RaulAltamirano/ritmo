import { describe, expect, it } from 'vitest'
import { buildWeekDraft } from '@/utils/buildWeekDraft'

describe('buildWeekDraft', () => {
  it('builds sessions across the week from slots and plan name', () => {
    const draft = buildWeekDraft({
      planName: 'Japanese B2',
      weekStart: '2026-08-03',
      slots: {
        level: 'intermediate',
        friction: 'speaking',
        avoid: 'grammar drills',
      },
      minutesPerSession: 45,
      daysPerWeek: 4,
    })

    expect(draft.weekStart).toBe('2026-08-03')
    expect(draft.sessions.length).toBe(4)
    expect(draft.summary.toLowerCase()).toContain('speaking')
    expect(draft.sessions.every(s => s.durationMin === 45)).toBe(true)
    expect(draft.sessions[0]?.title).toMatch(/Japanese|speaking/i)
    const offsets = draft.sessions.map(s => s.dayOffset)
    expect(new Set(offsets).size).toBe(4)
  })

  it('falls back to 3 days × 45 min when rhythm omitted', () => {
    const draft = buildWeekDraft({
      planName: 'Exam prep',
      weekStart: '2026-08-03',
      slots: { level: 'beginner', friction: 'recall', avoid: 'long sessions' },
    })
    expect(draft.sessions.length).toBe(3)
    expect(draft.sessions[0]?.durationMin).toBe(45)
  })
})
