import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExerciseRow from '@/components/molecules/ExerciseRow.vue'
import { mockWeeklyPlan } from '@/data/mockWeeklyPlan'
import type { ExerciseLog, SetLog } from '@/types/training'
import { parsePlannedSetCount } from '@/utils/parsePlannedSetCount'

const exercise = mockWeeklyPlan.days[0]!.exercises[0]!

function emptyLoggedSet(id: string, index: number): SetLog {
  return {
    id,
    index,
    reps: null,
    rpe: null,
    load: null,
    unit: 'kg',
    completed: false,
  }
}

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

  it('keeps set ids unique after deleting then adding a set', async () => {
    const log: ExerciseLog = {
      exerciseId: exercise.id,
      dayKey: '2026-08-10',
      note: null,
      sets: [emptyLoggedSet('set-1', 1), emptyLoggedSet('set-2', 2)],
    }
    const wrapper = mount(ExerciseRow, {
      props: { exercise, dayKey: '2026-08-10', log },
    })

    await wrapper.get('[aria-label="Delete set"]').trigger('click')
    const confirmDelete = wrapper.findAll('button').find(w => w.text() === 'Delete')
    expect(confirmDelete).toBeDefined()
    await confirmDelete?.trigger('click')

    const afterDelete = wrapper.emitted('update:log')?.[0]?.[0] as ExerciseLog
    await wrapper.setProps({ log: afterDelete })

    const addSet = wrapper.findAll('button').find(w => w.text() === 'Add set')
    await addSet?.trigger('click')

    const afterAdd = wrapper.emitted('update:log')?.[1]?.[0] as ExerciseLog
    const ids = afterAdd.sets.map(set => set.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
