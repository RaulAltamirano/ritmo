import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TodayTimeStrip from '@/components/molecules/TodayTimeStrip.vue'
import { useTimerStore } from '@/stores/timer'

describe('TodayTimeStrip', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-21T15:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats day total as "Xh Ym" when ≥1h', () => {
    const w = mount(TodayTimeStrip, {
      props: { dayTotalSeconds: 3_780, lastSessionEndedAt: null },
    })
    expect(w.text()).toContain('1h 3m')
  })

  it('formats day total as "Ym" when <1h', () => {
    const w = mount(TodayTimeStrip, {
      props: { dayTotalSeconds: 780, lastSessionEndedAt: null },
    })
    expect(w.text()).toContain('13m')
  })

  it('shows idle counter "Xm sin tarea" relative to lastSessionEndedAt', () => {
    const w = mount(TodayTimeStrip, {
      props: {
        dayTotalSeconds: 600,
        lastSessionEndedAt: '2026-04-21T14:48:00Z', // 12m ago
      },
    })
    expect(w.text()).toContain('12m sin tarea')
  })

  it('hides the idle counter while a timer is running', () => {
    const timer = useTimerStore()
    timer.activeTask = {
      id: 't1',
      name: 'A',
      timeLeft: 500,
      totalTime: 1500,
      type: 'Pomodoro',
      totalPausedTime: 0,
    } as any
    timer.isRunning = true
    const w = mount(TodayTimeStrip, {
      props: {
        dayTotalSeconds: 600,
        lastSessionEndedAt: '2026-04-21T14:48:00Z',
      },
    })
    expect(w.text()).not.toContain('sin tarea')
  })

  it('hides the idle counter when lastSessionEndedAt is null', () => {
    const w = mount(TodayTimeStrip, {
      props: { dayTotalSeconds: 0, lastSessionEndedAt: null },
    })
    expect(w.text()).not.toContain('sin tarea')
  })
})
