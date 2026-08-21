import type { Prisma } from '@prisma/client'

import type { Substitution } from '../services/OpenAiTrainingClient.js'

export interface FrontendTrainingWeek {
  id: string
  weekStart: string
  status: 'draft' | 'applied'
  blockPhase: 'accumulation' | 'deload'
  weekInBlock: number
  programTemplateCode: string
  summary: string | null
  warning: string | null
  substitutions: Substitution[]
  days: Array<{
    id: string
    dayNumber: number
    name: string
    focus: 'upper' | 'lower'
    weekday: number
    date: string
    exercises: Array<{
      id: string
      exerciseId: string
      name: string
      block: 'a' | 'b' | 'c'
      setsReps: string
      targetRir: string
      targetRpe: string
      emphasis?: 'main' | 'accessory'
    }>
  }>
}

export type TrainingWeekWithRelations = Prisma.TrainingWeekGetPayload<{
  include: {
    programTemplate: true
    days: {
      include: {
        exercises: {
          include: { exercise: true }
        }
      }
    }
  }
}>

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function substitutionsFromJson(value: Prisma.JsonValue | null): Substitution[] {
  return Array.isArray(value) ? (value as unknown as Substitution[]) : []
}

export function toFrontendTrainingWeek(
  week: TrainingWeekWithRelations,
): FrontendTrainingWeek {
  return {
    id: week.id,
    weekStart: isoDate(week.weekStart),
    status: week.status,
    blockPhase: week.blockPhase,
    weekInBlock: week.weekInBlock,
    programTemplateCode: week.programTemplate.code,
    summary: week.summary,
    warning: week.warning,
    substitutions: substitutionsFromJson(week.substitutions),
    days: week.days.map(day => ({
      id: day.id,
      dayNumber: day.dayNumber,
      name: day.name,
      focus: day.focus,
      weekday: day.weekday,
      date: isoDate(day.date),
      exercises: day.exercises.map(entry => ({
        id: entry.id,
        exerciseId: entry.exerciseId,
        name: entry.exercise.name,
        block: entry.block as 'a' | 'b' | 'c',
        setsReps: entry.setsReps,
        targetRir: entry.targetRir,
        targetRpe: entry.targetRpe,
        ...(entry.emphasis && {
          emphasis: entry.emphasis as 'main' | 'accessory',
        }),
      })),
    })),
  }
}
