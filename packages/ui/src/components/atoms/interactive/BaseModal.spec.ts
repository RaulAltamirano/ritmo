import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import BaseModal from './BaseModal.vue'

describe('BaseModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('no renderiza el diálogo cuando isOpen es false', () => {
    const wrapper = mount(BaseModal, {
      props: { isOpen: false, title: 'Título' },
      attachTo: document.body,
    })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('con título: expone aria-modal, aria-labelledby y un h2 asociado', async () => {
    const wrapper = mount(BaseModal, {
      props: { isOpen: true, title: 'Mi modal' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    const labelledBy = dialog.attributes('aria-labelledby')
    expect(labelledBy).toBeTruthy()

    const heading = wrapper.get('h2')
    expect(heading.text()).toContain('Mi modal')
    expect(heading.attributes('id')).toBe(labelledBy)
    wrapper.unmount()
  })

  it('respeta aria-describedby cuando se pasa la prop', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        isOpen: true,
        title: 'T',
        ariaDescribedby: 'modal-help',
      },
      slots: {
        default: '<p id="modal-help">Texto de ayuda</p>',
      },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    expect(wrapper.get('[role="dialog"]').attributes('aria-describedby')).toBe(
      'modal-help',
    )
    wrapper.unmount()
  })

  it('sin título visible usa aria-label cuando no hay slot header', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        isOpen: true,
        title: '',
        showCloseButton: false,
        ariaLabel: 'Confirmación',
      },
      slots: { default: '<button type="button">OK</button>' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-label')).toBe('Confirmación')
    expect(dialog.attributes('aria-labelledby')).toBeUndefined()
    wrapper.unmount()
  })

  it('cierra con Escape y emite update:isOpen y close', async () => {
    const onUpdate = vi.fn()
    const onClose = vi.fn()

    mount(BaseModal, {
      props: {
        isOpen: true,
        title: 'T',
        closeOnEscape: true,
        'onUpdate:isOpen': onUpdate,
        onClose,
      },
      slots: { default: '<button type="button">Dentro</button>' },
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

  it('cierra al hacer clic en el backdrop (fuera del panel)', async () => {
    const onUpdate = vi.fn()

    const wrapper = mount(BaseModal, {
      props: {
        isOpen: true,
        title: 'T',
        closeOnBackdropClick: true,
        'onUpdate:isOpen': onUpdate,
      },
      slots: { default: '<button type="button">Dentro</button>' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    const backdrop = wrapper.find('[role="dialog"] > .absolute.inset-0')
    expect(backdrop.exists()).toBe(true)
    await backdrop.trigger('click')
    await nextTick()

    expect(onUpdate).toHaveBeenCalledWith(false)
    wrapper.unmount()
  })

  it('no cierra al hacer clic dentro del panel', async () => {
    const onUpdate = vi.fn()

    const wrapper = mount(BaseModal, {
      props: {
        isOpen: true,
        title: 'T',
        closeOnBackdropClick: true,
        'onUpdate:isOpen': onUpdate,
      },
      slots: { default: '<button type="button" class="inner-action">Dentro</button>' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    await wrapper.get('.inner-action').trigger('click')
    await nextTick()

    expect(onUpdate).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('con preventScroll bloquea overflow del body al abrir', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        isOpen: true,
        title: 'T',
        preventScroll: true,
      },
      slots: { default: '<button type="button">x</button>' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ isOpen: false })
    await flushPromises()
    await nextTick()

    expect(document.body.style.overflow).toBe('')
    wrapper.unmount()
  })

  it('blur backdrop renders separate blur and scrim layers', async () => {
    const wrapper = mount(BaseModal, {
      props: { isOpen: true, title: 'T', backdrop: 'blur' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    expect(wrapper.find('.modal-backdrop-blur').exists()).toBe(true)
    expect(wrapper.find('.modal-backdrop-scrim').exists()).toBe(true)
    wrapper.unmount()
  })

  it('dark backdrop has scrim only (no blur layer)', async () => {
    const wrapper = mount(BaseModal, {
      props: { isOpen: true, title: 'T', backdrop: 'dark' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    expect(wrapper.find('.modal-backdrop-blur').exists()).toBe(false)
    expect(wrapper.find('.modal-backdrop-scrim').exists()).toBe(true)
    wrapper.unmount()
  })

  it('expone aria-label accesible en el botón cerrar', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        isOpen: true,
        title: 'T',
        closeButtonLabel: 'Cerrar ventana',
        showCloseButton: true,
      },
      slots: { default: '<p>Contenido</p>' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    const closeBtn = wrapper.find('button[aria-label="Cerrar ventana"]')
    expect(closeBtn.exists()).toBe(true)
    wrapper.unmount()
  })
})
