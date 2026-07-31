import { flushPromises, mount } from '@vue/test-utils'
import TaskSwitchPresetModal from '@/components/molecules/TaskSwitchPresetModal.vue'
import { useSessionGateStore } from '@/stores/sessionGate'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const applyMock = vi.fn()

vi.mock('@/composables/timer/applyRemoteTaskSwitch', () => ({
  applyRemoteTaskSwitch: (...args: unknown[]) => applyMock(...args),
}))

const stubs = {
  BaseModal: {
    name: 'BaseModal',
    props: ['isOpen', 'title', 'closeOnEscape'],
    emits: ['update:isOpen'],
    template: '<div><slot /><slot name="footer" /></div>',
  },
  BaseButton: {
    props: ['disabled'],
    emits: ['click'],
    template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
}

const prompt = {
  toTask: { id: 'b', name: 'B' },
  mode: { minutes: 25, name: 'Pomodoro', presetKey: '25_5' },
  remainingSec: 600,
  canContinueRemaining: true,
  fromTaskName: 'A',
}

function mountModal() {
  return mount(TaskSwitchPresetModal, { global: { stubs } })
}

function button(wrapper: ReturnType<typeof mountModal>, label: string) {
  return wrapper.findAll('button').find(candidate => candidate.text().includes(label))
}

describe('TaskSwitchPresetModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    applyMock.mockReset()
    applyMock.mockResolvedValue(undefined)
  })

  it('shows remaining time and hides continuing when it does not fit', () => {
    const gate = useSessionGateStore()
    gate.openTaskSwitchPrompt({
      ...prompt,
      remainingSec: 3000,
      canContinueRemaining: false,
    })

    const wrapper = mountModal()

    expect(wrapper.text()).toContain('Quedan 50:00 en «A»')
    expect(wrapper.text()).toContain('El tiempo restante no cabe en el bloque de esta tarea.')
    expect(button(wrapper, 'Continuar restante')).toBeUndefined()
    expect(button(wrapper, 'Arrancar 25 min')).toBeTruthy()
  })

  it('applies the remaining duration then closes the prompt', async () => {
    const gate = useSessionGateStore()
    gate.openTaskSwitchPrompt({
      ...prompt,
      mode: { minutes: 90, name: 'Largo', presetKey: '90_20' },
    })

    const wrapper = mountModal()
    await button(wrapper, 'Continuar restante')!.trigger('click')
    await flushPromises()

    expect(applyMock).toHaveBeenCalledWith({
      toTask: prompt.toTask,
      mode: { minutes: 90, name: 'Largo', presetKey: '90_20' },
      durationPolicy: 'remaining',
    })
    expect(gate.taskSwitchPrompt).toBeNull()
  })

  it('applies the full preset and closes even when apply rejects', async () => {
    const gate = useSessionGateStore()
    gate.openTaskSwitchPrompt(prompt)
    applyMock.mockRejectedValueOnce(new Error('apply failed'))

    const wrapper = mountModal()
    const vm = wrapper.vm as unknown as {
      choose: (policy: 'full_preset') => Promise<void>
    }
    await expect(vm.choose('full_preset')).rejects.toThrow('apply failed')

    expect(applyMock).toHaveBeenCalledWith({
      toTask: prompt.toTask,
      mode: prompt.mode,
      durationPolicy: 'full_preset',
    })
    expect(gate.taskSwitchPrompt).toBeNull()
  })

  it('cancels without applying a switch', async () => {
    const gate = useSessionGateStore()
    gate.openTaskSwitchPrompt(prompt)

    const wrapper = mountModal()
    await button(wrapper, 'Cancelar')!.trigger('click')

    expect(applyMock).not.toHaveBeenCalled()
    expect(gate.taskSwitchPrompt).toBeNull()
  })

  it('treats modal close as cancel', async () => {
    const gate = useSessionGateStore()
    gate.openTaskSwitchPrompt(prompt)

    const wrapper = mountModal()
    wrapper.findComponent({ name: 'BaseModal' }).vm.$emit('update:isOpen', false)
    await wrapper.vm.$nextTick()

    expect(applyMock).not.toHaveBeenCalled()
    expect(gate.taskSwitchPrompt).toBeNull()
  })
})
