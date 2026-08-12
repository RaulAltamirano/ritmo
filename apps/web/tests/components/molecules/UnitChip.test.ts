import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UnitChip from '@/components/molecules/UnitChip.vue'

describe('UnitChip', () => {
  it('selects a unit and emits it', async () => {
    const wrapper = mount(UnitChip, { props: { modelValue: 'kg' } })
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe(
      'Load unit',
    )
    const plates = wrapper
      .findAll('[role="radio"]')
      .find(w => w.text() === 'P')
    await plates!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['plates'])
  })

  it('marks the current unit as checked', () => {
    const wrapper = mount(UnitChip, { props: { modelValue: 'bw' } })
    const bw = wrapper.findAll('[role="radio"]').find(w => w.text() === 'BW')
    expect(bw!.attributes('aria-checked')).toBe('true')
    expect(bw!.attributes('aria-label')).toBe('Bodyweight')
  })
})
