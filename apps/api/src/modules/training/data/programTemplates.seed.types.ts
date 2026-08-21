import type { DayFocus, TrainingLevel } from '@prisma/client'

export interface TemplateSlotSeed {
  sortOrder: number
  block: 'a' | 'b' | 'c'
  exerciseSlug: string
  setsReps: string
  targetRir: string
  targetRpe: string
  emphasis?: 'main' | 'accessory'
}

export interface TemplateDaySeed {
  dayNumber: number
  name: string
  focus: DayFocus
  slots: TemplateSlotSeed[]
}

export interface ProgramTemplateSeed {
  code: string
  level: TrainingLevel
  daysPerWeek: number
  sourceFile: string
  days: TemplateDaySeed[]
}

type SlotTuple = [
  block: TemplateSlotSeed['block'],
  exerciseSlug: string,
  setsReps: string,
]

export const slots = (items: SlotTuple[]): TemplateSlotSeed[] =>
  items.map(([block, exerciseSlug, setsReps], index) => ({
    sortOrder: index + 1,
    block,
    exerciseSlug,
    setsReps,
    targetRir: '2',
    targetRpe: '8',
  }))

export const day = (
  dayNumber: number,
  name: string,
  focus: DayFocus,
  items: SlotTuple[],
): TemplateDaySeed => ({ dayNumber, name, focus, slots: slots(items) })
