import type { ExerciseGroupTone } from '~/utils/exerciseGroupMeta'

/** Soft, unsaturated chrome mapped to Ritmo design-system tokens. */
export interface GroupToneClasses {
  article: string
  header: string
  title: string
  chip: string
  rail: string
  cue: string
}

const TONE_CLASSES: Record<ExerciseGroupTone, GroupToneClasses> = {
  neutral: {
    article: 'border-outline',
    header: 'border-outline bg-surface-raised/50',
    title: 'text-content-secondary',
    chip: 'border-outline bg-surface text-content-secondary',
    rail: 'bg-outline-strong',
    cue: 'text-content-muted',
  },
  brand: {
    article: 'border-primary-200/70 dark:border-primary-800/45',
    header:
      'border-primary-100/80 bg-brand-subtle/70 dark:border-primary-900/50 dark:bg-brand-subtle/80',
    title: 'text-brand-text',
    chip:
      'border-primary-200/80 bg-surface/90 text-brand-text dark:border-primary-800/50 dark:bg-surface/60',
    rail: 'bg-brand/55',
    cue: 'text-brand-text/80',
  },
  warning: {
    article: 'border-warning-200/75 dark:border-warning-800/40',
    header:
      'border-warning-100/80 bg-warning-50/70 dark:border-warning-900/45 dark:bg-warning-950/35',
    title: 'text-warning-800 dark:text-warning-300',
    chip:
      'border-warning-200/80 bg-surface/90 text-warning-800 dark:border-warning-800/45 dark:bg-surface/60 dark:text-warning-300',
    rail: 'bg-warning-500/50 dark:bg-warning-400/45',
    cue: 'text-warning-800/80 dark:text-warning-300/85',
  },
  success: {
    article: 'border-success-200/75 dark:border-success-800/40',
    header:
      'border-success-100/80 bg-success-50/70 dark:border-success-900/45 dark:bg-success-950/35',
    title: 'text-success-800 dark:text-success-300',
    chip:
      'border-success-200/80 bg-surface/90 text-success-800 dark:border-success-800/45 dark:bg-surface/60 dark:text-success-300',
    rail: 'bg-success-500/50 dark:bg-success-400/45',
    cue: 'text-success-800/80 dark:text-success-300/85',
  },
}

export function getGroupToneClasses(tone: ExerciseGroupTone): GroupToneClasses {
  return TONE_CLASSES[tone]
}
