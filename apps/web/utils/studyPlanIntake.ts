import type { ProjectFormData } from '@/types/project'
import type { StudyPlanIntake } from '@/types/studyPlan'

const PLAN_NAME_MAX = 80

/**
 * Maps study intake answers into the existing create-plan form shape
 * until the API stores structured study profile fields.
 */
export function studyPlanIntakeToProjectForm(
  intake: StudyPlanIntake,
): ProjectFormData {
  const goal = intake.goal.trim()
  const name = goal.slice(0, PLAN_NAME_MAX) || 'Study plan'
  const userDescription = intake.description.trim()

  const lines = [
    userDescription || null,
    `Schedule: ${intake.daysPerWeek} days/week · ${intake.minutesPerSession} min/session`,
    intake.targetDate ? `Target date: ${intake.targetDate}` : null,
  ].filter((line): line is string => line !== null)

  return {
    name,
    description: lines.join('\n'),
    status: 'planificado',
    color: intake.color.trim() || 'blue',
  }
}
