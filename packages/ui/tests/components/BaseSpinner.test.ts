import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseSpinner from '../../src/components/atoms/display/BaseSpinner.vue'

describe('BaseSpinner', () => {
  it('renders circular variant as a ring without glow orbs', () => {
    const wrapper = mount(BaseSpinner, {
      props: { variant: 'circular', color: 'primary' },
    })

    expect(wrapper.find('.spinner-ring').exists()).toBe(true)
    expect(wrapper.findAll('.orbe')).toHaveLength(0)
    expect(wrapper.html()).not.toContain('box-shadow')
  })

  it('inherits currentColor when color is current', () => {
    const wrapper = mount(BaseSpinner, {
      props: { variant: 'circular', color: 'current' },
    })

    expect(wrapper.find('.spinner-ring').attributes('style')).toMatch(
      /--spinner-color:\s*currentColor/,
    )
  })

  it('renders dots variant', () => {
    const wrapper = mount(BaseSpinner, {
      props: { variant: 'dots', color: 'white' },
    })

    const dotCount = 3
    expect(wrapper.findAll('.rounded-full')).toHaveLength(dotCount)
  })
})
