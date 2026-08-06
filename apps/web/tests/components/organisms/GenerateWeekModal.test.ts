import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GenerateWeekModal from '@/components/organisms/GenerateWeekModal.vue'

const stubs = {
  BaseModal: {
    props: ['isOpen'],
    emits: ['update:isOpen', 'close'],
    template:
      '<div v-if="isOpen"><div data-testid="base-modal"><slot /></div><div><slot name="footer" /></div></div>',
  },
  BaseButton: {
    props: ['disabled', 'loading', 'variant', 'size', 'type'],
    emits: ['click'],
    template:
      '<button :disabled="disabled || loading" :type="type || \'button\'" @click="$emit(\'click\', $event)"><slot /></button>',
  },
}

function mountModal() {
  return mount(GenerateWeekModal, {
    props: {
      isOpen: true,
      planName: 'Japanese B2',
      planId: 'plan-1',
      weekStart: new Date(2026, 7, 3),
      daysPerWeek: 4,
      minutesPerSession: 45,
    },
    global: { stubs },
  })
}

describe('GenerateWeekModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts on chat step with generate preview disabled', () => {
    const wrapper = mountModal()
    expect(wrapper.text()).toContain('Step 1 of 2')
    expect(wrapper.text()).toContain('Generate week')
    const previewBtn = wrapper.get('button[aria-label="Generate preview"]')
    expect(previewBtn.attributes('disabled')).toBeDefined()
  })

  it('enables preview after core answers and applies draft', async () => {
    const wrapper = mountModal()
    const textarea = wrapper.get('textarea')
    const send = wrapper.get('button[aria-label="Send message"]')

    for (const text of ['intermediate', 'speaking', 'no grammar']) {
      await textarea.setValue(text)
      await send.trigger('click')
    }

    const previewBtn = wrapper.get('button[aria-label="Generate preview"]')
    expect(previewBtn.attributes('disabled')).toBeUndefined()
    await previewBtn.trigger('click')
    await vi.advanceTimersByTimeAsync(200)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Step 2 of 2')
    expect(wrapper.text()).toContain('Preview week')

    await wrapper.get('button[aria-label="Apply week"]').trigger('click')
    const applied = wrapper.emitted('apply')?.[0]?.[0] as { weekStart: string }
    expect(applied.weekStart).toBe('2026-08-03')
  })

  it('Not now closes without apply', async () => {
    const wrapper = mountModal()
    await wrapper.get('button[aria-label="Not now"]').trigger('click')
    expect(wrapper.emitted('apply')).toBeUndefined()
    expect(wrapper.emitted('close')?.length).toBeGreaterThan(0)
  })
})
