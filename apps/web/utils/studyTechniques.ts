import type { Component } from 'vue'
import {
  BookOpen,
  Brain,
  Headphones,
  HelpCircle,
  Layers,
  MessageCircleQuestion,
  Shuffle,
  Target,
} from 'lucide-vue-next'
import type { StudyTechniqueId, Task } from '~/types/task'

export type { StudyTechniqueId }

export interface StudyTechniqueMeta {
  id: StudyTechniqueId
  label: string
  /** Short English tooltip copy (procedure-focused, no invented efficacy %). */
  tooltip: string
  icon: Component
}

export const STUDY_TECHNIQUES: Record<StudyTechniqueId, StudyTechniqueMeta> = {
  active_recall: {
    id: 'active_recall',
    label: 'Active recall',
    tooltip: 'Pull answers from memory (self-test) instead of re-reading.',
    icon: Brain,
  },
  spaced_repetition: {
    id: 'spaced_repetition',
    label: 'Spaced repetition',
    tooltip: 'Spread reviews over increasing intervals instead of cramming.',
    icon: Layers,
  },
  interleaving: {
    id: 'interleaving',
    label: 'Interleaving',
    tooltip: 'Mix related problem types in one session instead of blocked drills.',
    icon: Shuffle,
  },
  self_explanation: {
    id: 'self_explanation',
    label: 'Self-explanation',
    tooltip: 'Explain steps in your own words and ask why each claim is true.',
    icon: MessageCircleQuestion,
  },
  dual_coding: {
    id: 'dual_coding',
    label: 'Dual coding',
    tooltip: 'Combine words with relevant diagrams or visuals.',
    icon: BookOpen,
  },
  worked_examples: {
    id: 'worked_examples',
    label: 'Worked examples',
    tooltip: 'Study worked solutions, then fade support with varied examples.',
    icon: HelpCircle,
  },
  shadowing: {
    id: 'shadowing',
    label: 'Shadowing',
    tooltip:
      'Repeat speech almost in sync with native audio to train rhythm and pronunciation.',
    icon: Headphones,
  },
  deep_work: {
    id: 'deep_work',
    label: 'Deep work',
    tooltip: 'Focused block for hard cognitive work with minimal interruption.',
    icon: Target,
  },
}

const TECHNIQUE_TAG_ALIASES: Record<string, StudyTechniqueId> = {
  active_recall: 'active_recall',
  'active-recall': 'active_recall',
  recall: 'active_recall',
  retrieval: 'active_recall',
  spaced_repetition: 'spaced_repetition',
  'spaced-repetition': 'spaced_repetition',
  spaced: 'spaced_repetition',
  srs: 'spaced_repetition',
  interleaving: 'interleaving',
  self_explanation: 'self_explanation',
  'self-explanation': 'self_explanation',
  dual_coding: 'dual_coding',
  'dual-coding': 'dual_coding',
  worked_examples: 'worked_examples',
  'worked-examples': 'worked_examples',
  shadowing: 'shadowing',
  deep_work: 'deep_work',
  'deep-work': 'deep_work',
}

export function resolveStudyTechnique(
  task: Pick<Task, 'studyTechnique' | 'tags'>,
): StudyTechniqueMeta | null {
  if (task.studyTechnique && STUDY_TECHNIQUES[task.studyTechnique]) {
    return STUDY_TECHNIQUES[task.studyTechnique]
  }
  for (const raw of task.tags ?? []) {
    const key = raw.trim().toLowerCase().replace(/\s+/g, '_')
    const id = TECHNIQUE_TAG_ALIASES[key]
    if (id) return STUDY_TECHNIQUES[id]
  }
  return null
}

/** Minutes from estimatedTime or duration string (e.g. "25", "25m"). */
export function taskDurationMinutes(task: Pick<Task, 'estimatedTime' | 'duration'>): number | null {
  if (task.estimatedTime) {
    const n = parseInt(task.estimatedTime, 10)
    if (!Number.isNaN(n) && n > 0) return n
  }
  if (task.duration) {
    const n = parseInt(task.duration, 10)
    if (!Number.isNaN(n) && n > 0) return n
  }
  return null
}

/** Classic Pomodoro work length used for label/tooltip. */
export const POMODORO_WORK_MINUTES = 25

export function formatPlanTimerLabel(minutes: number): string {
  if (minutes === POMODORO_WORK_MINUTES) return `${minutes} min · Pomodoro`
  return `${minutes} min`
}

export function planTimerTooltip(minutes: number): string {
  if (minutes === POMODORO_WORK_MINUTES) {
    return 'Pomodoro work block (25 min focus, typically followed by a short break).'
  }
  return `Timed focus block · ${minutes} minutes`
}
