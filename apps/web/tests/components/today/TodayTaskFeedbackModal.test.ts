import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TodayTaskFeedbackModal from '@/components/organisms/today/TodayTaskFeedbackModal.vue'

const createWrapper = () =>
  mount(TodayTaskFeedbackModal, {
    props: {
      isOpen: true,
      task: {
        id: 'task-1',
        name: 'Preparar presentación',
        title: 'Preparar presentación',
        createdAt: new Date('2026-04-19T09:00:00.000Z'),
      },
    },
    global: {
      stubs: {
        BaseModal: {
          props: ['isOpen', 'title'],
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
      },
    },
  })

describe('TodayTaskFeedbackModal', () => {
  it('renders the MVP questions and progress flow', async () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Paso 1 de 3')
    expect(wrapper.text()).toContain('¿Con cuánta energía terminas?')
    expect(wrapper.text()).toContain('¿Esta tarea encajó bien con este momento del día?')

    await wrapper.get('button[aria-label="Energia 4 de 5"]').trigger('click')
    await wrapper.get('button[aria-label="Momento del dia si"]').trigger('click')
    await wrapper.get('button[aria-label="Continuar al paso 2"]').trigger('click')

    expect(wrapper.text()).toContain('Paso 2 de 3')
    expect(wrapper.text()).toContain('¿Qué tan concentrado estuviste?')
    expect(wrapper.text()).toContain('¿Cuánto avanzaste de verdad?')
    expect(wrapper.text()).toContain('¿Qué tan demandante fue?')
  })

  it('keeps submit disabled until all answers are selected and emits the payload', async () => {
    const wrapper = createWrapper()

    await wrapper.get('button[aria-label="Energia 3 de 5"]').trigger('click')
    await wrapper.get('button[aria-label="Momento del dia mas o menos"]').trigger('click')
    await wrapper.get('button[aria-label="Continuar al paso 2"]').trigger('click')

    await wrapper.get('button[aria-label="Enfoque 4 de 5"]').trigger('click')
    await wrapper.get('button[aria-label="Progreso 5 de 5"]').trigger('click')
    await wrapper.get('button[aria-label="Carga mental 3 de 5"]').trigger('click')
    await wrapper.get('button[aria-label="Continuar al paso 3"]').trigger('click')

    const submitButton = wrapper.get('button[aria-label="Enviar feedback de cierre"]')
    expect(submitButton.attributes('disabled')).toBeDefined()

    await wrapper.get('button[aria-label="Bloqueador distracciones"]').trigger('click')

    expect(submitButton.attributes('disabled')).toBeUndefined()
    await submitButton.trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          energyAfter: 3,
          focusScore: 4,
          progressScore: 5,
          mentalDemand: 3,
          timeFit: 'mixed',
          mainBlocker: 'distractions',
        },
      ],
    ])
  })
})
