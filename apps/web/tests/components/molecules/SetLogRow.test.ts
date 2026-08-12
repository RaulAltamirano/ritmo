import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SetLogRow from '@/components/molecules/SetLogRow.vue'
import { emptySetLog } from '@/utils/trainingSetLog'

describe('SetLogRow', () => {
  it('renders three visible labels', () => {
    const wrapper = mount(SetLogRow, { props: { set: emptySetLog(1, 'kg') } })
    expect(wrapper.text()).toContain('Reps')
    expect(wrapper.text()).toContain('RPE')
    expect(wrapper.text()).toContain('Load')
  })

  it('shows RPE error after blur, not while typing', async () => {
    const wrapper = mount(SetLogRow, { props: { set: emptySetLog(1, 'kg') } })
    const rpe = wrapper.get('input[aria-label="RPE"]')
    await rpe.setValue('7.2')
    expect(wrapper.text()).not.toContain('RPE is 1–10 in 0.5 steps')
    await rpe.trigger('blur')
    expect(wrapper.text()).toContain('RPE is 1–10 in 0.5 steps')
  })

  it('emits unit change from the chip', async () => {
    const wrapper = mount(SetLogRow, { props: { set: emptySetLog(1, 'kg') } })
    const plates = wrapper.findAll('[role="radio"]').find(w => w.text() === 'P')
    await plates!.trigger('click')
    const emitted = wrapper.emitted('update:set')?.[0]?.[0] as { unit: string }
    expect(emitted.unit).toBe('plates')
  })

  it('does not mark complete when kg load is empty', async () => {
    const wrapper = mount(SetLogRow, {
      props: {
        set: { ...emptySetLog(1, 'kg'), reps: 10, rpe: 8, load: null },
      },
    })
    await wrapper.get('[aria-label="Mark set complete"]').trigger('click')
    const emitted = wrapper.emitted('update:set')
    expect(emitted).toBeUndefined()
    expect(wrapper.text()).toContain('Load must be 0 or more')
  })
})

describe('SetLogRow extras', () => {
  it('shows Extra kg helper when unit is bodyweight', () => {
    const wrapper = mount(SetLogRow, { props: { set: emptySetLog(1, 'bw') } })
    expect(wrapper.text()).toContain('Load')
    expect(wrapper.text()).toContain('Extra kg (optional)')
  })

  it('emits completed set when fields are valid', async () => {
    const wrapper = mount(SetLogRow, {
      props: {
        set: { ...emptySetLog(1, 'kg'), reps: 10, rpe: 8, load: 70 },
      },
    })
    await wrapper.get('[aria-label="Mark set complete"]').trigger('click')
    expect(wrapper.emitted('update:set')?.[0]?.[0]).toMatchObject({
      completed: true,
      reps: 10,
      rpe: 8,
      load: 70,
    })
  })

  it('emits delete only after confirm', async () => {
    const wrapper = mount(SetLogRow, { props: { set: emptySetLog(1, 'kg') } })
    await wrapper.get('[aria-label="Delete set"]').trigger('click')
    expect(wrapper.emitted('delete')).toBeUndefined()
    expect(wrapper.get('[role="group"]').text()).toContain('Delete set?')
    const cancel = wrapper.findAll('button').find(w => w.text() === 'Cancel')
    await cancel!.trigger('click')
    expect(wrapper.find('[role="group"]').exists()).toBe(false)
    await wrapper.get('[aria-label="Delete set"]').trigger('click')
    const confirm = wrapper.findAll('button').find(w => w.text() === 'Delete')
    await confirm!.trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })
})
