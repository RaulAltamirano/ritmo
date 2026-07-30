import { mount } from '@vue/test-utils'
import { Calendar, Clock, Menu } from 'lucide-vue-next'
import { describe, expect, it, vi } from 'vitest'
import { markRaw } from 'vue'
import BaseBottomNav from './BaseBottomNav.vue'

const sampleItems = [
  { key: 'today', label: 'Today', icon: markRaw(Calendar), path: '/today' },
  { key: 'schedule', label: 'Schedule', icon: markRaw(Clock), path: '/schedule' },
  { key: 'more', label: 'More', icon: markRaw(Menu), isMore: true },
]

describe('BaseBottomNav', () => {
  it('renderiza como nav con aria-label', () => {
    const wrapper = mount(BaseBottomNav, {
      props: { items: sampleItems, ariaLabel: 'Primary' },
    })
    const nav = wrapper.get('nav')
    expect(nav.attributes('aria-label')).toBe('Primary')
  })

  it('renderiza un botón por ítem con label e icono', () => {
    const wrapper = mount(BaseBottomNav, {
      props: { items: sampleItems },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toContain('Today')
    expect(buttons[2].text()).toContain('More')
  })

  it('marca el ítem activo con aria-current="page"', () => {
    const wrapper = mount(BaseBottomNav, {
      props: { items: sampleItems, activeKey: 'today' },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('aria-current')).toBe('page')
    expect(buttons[1].attributes('aria-current')).toBeUndefined()
  })

  it('emite navigate con path al pulsar un tab de destino', async () => {
    const onNavigate = vi.fn()
    const wrapper = mount(BaseBottomNav, {
      props: {
        items: sampleItems,
        onNavigate,
      },
    })
    await wrapper.findAll('button')[1].trigger('click')
    expect(onNavigate).toHaveBeenCalledWith('/schedule')
  })

  it('emite more-toggle (no navigate) al pulsar More', async () => {
    const onNavigate = vi.fn()
    const onMoreToggle = vi.fn()
    const wrapper = mount(BaseBottomNav, {
      props: {
        items: sampleItems,
        onNavigate,
        onMoreToggle,
      },
    })
    await wrapper.findAll('button')[2].trigger('click')
    expect(onMoreToggle).toHaveBeenCalledTimes(1)
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('More expone aria-expanded según moreExpanded', () => {
    const wrapper = mount(BaseBottomNav, {
      props: {
        items: sampleItems,
        moreExpanded: true,
        moreControlsId: 'more-sheet',
      },
    })
    const more = wrapper.findAll('button')[2]
    expect(more.attributes('aria-expanded')).toBe('true')
    expect(more.attributes('aria-controls')).toBe('more-sheet')
  })

  it('aplica min touch target en cada tab', () => {
    const wrapper = mount(BaseBottomNav, {
      props: { items: sampleItems },
    })
    const btn = wrapper.get('button')
    expect(btn.classes().join(' ')).toMatch(/min-h-11|min-h-\[44px\]/)
  })
})
