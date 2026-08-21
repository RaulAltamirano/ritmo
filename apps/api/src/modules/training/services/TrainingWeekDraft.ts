import type { BlockPhase, DayFocus, EquipmentProfile, Exercise } from '@prisma/client'

import { InvalidInputException } from '../../../shared/exceptions/app.exceptions.js'
import type { Substitution } from './OpenAiTrainingClient.js'
import type { CatalogValidator } from './CatalogValidator.js'
import { applyDeloadToSlot, weekdayOffsetsForDays } from './WfitnessMotor.js'

export interface DraftExercise {
  exerciseId: string
  sortOrder: number
  block: string
  setsReps: string
  targetRir: string
  targetRpe: string
  emphasis: string | null
}

export interface DraftDay {
  dayNumber: number
  name: string
  focus: DayFocus
  weekday: number
  date: Date
  exercises: { create: DraftExercise[] }
}

interface TemplateDay {
  dayNumber: number
  name: string
  focus: DayFocus
  slots: Array<DraftExercise & { exercise: Exercise }>
}

export function buildDraftDays(
  profile: { daysPerWeek: number; blockPhase: BlockPhase },
  templateDays: TemplateDay[],
  start: Date,
): DraftDay[] {
  const offsets = weekdayOffsetsForDays(profile.daysPerWeek)
  return templateDays.map((day, index) => {
    const offset = offsets[index]
    if (offset === undefined) {
      throw new InvalidInputException('Program template day count is invalid')
    }
    const date = new Date(start)
    date.setUTCDate(date.getUTCDate() + offset)
    const slots =
      profile.blockPhase === 'deload' ? day.slots.map(applyDeloadToSlot) : day.slots
    return {
      dayNumber: day.dayNumber,
      name: day.name,
      focus: day.focus,
      weekday: (offset + 1) % 7,
      date,
      exercises: {
        create: slots.map(slot => ({
          exerciseId: slot.exerciseId,
          sortOrder: slot.sortOrder,
          block: slot.block,
          setsReps: slot.setsReps,
          targetRir: slot.targetRir,
          targetRpe: slot.targetRpe,
          emphasis: slot.emphasis,
        })),
      },
    }
  })
}

export function draftExerciseIds(days: DraftDay[]): string[] {
  return [...new Set(days.flatMap(day => day.exercises.create.map(e => e.exerciseId)))]
}

export function validDraftSubstitutions(
  proposed: Substitution[],
  days: DraftDay[],
  catalog: Exercise[],
  equipment: EquipmentProfile,
  validator: CatalogValidator,
): Substitution[] {
  const draftIds = new Set(draftExerciseIds(days))
  const exercises = new Map(catalog.map(exercise => [exercise.id, exercise]))
  return proposed.filter(substitution => {
    const from = exercises.get(substitution.fromExerciseId)
    const to = exercises.get(substitution.toExerciseId)
    return Boolean(
      draftIds.has(substitution.fromExerciseId) &&
        from &&
        to &&
        validator.validateSubstitution(from, to, equipment).ok,
    )
  })
}

export function applyDraftSubstitutions(
  days: DraftDay[],
  substitutions: Substitution[],
): DraftDay[] {
  const replacements = new Map(
    substitutions.map(item => [item.fromExerciseId, item.toExerciseId]),
  )
  return days.map(day => ({
    ...day,
    exercises: {
      create: day.exercises.create.map(entry => ({
        ...entry,
        exerciseId: replacements.get(entry.exerciseId) ?? entry.exerciseId,
      })),
    },
  }))
}
