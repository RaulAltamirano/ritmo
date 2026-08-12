import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExerciseProgressSheet from '@/components/molecules/ExerciseProgressSheet.vue'
import { buildMockTrainingLogs } from '@/data/mockTrainingLogs'

const monday = new Date(2026, 7, 10)

const BaseModalStub = {
  props: ['isOpen', 'title'],
  template: '<div v-if="isOpen"><slot /></div>',
}

function mountSheet(props: Record<string, unknown>) {
  return mount(ExerciseProgressSheet, {
    props,
    global: { stubs: { BaseModal: BaseModalStub } },
  })
}

describe('ExerciseProgressSheet', () => {
  it('defaults to Load and shows cards when history is short', () => {
    const logs = buildMockTrainingLogs(monday)
      .filter(l => l.exerciseId === 'd1-e1')
      .slice(0, 2)
    const wrapper = mountSheet({
      isOpen: true,
      exerciseName: 'Shoulder Press',
      logs,
      todayKey: '2026-08-10',
      settings: { exerciseId: 'd1-e1', plateKg: null, lastUnit: 'kg' },
      bodyweightKg: 80,
    })
    expect(wrapper.get('[aria-pressed="true"]').text()).toBe('Load')
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.text()).toMatch(/Today|Previous|Best/)
  })

  it('draws a line when there are 4 convertible sessions', () => {
    const logs = buildMockTrainingLogs(monday).filter(l => l.exerciseId === 'd1-e1')
    const wrapper = mountSheet({
      isOpen: true,
      exerciseName: 'Shoulder Press',
      logs,
      todayKey: '2026-08-10',
      settings: { exerciseId: 'd1-e1', plateKg: null, lastUnit: 'kg' },
      bodyweightKg: 80,
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.get('table').text()).toMatch(/kg/)
  })

  it('warns when plates lack plate kg instead of drawing a fake line', () => {
    const logs = buildMockTrainingLogs(monday).filter(l => l.exerciseId === 'd1-e2')
    const wrapper = mountSheet({
      isOpen: true,
      exerciseName: 'Pull Down (neutro)',
      logs,
      todayKey: '2026-08-10',
      settings: { exerciseId: 'd1-e2', plateKg: null, lastUnit: 'plates' },
      bodyweightKg: 80,
    })
    expect(wrapper.text()).toContain('Set plate weight to see kg')
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('shows empty copy with no logs', () => {
    const wrapper = mountSheet({
      isOpen: true,
      exerciseName: 'Pec Fly',
      logs: [],
      todayKey: '2026-08-10',
      settings: { exerciseId: 'x', plateKg: null, lastUnit: 'kg' },
      bodyweightKg: 80,
    })
    expect(wrapper.text()).toContain('No sets logged for this exercise yet')
    expect(wrapper.find('svg').exists()).toBe(false)
  })
})
