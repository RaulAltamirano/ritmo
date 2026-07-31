import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import TodayLayout from '@/components/organisms/today/TodayLayout.vue'
import type { Task } from '@/types/task'

const timerState = {
  activeTask: null as { id: string; name: string } | null,
  remoteWorkSessionId: null as string | null,
}

vi.mock('@/stores/timer', () => ({
  useTimerStore: () => timerState,
}))

vi.mock('@/components/molecules/AbandonedWorkSessionBanner.vue', () => ({
  default: { template: '<div />' },
}))

vi.mock('@/components/organisms/today/TodayHeader.vue', () => ({
  default: { template: '<div />' },
}))

vi.mock('@/components/organisms/today/TodayContent.vue', () => ({
  default: {
    props: ['tasks', 'isQuickTaskLoading'],
    emits: ['request-complete'],
    template:
      '<button data-testid="req-complete" @click="$emit(\'request-complete\', tasks[0])">go</button>',
  },
}))

vi.mock('@/components/organisms/today/TodayTaskFeedbackModal.vue', () => ({
  default: {
    props: ['isOpen', 'task', 'loading', 'error'],
    template: '<div v-if="isOpen" data-testid="feedback-modal" />',
  },
}))

const sampleTask: Task = {
  id: 'task-1',
  name: 'Task One',
  createdAt: new Date('2026-07-30T12:00:00.000Z'),
}

const mountLayout = () =>
  mount(TodayLayout, {
    props: {
      tasks: [sampleTask],
      isQuickTaskLoading: false,
      dayTotalSeconds: 0,
      lastSessionEndedAt: null,
    },
  })

describe('TodayLayout complete gate', () => {
  beforeEach(() => {
    timerState.activeTask = null
    timerState.remoteWorkSessionId = null
  })

  it('emits complete-task and does not open modal without remote session', async () => {
    const wrapper = mountLayout()
    await wrapper.get('[data-testid="req-complete"]').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('complete-task')?.[0]).toEqual([sampleTask])
    expect(wrapper.find('[data-testid="feedback-modal"]').exists()).toBe(false)
  })

  it('opens feedback modal when remote session is active for the task', async () => {
    timerState.activeTask = { id: 'task-1', name: 'Task One' }
    timerState.remoteWorkSessionId = 'ws-1'
    const wrapper = mountLayout()
    await wrapper.get('[data-testid="req-complete"]').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('complete-task')).toBeUndefined()
    expect(wrapper.find('[data-testid="feedback-modal"]').exists()).toBe(true)
  })
})
