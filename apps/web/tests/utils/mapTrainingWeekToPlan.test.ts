import { describe, expect, it } from 'vitest'
import {
  mapTrainingWeekToPlan,
  type FrontendTrainingWeek,
} from '@/utils/mapTrainingWeekToPlan'

const week: FrontendTrainingWeek = {
  id: 'week-1',
  weekStart: '2026-08-17',
  status: 'draft',
  blockPhase: 'accumulation',
  weekInBlock: 2,
  programTemplateCode: 'WFITNESS_4D',
  summary: null,
  warning: null,
  substitutions: [],
  days: [
    {
      id: 'day-1',
      dayNumber: 1,
      name: 'Upper A',
      focus: 'upper',
      weekday: 1,
      date: '2026-08-17',
      exercises: [
        {
          id: 'entry-1',
          exerciseId: 'exercise-1',
          name: 'Bench press',
          block: 'a',
          setsReps: '4x6',
          targetRir: '2',
          targetRpe: '8',
          emphasis: 'main',
        },
        {
          id: 'entry-2',
          exerciseId: 'exercise-2',
          name: 'Row',
          block: 'b',
          setsReps: '3x10',
          targetRir: '2-3',
          targetRpe: '7-8',
        },
      ],
    },
    {
      id: 'day-2',
      dayNumber: 2,
      name: 'Lower A',
      focus: 'lower',
      weekday: 3,
      date: '2026-08-19',
      exercises: [],
    },
  ],
}

describe('mapTrainingWeekToPlan', () => {
  it('maps API days and exercises into the weekly plan shape', () => {
    const plan = mapTrainingWeekToPlan(week)

    expect(plan.days).toHaveLength(2)
    expect(plan.days[0]?.exercises).toHaveLength(2)
    expect(plan.days[1]?.exercises).toHaveLength(0)
    expect(plan.days[0]?.exercises[0]).toMatchObject({
      id: 'entry-1',
      rpe: '8',
      emphasis: 'main',
    })
  })
})
