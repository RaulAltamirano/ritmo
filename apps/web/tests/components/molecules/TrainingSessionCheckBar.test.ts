import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TrainingSessionCheckBar from '@/components/molecules/TrainingSessionCheckBar.vue'
import {
  emptySessionCheck,
  saveSessionCheckEnd,
  saveSessionCheckStart,
  skipSessionCheckPhase,
} from '@/utils/trainingSessionCheck'

const stubs = {
  BaseButton: {
    props: ['variant', 'size', 'disabled', 'icon', 'ariaLabel'],
    emits: ['click'],
    template:
      '<button :data-variant="variant" :data-has-icon="Boolean(icon)" :aria-label="ariaLabel" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
}

function mountBar(check = emptySessionCheck('d'), plannedComplete = false) {
  return mount(TrainingSessionCheckBar, {
    props: { sessionCheck: check, plannedComplete },
    global: { stubs },
  })
}

describe('TrainingSessionCheckBar', () => {
  it('shows Check in and outline Finish session with icons when nothing is saved', () => {
    const wrapper = mountBar()
    const checkIn = wrapper.get('[aria-label="Check in"]')
    expect(checkIn.text()).toContain('Check in')
    expect(checkIn.attributes('data-has-icon')).toBe('true')
    const finish = wrapper.get('[aria-label="Finish session"]')
    expect(finish.text()).toContain('Finish session')
    expect(finish.attributes('data-has-icon')).toBe('true')
    expect(finish.attributes('data-variant')).toBe('outline')
    expect(wrapper.find('[data-testid="session-check-status-start"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="session-check-status-end"]').exists()).toBe(false)
  })

  it('hides Check in after save, shows start status chip, and emits check-in when skipped', async () => {
    const skipped = skipSessionCheckPhase(emptySessionCheck('d'), 'start')
    const wrapper = mountBar(skipped)
    await wrapper.get('[aria-label="Check in"]').trigger('click')
    expect(wrapper.emitted('check-in')).toHaveLength(1)

    const saved = saveSessionCheckStart(emptySessionCheck('d'), {
      preparation: 3,
      motivation: 3,
      strength: 3,
    })
    await wrapper.setProps({ sessionCheck: saved })
    expect(wrapper.find('[aria-label="Check in"]').exists()).toBe(false)
    const startChip = wrapper.get('[data-testid="session-check-status-start"]')
    expect(startChip.text()).toContain('Checked in')
    expect(startChip.attributes('role')).toBe('status')
  })

  it('makes Finish session primary when planned sets are complete and swaps to end chip after wrap-up', async () => {
    const wrapper = mountBar(emptySessionCheck('d'), true)
    const finish = wrapper.get('[aria-label="Finish session"]')
    expect(finish.attributes('data-variant')).toBe('primary')
    expect(finish.attributes('data-has-icon')).toBe('true')
    await finish.trigger('click')
    expect(wrapper.emitted('finish-session')).toHaveLength(1)

    const wrapped = saveSessionCheckEnd(emptySessionCheck('d'), {
      fatigue: 2,
      pain: 1,
      strength: 2,
    })
    await wrapper.setProps({ sessionCheck: wrapped })
    expect(wrapper.find('[aria-label="Finish session"]').exists()).toBe(false)
    const endChip = wrapper.get('[data-testid="session-check-status-end"]')
    expect(endChip.text()).toContain('Wrapped up')
    expect(endChip.attributes('role')).toBe('status')
  })
})
