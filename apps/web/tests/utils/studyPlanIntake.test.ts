import { describe, expect, it } from 'vitest'
import type { StudyPlanIntake } from '@/types/studyPlan'
import { studyPlanIntakeToProjectForm } from '@/utils/studyPlanIntake'

const baseIntake = (): StudyPlanIntake => ({
  goal: 'Conversational Japanese',
  description: 'Focus on speaking and listening',
  color: 'teal',
  daysPerWeek: 4,
  minutesPerSession: 45,
  targetDate: '2026-12-01',
})

describe('studyPlanIntakeToProjectForm', () => {
  it('maps goal to name, color, and packs description with schedule', () => {
    const form = studyPlanIntakeToProjectForm(baseIntake())

    expect(form.name).toBe('Conversational Japanese')
    expect(form.status).toBe('planificado')
    expect(form.color).toBe('teal')
    expect(form.description).toContain('Focus on speaking and listening')
    expect(form.description).toContain('4 days/week · 45 min/session')
    expect(form.description).toContain('Target date: 2026-12-01')
    expect(form.description).not.toContain('Learning types:')
    expect(form.description).not.toContain('Tags:')
  })

  it('truncates long goals and omits empty optional fields', () => {
    const longGoal = 'A'.repeat(100)
    const form = studyPlanIntakeToProjectForm({
      ...baseIntake(),
      goal: longGoal,
      description: '',
      targetDate: null,
    })

    expect(form.name).toHaveLength(80)
    expect(form.name).toBe(longGoal.slice(0, 80))
    expect(form.description).toBe('Schedule: 4 days/week · 45 min/session')
    expect(form.description).not.toContain('Target date:')
  })
})
