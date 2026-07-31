import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import BaseModal from './BaseModal.vue'

const dialogEl = () =>
  document.body.querySelector<HTMLElement>('[role="dialog"].modal')

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
    expect(dialogEl()).toBeNull()
    wrapper.unmount()
  })

  it('con título: expone aria-modal, aria-labelledby y un h2 asociado', async () => {
    const wrapper = mount(BaseModal, {
      props: { isOpen: true, title: 'Mi modal' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    const dialog = dialogEl()
    expect(dialog).toBeTruthy()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    const labelledBy = dialog?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()

    const heading = dialog?.querySelector('h2')
    expect(heading?.textContent).toContain('Mi modal')
    expect(heading?.getAttribute('id')).toBe(labelledBy)
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

    expect(dialogEl()?.getAttribute('aria-describedby')).toBe('modal-help')
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

    const dialog = dialogEl()
    expect(dialog?.getAttribute('aria-label')).toBe('Confirmación')
    expect(dialog?.getAttribute('aria-labelledby')).toBeNull()
    wrapper.unmount()
  })

  it('cierra con Escape y emite update:isOpen y close', async () => {
    const onUpdate = vi.fn()
    const onClose = vi.fn()

    const wrapper = mount(BaseModal, {
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
    wrapper.unmount()
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

    const backdrop = dialogEl()?.querySelector<HTMLElement>(':scope > .absolute.inset-0')
    expect(backdrop).toBeTruthy()
    backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
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
      slots: {
        default: '<button type="button" class="inner-action">Dentro</button>',
      },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    dialogEl()
      ?.querySelector('.inner-action')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
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

  it('teleports the dialog to document.body', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const wrapper = mount(BaseModal, {
      props: { isOpen: true, title: 'T' },
      attachTo: host,
    })
    await flushPromises()
    await nextTick()

    const dialog = dialogEl()
    expect(dialog).toBeTruthy()
    // Must leave the component host (Teleport); parent may be body or a VTU transition stub.
    expect(host.contains(dialog)).toBe(false)
    wrapper.unmount()
    host.remove()
  })

  it('blur backdrop renders separate blur and scrim layers', async () => {
    const wrapper = mount(BaseModal, {
      props: { isOpen: true, title: 'T', backdrop: 'blur' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    const dialog = dialogEl()
    expect(dialog?.querySelector('.modal-backdrop-blur')).toBeTruthy()
    expect(dialog?.querySelector('.modal-backdrop-scrim')).toBeTruthy()
    expect(dialog?.querySelector('.modal-ambient-glow')).toBeTruthy()
    wrapper.unmount()
  })

  it('dark backdrop has scrim only (no blur layer)', async () => {
    const wrapper = mount(BaseModal, {
      props: { isOpen: true, title: 'T', backdrop: 'dark' },
      attachTo: document.body,
    })
    await flushPromises()
    await nextTick()

    const dialog = dialogEl()
    expect(dialog?.querySelector('.modal-backdrop-blur')).toBeNull()
    expect(dialog?.querySelector('.modal-backdrop-scrim')).toBeTruthy()
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

    const closeBtn = dialogEl()?.querySelector(
      'button[aria-label="Cerrar ventana"]',
    )
    expect(closeBtn).toBeTruthy()
    wrapper.unmount()
  })
})
