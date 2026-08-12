import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExerciseRow from '@/components/molecules/ExerciseRow.vue'
import { mockWeeklyPlan } from '@/data/mockWeeklyPlan'
import type { ExerciseLog } from '@/types/training'
import { parsePlannedSetCount } from '@/utils/parsePlannedSetCount'

const exercise = mockWeeklyPlan.days[0]!.exercises[0]!

describe('ExerciseRow', () => {
  it('shows plan target and hides Last when there is no prior log', () => {
    const wrapper = mount(ExerciseRow, { props: { exercise } })
    expect(wrapper.text()).toContain(exercise.setsReps)
    expect(wrapper.text()).toMatch(/RPE/)
    expect(wrapper.text()).not.toContain('Last:')
    expect(
      wrapper.get('[aria-label="View progress for Shoulder Press"]').exists(),
    ).toBe(true)
  })

  it('shows last session line when provided', () => {
    const wrapper = mount(ExerciseRow, {
      props: { exercise, lastSessionLine: 'Last: 10 @7.5 · 70kg' },
    })
    expect(wrapper.text()).toContain('Last: 10 @7.5 · 70kg')
  })

  it('emits update:log when adding a set', async () => {
    const wrapper = mount(ExerciseRow, {
      props: { exercise, dayKey: '2026-08-10' },
    })
    const addSet = wrapper.findAll('button').find(w => w.text() === 'Add set')
    expect(addSet).toBeDefined()
    await addSet?.trigger('click')
    const payload = wrapper.emitted('update:log')?.[0]?.[0] as ExerciseLog
    expect(payload.sets.length).toBe(parsePlannedSetCount(exercise.setsReps) + 1)
  })
})
