import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TrainingDaySession from '@/components/molecules/TrainingDaySession.vue'
import { mockWeeklyPlan } from '@/data/mockWeeklyPlan'

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
})
