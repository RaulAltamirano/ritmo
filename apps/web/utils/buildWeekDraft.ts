import type {
  GenerateWeekIntakeSlots,
  WeekDraft,
  WeekDraftSession,
} from '@/types/generateWeek'

export interface BuildWeekDraftInput {
  planName: string
  weekStart: string
  slots: GenerateWeekIntakeSlots
  minutesPerSession?: number
  daysPerWeek?: number
}

const DAY_SPREAD: Record<number, Array<0 | 1 | 2 | 3 | 4 | 5 | 6>> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
}

export function buildWeekDraft(input: BuildWeekDraftInput): WeekDraft {
  const days = Math.min(7, Math.max(1, input.daysPerWeek ?? 3))
  const minutes = input.minutesPerSession ?? 45
  const focus = input.slots.focusThisWeek || input.slots.friction || 'practice'
  const offsets = DAY_SPREAD[days] ?? DAY_SPREAD[3]!
  const plan = input.planName.trim() || 'Plan'

  const sessions: WeekDraftSession[] = offsets.map((dayOffset, index) => ({
    dayOffset,
    title: `${plan}: ${focus} (${index + 1})`,
    durationMin: minutes,
    notes: input.slots.avoid ? `Avoid: ${input.slots.avoid}` : undefined,
  }))

  return {
    weekStart: input.weekStart,
    sessions,
    summary:
      `${plan} — focus on ${focus}` +
      (input.slots.level ? ` · ${input.slots.level}` : ''),
  }
}
