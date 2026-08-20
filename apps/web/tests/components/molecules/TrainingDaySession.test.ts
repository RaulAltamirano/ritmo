import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import TrainingDaySession from '@/components/molecules/TrainingDaySession.vue'
import TrainingSessionFeedbackModal from '@/components/molecules/TrainingSessionFeedbackModal.vue'
import { buildMockLoadSettings, buildMockTrainingLogs } from '@/data/mockTrainingLogs'
import { mockWeeklyPlan } from '@/data/mockWeeklyPlan'
import type {
  ExerciseLoadSettings,
  ExerciseLog,
  TrainingSessionCheck,
} from '@/types/training'
import {
  emptySessionCheck,
  saveSessionCheckStart,
  skipSessionCheckPhase,
} from '@/utils/trainingSessionCheck'

const BaseModalStub = {
  name: 'BaseModal',
  props: ['isOpen', 'title', 'closeButtonLabel'],
  template:
    '<div v-if="isOpen" data-testid="base-modal" role="dialog"><slot /><slot name="footer" /></div>',
}

const BaseButtonStub = {
  name: 'BaseButton',
  props: ['variant'],
  template: '<button :data-variant="variant"><slot /></button>',
}

function mountSession(props: Record<string, unknown>) {
  return mount(TrainingDaySession, {
    props,
    global: { stubs: { BaseButton: BaseButtonStub, BaseModal: BaseModalStub } },
  })
}

const shortDay = {
  ...mockWeeklyPlan.days[0]!,
  exercises: [mockWeeklyPlan.days[0]!.exercises[0]!],
}

function completeLogs(dayKey: string) {
  const exerciseId = shortDay.exercises[0]!.id
  return [
    {
      exerciseId,
      dayKey,
      note: null,
      sets: [1, 2, 3, 4].map(index => ({
        id: `set-${index}`,
        index,
        reps: 10,
        rpe: 8,
        load: 50,
        unit: 'kg' as const,
        completed: true,
      })),
    },
  ]
}

describe('TrainingDaySession', () => {
  it('shows Rest day when trainingDay is null', () => {
    const wrapper = mount(TrainingDaySession, {
      props: { trainingDay: null },
    })
    expect(wrapper.text()).toContain('Rest day')
    expect(wrapper.get('section').attributes('aria-label')).toBe('Rest day')
  })

  it('shows session title and an exercise name', () => {
    const day = mockWeeklyPlan.days[0]!
    const wrapper = mount(TrainingDaySession, {
      props: { trainingDay: day },
    })
    expect(wrapper.text()).toContain(day.name)
    expect(wrapper.text()).toContain(day.exercises[0]!.name)
    expect(wrapper.get('section').attributes('aria-label')).toBe(day.name)
  })

  it('labels supersets and shows RPE without RIR', () => {
    const day = mockWeeklyPlan.days[1]! // Piernas A: supersets + triset
    const wrapper = mount(TrainingDaySession, {
      props: { trainingDay: day },
    })
    const text = wrapper.text()
    expect(text).toContain('Superset')
    expect(text).toContain('Triset')
    expect(text).toMatch(/back-to-back/i)
    expect(text).toMatch(/RPE/)
    expect(text).not.toMatch(/@ RIR|\bRIR\b/)
  })

  async function openExerciseLogIfNeeded(
    wrapper: ReturnType<typeof mountSession>,
    exerciseName: string,
  ) {
    const logTrigger = wrapper.find(`[aria-label="Log ${exerciseName}"]`)
    if (logTrigger.exists()) await logTrigger.trigger('click')
  }

  it('renders set fields for an exercise', async () => {
    const day = mockWeeklyPlan.days[0]!
    const wrapper = mountSession({
      trainingDay: day,
      dayKey: '2026-08-10',
      logs: [],
      settings: [],
      bodyweightKg: 80,
    })
    await openExerciseLogIfNeeded(wrapper, day.exercises[0]!.name)
    expect(wrapper.text()).toContain('Reps')
    expect(wrapper.text()).toContain('Add set')
  })

  it('shows last session line from prior logs', () => {
    const day = mockWeeklyPlan.days[0]!
    const wrapper = mount(TrainingDaySession, {
      props: {
        trainingDay: day,
        dayKey: '2026-08-10',
        logs: buildMockTrainingLogs(new Date(2026, 7, 10)),
        settings: buildMockLoadSettings(),
        bodyweightKg: 80,
      },
    })
    expect(wrapper.text()).toMatch(/Last:/)
  })

  it('persists lastUnit from the changed set only', async () => {
    const day = mockWeeklyPlan.days[0]!
    const exercise = day.exercises[0]!
    const wrapper = mountSession({
      trainingDay: day,
      dayKey: '2026-08-10',
      logs: [],
      settings: [{ exerciseId: exercise.id, plateKg: null, lastUnit: 'kg' }],
      bodyweightKg: 80,
    })

    await openExerciseLogIfNeeded(wrapper, exercise.name)
    await wrapper.get('[aria-label="Pounds"]').trigger('click')

    const afterUnit = wrapper.emitted('update:settings')
    expect(afterUnit).toHaveLength(1)
    const unitSettings = afterUnit![0]![0] as ExerciseLoadSettings[]
    expect(unitSettings.find(item => item.exerciseId === exercise.id)?.lastUnit).toBe(
      'lbs',
    )

    const logs = wrapper.emitted('update:logs')![0]![0] as ExerciseLog[]
    await wrapper.setProps({ logs, settings: unitSettings })

    await wrapper.get('[aria-label="Reps"]').setValue('8')

    const settingsEmits = wrapper.emitted('update:settings') ?? []
    expect(settingsEmits).toHaveLength(1)
    const laterUnits = settingsEmits.slice(1).flatMap(payload => {
      const list = payload[0] as ExerciseLoadSettings[]
      return list.map(item => item.lastUnit)
    })
    expect(laterUnits).not.toContain('kg')
  })

  it('does not show session check actions on a rest day', () => {
    const wrapper = mountSession({ trainingDay: null })

    expect(wrapper.text()).not.toContain('Check in')
    expect(wrapper.text()).not.toContain('Finish session')
  })

  it('shows session check actions without auto-opening on a non-today planned day', () => {
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-10',
      sessionCheck: emptySessionCheck('2026-08-10'),
      isToday: false,
    })

    expect(wrapper.text()).toContain('Check in')
    expect(wrapper.text()).toContain('Finish session')
    expect(wrapper.find('[data-testid="base-modal"]').exists()).toBe(false)
    expect(wrapper.findAll('[role="dialog"]')).toHaveLength(0)
  })

  it('auto-opens check-in for a planned session today', async () => {
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-17',
      sessionCheck: emptySessionCheck('2026-08-17'),
      isToday: true,
    })

    await nextTick()

    expect(wrapper.get('[role="dialog"]').text()).toContain('Ready to train')
  })

  it('skips an auto-opened check-in without hiding the check-in action', async () => {
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-17',
      sessionCheck: emptySessionCheck('2026-08-17'),
      isToday: true,
    })
    await nextTick()

    const notNow = wrapper
      .get('[role="dialog"]')
      .findAll('button')
      .find(button => button.text() === 'Not now')
    expect(notNow).toBeDefined()
    await notNow?.trigger('click')

    const emitted = wrapper.emitted('update:sessionCheck')
    expect((emitted![0]![0] as TrainingSessionCheck).startStatus).toBe('skipped')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Check in')
  })

  it('does not auto-open a skipped check-in', async () => {
    const skipped = skipSessionCheckPhase(emptySessionCheck('2026-08-17'), 'start')
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-17',
      sessionCheck: skipped,
      isToday: true,
    })

    await nextTick()

    expect(wrapper.text()).not.toContain('Ready to train')
  })

  it('opens a skipped check-in from the check-in action', async () => {
    const skipped = skipSessionCheckPhase(emptySessionCheck('2026-08-17'), 'start')
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-17',
      sessionCheck: skipped,
      isToday: true,
    })

    await wrapper.get('[aria-label="Check in"]').trigger('click')

    expect(wrapper.get('[role="dialog"]').text()).toContain('Ready to train')
  })

  it('opens wrap-up from the finish-session action', async () => {
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-10',
      sessionCheck: emptySessionCheck('2026-08-10'),
      isToday: false,
    })

    await wrapper.get('[aria-label="Finish session"]').trigger('click')

    expect(wrapper.get('[role="dialog"]').text()).toContain('How the session felt')
  })

  it('auto-opens wrap-up after a checked-in planned session is complete today', async () => {
    const checkedIn = saveSessionCheckStart(emptySessionCheck('2026-08-17'), {
      preparation: 3,
      motivation: 3,
      strength: 3,
    })
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-17',
      logs: completeLogs('2026-08-17'),
      sessionCheck: checkedIn,
      isToday: true,
    })

    await nextTick()

    expect(wrapper.get('[role="dialog"]').text()).toContain('How the session felt')
  })

  it('skips an auto-opened wrap-up when dismissed with Escape', async () => {
    const checkedIn = saveSessionCheckStart(emptySessionCheck('2026-08-17'), {
      preparation: 3,
      motivation: 3,
      strength: 3,
    })
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-17',
      logs: completeLogs('2026-08-17'),
      sessionCheck: checkedIn,
      isToday: true,
    })
    await nextTick()

    wrapper
      .getComponent(TrainingSessionFeedbackModal)
      .vm.$emit('update:isOpen', false)
    await nextTick()

    const emitted = wrapper.emitted('update:sessionCheck')
    expect((emitted![0]![0] as TrainingSessionCheck).endStatus).toBe('skipped')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('keeps check-in open instead of wrap-up when a complete session has no start response', async () => {
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-17',
      logs: completeLogs('2026-08-17'),
      sessionCheck: emptySessionCheck('2026-08-17'),
      isToday: true,
    })

    await nextTick()

    const dialogText = wrapper.get('[role="dialog"]').text()
    expect(dialogText).toContain('Ready to train')
    expect(dialogText).not.toContain('How the session felt')
  })

  it('uses the primary finish-session action when planned sets are complete', () => {
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-17',
      logs: completeLogs('2026-08-17'),
      sessionCheck: emptySessionCheck('2026-08-17'),
      isToday: false,
    })

    expect(wrapper.get('[aria-label="Finish session"]').attributes('data-variant')).toBe(
      'primary',
    )
  })

  it('closes check-in without skipping when the day changes', async () => {
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-17',
      sessionCheck: emptySessionCheck('2026-08-17'),
      isToday: true,
    })
    await nextTick()
    expect(wrapper.get('[role="dialog"]').text()).toContain('Ready to train')

    await wrapper.setProps({
      dayKey: '2026-08-18',
      sessionCheck: emptySessionCheck('2026-08-18'),
      isToday: false,
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.emitted('update:sessionCheck')).toBeUndefined()
  })

  it('auto-opens check-in when navigating back to today', async () => {
    const wrapper = mountSession({
      trainingDay: shortDay,
      dayKey: '2026-08-18',
      sessionCheck: emptySessionCheck('2026-08-18'),
      isToday: false,
    })

    await wrapper.setProps({
      dayKey: '2026-08-17',
      sessionCheck: emptySessionCheck('2026-08-17'),
      isToday: true,
    })
    await nextTick()

    expect(wrapper.get('[role="dialog"]').text()).toContain('Ready to train')
  })
})
