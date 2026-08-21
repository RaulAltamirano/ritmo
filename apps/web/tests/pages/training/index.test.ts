import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TrainingPage from '@/pages/training/index.vue'

const api = vi.hoisted(() => ({
  getWeek: vi.fn(),
}))

vi.mock('@/composables/useTrainingApi', () => ({
  useTrainingApi: () => api,
}))

function mountPage() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return shallowMount(TrainingPage, {
    global: {
      plugins: [pinia],
      stubs: {
        PageHeader: {
          props: ['title'],
          template: '<header><h1>{{ title }}</h1><slot name="actions" /></header>',
        },
        PlanAiWeekGenerator: {
          emits: ['open'],
          template: '<button @click="$emit(\'open\')">Generate week</button>',
        },
        PlanWeekStrip: true,
        TrainingDaySession: true,
        TrainingExportButton: true,
        TrainingGenerateWeekModal: true,
      },
    },
  })
}

describe('training page', () => {
  beforeEach(() => {
    api.getWeek.mockResolvedValue(null)
  })

  it('loads the remote week and offers generation for an empty week', async () => {
    const wrapper = mountPage()

    await vi.waitFor(() => expect(api.getWeek).toHaveBeenCalledTimes(1))
    expect(wrapper.text()).toContain('Rest day')
    expect(wrapper.text()).toContain('Generate week')
    expect(wrapper.text()).not.toContain('Not saved remotely')
  })
})
