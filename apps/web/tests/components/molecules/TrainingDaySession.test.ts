import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TrainingDaySession from '@/components/molecules/TrainingDaySession.vue'
import { buildMockLoadSettings, buildMockTrainingLogs } from '@/data/mockTrainingLogs'
import { mockWeeklyPlan } from '@/data/mockWeeklyPlan'
import type { ExerciseLoadSettings, ExerciseLog } from '@/types/training'

describe('TrainingDaySession', () => {
  it('shows Rest day when trainingDay is null', () => {
    const wrapper = mount(TrainingDaySession, {
      props: { trainingDay: null },
    })
    expect(wrapper.text()).toContain('Rest day')
    expect(wrapper.get('section').attributes('aria-label')).toBe('Rest day')
  })

  it('shows session title and an exercise name', () => {
    const day = mockWeeklyPlan.days[0]!
    const wrapper = mount(TrainingDaySession, {
      props: { trainingDay: day },
    })
    expect(wrapper.text()).toContain(day.name)
    expect(wrapper.text()).toContain(day.exercises[0]!.name)
    expect(wrapper.get('section').attributes('aria-label')).toBe(day.name)
  })

  it('labels supersets and shows RPE without RIR', () => {
    const day = mockWeeklyPlan.days[1]! // Piernas A: supersets + triset
    const wrapper = mount(TrainingDaySession, {
      props: { trainingDay: day },
    })
    const text = wrapper.text()
    expect(text).toContain('Superset')
    expect(text).toContain('Triset')
    expect(text).toMatch(/back-to-back/i)
    expect(text).toMatch(/RPE/)
    expect(text).not.toMatch(/@ RIR|\bRIR\b/)
  })

  it('renders set fields for an exercise', () => {
    const day = mockWeeklyPlan.days[0]!
    const wrapper = mount(TrainingDaySession, {
      props: {
        trainingDay: day,
        dayKey: '2026-08-10',
        logs: [],
        settings: [],
        bodyweightKg: 80,
      },
    })
    expect(wrapper.text()).toContain('Reps')
    expect(wrapper.text()).toContain('Add set')
  })

  it('shows last session line from prior logs', () => {
    const day = mockWeeklyPlan.days[0]!
    const wrapper = mount(TrainingDaySession, {
      props: {
        trainingDay: day,
        dayKey: '2026-08-10',
        logs: buildMockTrainingLogs(new Date(2026, 7, 10)),
        settings: buildMockLoadSettings(),
        bodyweightKg: 80,
      },
    })
    expect(wrapper.text()).toMatch(/Last:/)
  })

  it('persists lastUnit from the changed set only', async () => {
    const day = mockWeeklyPlan.days[0]!
    const exercise = day.exercises[0]!
    const wrapper = mount(TrainingDaySession, {
      props: {
        trainingDay: day,
        dayKey: '2026-08-10',
        logs: [],
        settings: [{ exerciseId: exercise.id, plateKg: null, lastUnit: 'kg' }],
        bodyweightKg: 80,
      },
    })

    await wrapper.get('[aria-label="Pounds"]').trigger('click')

    const afterUnit = wrapper.emitted('update:settings')
    expect(afterUnit).toHaveLength(1)
    const unitSettings = afterUnit![0]![0] as ExerciseLoadSettings[]
    expect(unitSettings.find(item => item.exerciseId === exercise.id)?.lastUnit).toBe(
      'lbs',
    )

    const logs = wrapper.emitted('update:logs')![0]![0] as ExerciseLog[]
    await wrapper.setProps({ logs, settings: unitSettings })

    await wrapper.get('[aria-label="Reps"]').setValue('8')

    const settingsEmits = wrapper.emitted('update:settings') ?? []
    expect(settingsEmits).toHaveLength(1)
    const laterUnits = settingsEmits.slice(1).flatMap(payload => {
      const list = payload[0] as ExerciseLoadSettings[]
      return list.map(item => item.lastUnit)
    })
    expect(laterUnits).not.toContain('kg')
  })
})
