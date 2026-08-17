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
    props: ['variant', 'size', 'disabled'],
    emits: ['click'],
    template:
      '<button :data-variant="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
}

function mountBar(check = emptySessionCheck('d'), plannedComplete = false) {
  return mount(TrainingSessionCheckBar, {
    props: { sessionCheck: check, plannedComplete },
    global: { stubs },
  })
}

describe('TrainingSessionCheckBar', () => {
  it('shows Check in and outline Finish session when nothing is saved', () => {
    const wrapper = mountBar()
    expect(wrapper.get('[aria-label="Check in"]').text()).toBe('Check in')
    const finish = wrapper.get('[aria-label="Finish session"]')
    expect(finish.text()).toBe('Finish session')
    expect(finish.attributes('data-variant')).toBe('outline')
    expect(wrapper.text()).not.toContain('Checked in')
    expect(wrapper.text()).not.toContain('Wrapped up')
  })

  it('hides Check in after save and emits check-in when skipped', async () => {
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
    expect(wrapper.text()).toContain('Checked in')
  })

  it('makes Finish session primary when planned sets are complete and hides it after wrap-up', async () => {
    const wrapper = mountBar(emptySessionCheck('d'), true)
    expect(wrapper.get('[aria-label="Finish session"]').attributes('data-variant')).toBe(
      'primary',
    )
    await wrapper.get('[aria-label="Finish session"]').trigger('click')
    expect(wrapper.emitted('finish-session')).toHaveLength(1)

    const wrapped = saveSessionCheckEnd(emptySessionCheck('d'), {
      fatigue: 2,
      pain: 1,
      strength: 2,
    })
    await wrapper.setProps({ sessionCheck: wrapped })
    expect(wrapper.find('[aria-label="Finish session"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Wrapped up')
  })
})
