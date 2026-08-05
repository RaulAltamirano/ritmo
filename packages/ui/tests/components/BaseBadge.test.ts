import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseBadge from '../../src/components/atoms/feedback/BaseBadge.vue'

describe('BaseBadge appearance', () => {
  it('defaults to a soft tint chip, not a solid fill', () => {
    const wrapper = mount(BaseBadge, {
      props: { variant: 'info', content: 'system' },
    })

    expect(wrapper.classes()).toContain('rounded-full')
    expect(wrapper.classes()).toContain('bg-cyan-100')
    expect(wrapper.classes()).toContain('text-cyan-700')
    expect(wrapper.classes()).not.toContain('bg-cyan-600')
    expect(wrapper.classes()).not.toContain('dark:bg-cyan-500')
  })

  it('supports solid appearance for high emphasis', () => {
    const wrapper = mount(BaseBadge, {
      props: { variant: 'info', appearance: 'solid', content: 'Alert' },
    })

    expect(wrapper.classes()).toContain('bg-cyan-600')
    expect(wrapper.classes()).toContain('text-white')
  })
})

describe('BaseBadge accessibility', () => {
  it('omits role and aria-pressed when not clickable', () => {
    const wrapper = mount(BaseBadge, {
      props: { content: 'system' },
    })

    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-pressed')).toBeUndefined()
  })

  it('exposes button semantics when clickable', () => {
    const wrapper = mount(BaseBadge, {
      props: { content: 'Filter', clickable: true },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('aria-pressed')).toBe('false')
  })

  it('does not bind disabled on non-button hosts', () => {
    const wrapper = mount(BaseBadge, {
      props: { content: 'Locked', disabled: true },
    })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.classes()).toContain('opacity-50')
  })
})

describe('BaseBadge icons', () => {
  it('resolves alert icon alias to a Lucide icon', () => {
    const wrapper = mount(BaseBadge, {
      props: { content: 'Disabled', leftIcon: 'alert', variant: 'warning' },
    })

    expect(wrapper.find('[data-testid="base-icon"]').exists()).toBe(true)
  })
})
