import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TodayPage from '@/pages/today/index.vue'

const mockActivities = ref([
  {
    id: 'activity-1',
    title: 'Estudiar algoritmos',
    type: 'STUDY',
    priority: 'HIGH',
    duration: 45,
    isCompleted: false,
    description: '',
    createdAt: '2026-04-19T09:00:00.000Z',
    updatedAt: '2026-04-19T09:00:00.000Z',
    startTime: '2026-04-19T09:00:00.000Z',
    endTime: '2026-04-19T09:45:00.000Z',
    tags: [],
  },
])

const fetchTodayActivities = vi.fn()
const createActivity = vi.fn()
const deleteActivity = vi.fn()
const markActivityCompleted = vi.fn()

vi.mock('@/composables/tasks/useActivities', () => ({
  useActivities: () => ({
    todayActivities: mockActivities,
    createActivity,
    deleteActivity,
    fetchTodayActivities,
    markActivityCompleted,
  }),
}))

vi.mock('@/composables/tasks/useActivityAdapter', () => ({
  useActivityAdapter: () => ({
    activitiesToTasks: (activities: typeof mockActivities.value) =>
      activities.map(activity => ({
        id: activity.id,
        name: activity.title,
        title: activity.title,
        createdAt: new Date(activity.createdAt),
        category: 'Estudio',
        priority: 'alta' as const,
        completed: activity.isCompleted,
        duration: `${activity.duration}m`,
      })),
  }),
}))

vi.mock('@/composables/useCircadian', () => ({
  useCircadian: () => ({
    isLoading: ref(false),
    getPhaseDataForHeader: { color: '#94a3b8', name: 'Focus' },
  }),
}))

vi.mock('@/stores/timer', () => ({
  useTimerStore: () => ({
    loadPreferences: vi.fn(),
    loadDaySummary: vi.fn(),
  }),
}))

const createWrapper = () =>
  mount(TodayPage, {
    global: {
      stubs: {
        TodayHeader: { template: '<div />' },
        QuickTaskInput: { template: '<div />' },
        TaskFilters: { template: '<div />' },
        TaskNoteModal: { template: '<div />' },
        TaskEditModal: { template: '<div />' },
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

describe('today feedback flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActivities.value = [
      {
        id: 'activity-1',
        title: 'Estudiar algoritmos',
        type: 'STUDY',
        priority: 'HIGH',
        duration: 45,
        isCompleted: false,
        description: '',
        createdAt: '2026-04-19T09:00:00.000Z',
        updatedAt: '2026-04-19T09:00:00.000Z',
        startTime: '2026-04-19T09:00:00.000Z',
        endTime: '2026-04-19T09:45:00.000Z',
        tags: [],
      },
    ]
    fetchTodayActivities.mockResolvedValue(undefined)
    createActivity.mockResolvedValue({ success: true, activity: null })
    deleteActivity.mockResolvedValue({ success: true })
    markActivityCompleted.mockImplementation((id: string) => {
      const activity = mockActivities.value.find(item => item.id === id)
      if (activity) {
        activity.isCompleted = true
      }
      return Promise.resolve({ success: true })
    })
  })

  it('does not complete the task when the modal is closed', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    await wrapper.get('button[aria-label="Mark as completed"]').trigger('click')
    expect(wrapper.get('[data-testid="base-modal"]').exists()).toBe(true)

    await wrapper
      .get('button[aria-label="Close task feedback"]')
      .trigger('click')

    expect(markActivityCompleted).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="base-modal"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Mark as completed"]').exists()).toBe(
      true,
    )
  })

  it('completes the activity only after submitting the required feedback', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    await wrapper.get('button[aria-label="Mark as completed"]').trigger('click')

    await wrapper.get('button[aria-label="Energy 4 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Time of day: yes"]').trigger('click')
    await wrapper.get('button[aria-label="Continue to step 2"]').trigger('click')
    await wrapper.get('button[aria-label="Focus 5 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Progress 4 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Mental load 3 of 5"]').trigger('click')
    await wrapper.get('button[aria-label="Continue to step 3"]').trigger('click')
    await wrapper.get('button[aria-label="Blocker none"]').trigger('click')
    await wrapper
      .get('button[aria-label="Submit completion feedback"]')
      .trigger('click')
    await flushPromises()

    expect(markActivityCompleted).toHaveBeenCalledWith('activity-1', true)
    expect(wrapper.find('[data-testid="base-modal"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Mark as completed"]').exists()).toBe(
      false,
    )
  })
})
