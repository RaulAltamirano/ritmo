import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExerciseBlockGroup from '@/components/molecules/ExerciseBlockGroup.vue'
import { mockWeeklyPlan } from '@/data/mockWeeklyPlan'

describe('ExerciseBlockGroup', () => {
  it('left-aligns the group hint on the base breakpoint and allows sm row layout', () => {
    const exercises = mockWeeklyPlan.days[0]!.exercises.slice(0, 2)
    const wrapper = mount(ExerciseBlockGroup, {
      props: {
        exercises,
        groupIndex: 0,
        dayKey: '2026-08-21',
      },
      global: {
        stubs: {
          ExerciseRow: { template: '<li />' },
        },
      },
    })
    const hint = wrapper.get('header p')
    expect(hint.classes().join(' ')).not.toMatch(/(?:^| )text-right(?: |$)/)
    expect(hint.classes().join(' ')).toMatch(/sm:text-right/)
    const header = wrapper.get('header')
    expect(header.classes().join(' ')).toMatch(/flex-col/)
    expect(header.classes().join(' ')).toMatch(/sm:flex-row/)
  })
})
