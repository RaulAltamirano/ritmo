import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import BaseBottomSheet from './BaseBottomSheet.vue'

describe('BaseBottomSheet', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('no renderiza el diálogo cuando open es false', () => {
    const wrapper = mount(BaseBottomSheet, {
      props: { open: false, title: 'More' },
      attachTo: document.body,
    })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('abre con role=dialog, aria-modal y título asociado', async () => {
    const wrapper = mount(BaseBottomSheet, {
      props: { open: true, title: 'More', id: 'more-sheet' },
      slots: { default: '<button type="button">Journal</button>' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('id')).toBe('more-sheet')
    const labelledBy = dialog.attributes('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(wrapper.get('h2').text()).toContain('More')
    wrapper.unmount()
  })

  it('cierra con Escape y emite update:open false + close', async () => {
    const onUpdate = vi.fn()
    const onClose = vi.fn()
    mount(BaseBottomSheet, {
      props: {
        open: true,
        title: 'More',
        'onUpdate:open': onUpdate,
        onClose,
      },
      slots: { default: '<button type="button">Inside</button>' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    globalThis.window.dispatchEvent(
      new globalThis.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await nextTick()

    expect(onUpdate).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalled()
  })

  it('cierra al hacer clic en el backdrop', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(BaseBottomSheet, {
      props: {
        open: true,
        title: 'More',
        'onUpdate:open': onUpdate,
      },
      slots: { default: '<button type="button">Inside</button>' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    await wrapper.get('[data-testid="bottom-sheet-backdrop"]').trigger('click')
    expect(onUpdate).toHaveBeenCalledWith(false)
    wrapper.unmount()
  })
})
