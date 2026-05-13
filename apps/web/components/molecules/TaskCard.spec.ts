import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from './TaskCard.vue'
import type { Task } from '../../types/task'

function baseTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    name: 'Nombre',
    createdAt: new Date(),
    ...overrides,
  }
}

describe('TaskCard', () => {
  it('renderiza el título preferente (title sobre name)', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({ title: 'Mi título', name: 'Nombre interno' }),
      },
    })
    expect(wrapper.get('[data-testid="task-card"]').text()).toContain('Mi título')
  })

  it('usa fallback cuando title y name están vacíos', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({ title: '', name: '   ' }),
      },
    })
    expect(wrapper.text()).toContain('Sin título')
    const clickable = wrapper.find('button.tcard-content--clickable')
    expect(clickable.attributes('aria-label')).toContain('Sin título')
  })

  it('emite open-edit al clic en el área principal', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask({ title: 'X' }) },
    })
    await wrapper.find('button.tcard-content--clickable').trigger('click')
    expect(wrapper.emitted('open-edit')).toHaveLength(1)
  })

  it('emite open-edit con Enter y Space', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask({ title: 'X' }) },
    })
    const zone = wrapper.find('button.tcard-content--clickable')
    await zone.trigger('keydown.enter')
    await zone.trigger('keydown.space')
    expect(wrapper.emitted('open-edit')?.length).toBe(2)
  })

  it('emite start-timer sin propagar al área editable', async () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({ title: 'Timer', completed: false, isRunning: false }),
      },
    })
    const btn = wrapper.find('.tcard-actions').findAll('button')[0]
    await btn.trigger('click')
    expect(wrapper.emitted('start-timer')).toHaveLength(1)
    expect(wrapper.emitted('open-edit')).toBeUndefined()
  })

  it('emite request-complete y delete-task', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask({ title: 'Y', completed: false }) },
    })
    const buttons = wrapper.find('.tcard-actions').findAll('button')
    await buttons[1].trigger('click')
    await buttons[2].trigger('click')
    expect(wrapper.emitted('request-complete')).toHaveLength(1)
    expect(wrapper.emitted('delete-task')).toHaveLength(1)
  })

  it('no muestra botones en la barra de acciones cuando está completada', () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask({ title: 'Hecha', completed: true }) },
    })
    expect(wrapper.find('.tcard-actions').findAll('button')).toHaveLength(0)
    expect(wrapper.find('button.tcard-content--clickable').exists()).toBe(true)
  })

  it('formatea tiempo restante con valores no finitos como 00:00', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({
          title: 'NaN',
          completed: false,
          isRunning: true,
          timeRemaining: Number.NaN,
        }),
      },
    })
    expect(wrapper.text()).toMatch(/00:00/)
  })

  it('no muestra tiempo acumulado corrupto como NaN', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({
          title: 'Acum',
          totalTimeSpent: Number.NaN,
        }),
      },
    })
    expect(wrapper.text()).not.toMatch(/NaN/)
  })

  it('aplica clase de arrastre cuando isDragging es true', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({ title: 'Drag' }),
        isDragging: true,
      },
    })
    expect(wrapper.get('[data-testid="task-card"]').classes()).toContain(
      'tcard--dragging',
    )
  })

  it('muestra el grip cuando showDragHandle es true', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({ title: 'Grip' }),
        showDragHandle: true,
      },
    })
    expect(wrapper.find('.tcard-grip').exists()).toBe(true)
  })

  it('prioridad desconocida usa estilo neutro sin romper', () => {
    const task = baseTask({ title: 'Rare' })
    ;(task as { priority?: string }).priority = 'desconocida'
    const wrapper = mount(TaskCard, { props: { task } })
    expect(wrapper.find('[data-testid="task-card"]').exists()).toBe(true)
  })

  it('título extremadamente largo sigue montando sin error', () => {
    const long = 'x'.repeat(20000)
    const wrapper = mount(TaskCard, {
      props: { task: baseTask({ title: long }) },
    })
    expect(wrapper.find('.tcard-title').text().length).toBeGreaterThan(1000)
  })

  it('timeRemaining muy alto formatea sin overflow visible', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: baseTask({
          title: 'Maratón',
          isRunning: true,
          timeRemaining: 359999,
        }),
      },
    })
    expect(wrapper.text()).toMatch(/5999:59/)
  })
})
