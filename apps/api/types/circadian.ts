// =====================================================
// CIRCADIAN RHYTHM TYPES - 2025 BEST PRACTICES
// =====================================================
//
// Este archivo define los tipos TypeScript para el sistema
// de fases circadianas, siguiendo las mejores prácticas
// de tipado y documentación del 2025

export interface CircadianPhase {
  id: string
  type: CircadianPhaseType
  category: CircadianPhaseCategory
  priority: CircadianPhasePriority
  startHour: number
  endHour: number
  duration: number
  name: string
  keyword: string
  description: string
  idealFor: string
  color: string
  icon: string
  emoji: string
  isPremium: boolean
  isIntuitive: boolean
  scientificReferences: string[]
  evidenceLevel: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface CircadianPhasePreference {
  id: string
  userId: string
  phaseId: string
  isEnabled: boolean
  customStartHour?: number
  customEndHour?: number
  notificationsEnabled: boolean
  notificationType: string
  autoTaskScheduling: boolean
  preferredTaskTypes: string[]
  averageProductivityScore?: number
  totalSessionsInPhase: number
  createdAt: Date
  updatedAt: Date
}

export interface CircadianPhaseSession {
  id: string
  userId: string
  phaseId: string
  startTime: Date
  endTime?: Date
  duration?: number
  productivityScore?: number
  focusScore?: number
  energyLevel?: number
  activitiesCompleted: number
  tasksCompleted: number
  notes?: string
  mood?: string
  createdAt: Date
  updatedAt: Date
}

export interface CircadianPhaseWithPreferences extends CircadianPhase {
  preferences?: CircadianPhasePreference[]
  sessions?: CircadianPhaseSession[]
}

export interface CurrentPhaseInfo {
  phase: CircadianPhase
  timeUntilNext: number // en minutos
  progress: number // 0-1
  isActive: boolean
  nextPhase?: CircadianPhase
}

export interface PhaseRecommendation {
  phase: CircadianPhase
  reason: string
  confidence: number // 0-1
  suggestedTasks: string[]
  estimatedProductivity: number // 0-10
}

// Enums
export enum CircadianPhaseType {
  SLOW_ACTIVATION = 'slow_activation',
  MORNING_FOCUS_PEAK = 'morning_focus_peak',
  COGNITIVE_PEAK = 'cognitive_peak',
  SECOND_PRODUCTIVITY = 'second_productivity',
  CREATIVE_WINDOW = 'creative_window',
  TRANSITION = 'transition',
  INTROSPECTIVE = 'introspective',
  SLEEP_PREPARATION = 'sleep_preparation',
}

export enum CircadianPhaseCategory {
  ACTIVATION = 'activation',
  PERFORMANCE = 'performance',
  CREATIVE = 'creative',
  REFLECTION = 'reflection',
  REST = 'rest',
}

export enum CircadianPhasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum CircadianPhaseStatus {
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  INACTIVE = 'inactive',
}

// Utility types
export type PhaseTypeMap = Record<CircadianPhaseType, CircadianPhase>
export type PhaseCategoryMap = Record<CircadianPhaseCategory, CircadianPhase[]>
export type PhasePriorityMap = Record<CircadianPhasePriority, CircadianPhase[]>

// Constants
export const PHASE_COLORS: Record<CircadianPhaseType, string> = {
  [CircadianPhaseType.SLOW_ACTIVATION]: '#fde047',
  [CircadianPhaseType.MORNING_FOCUS_PEAK]: '#4ade80',
  [CircadianPhaseType.COGNITIVE_PEAK]: '#60a5fa',
  [CircadianPhaseType.SECOND_PRODUCTIVITY]: '#38bdf8',
  [CircadianPhaseType.CREATIVE_WINDOW]: '#a78bfa',
  [CircadianPhaseType.TRANSITION]: '#fdba74',
  [CircadianPhaseType.INTROSPECTIVE]: '#fde047',
  [CircadianPhaseType.SLEEP_PREPARATION]: '#a3a3a3',
}

export const PHASE_ICONS: Record<CircadianPhaseType, string> = {
  [CircadianPhaseType.SLOW_ACTIVATION]: 'coffee',
  [CircadianPhaseType.MORNING_FOCUS_PEAK]: 'sun',
  [CircadianPhaseType.COGNITIVE_PEAK]: 'activity',
  [CircadianPhaseType.SECOND_PRODUCTIVITY]: 'repeat',
  [CircadianPhaseType.CREATIVE_WINDOW]: 'pen-tool',
  [CircadianPhaseType.TRANSITION]: 'book-open',
  [CircadianPhaseType.INTROSPECTIVE]: 'moon',
  [CircadianPhaseType.SLEEP_PREPARATION]: 'bed',
}

export const PHASE_EMOJIS: Record<CircadianPhaseType, string> = {
  [CircadianPhaseType.SLOW_ACTIVATION]: '🟡',
  [CircadianPhaseType.MORNING_FOCUS_PEAK]: '🟢',
  [CircadianPhaseType.COGNITIVE_PEAK]: '🔵',
  [CircadianPhaseType.SECOND_PRODUCTIVITY]: '🔵',
  [CircadianPhaseType.CREATIVE_WINDOW]: '🟣',
  [CircadianPhaseType.TRANSITION]: '🟠',
  [CircadianPhaseType.INTROSPECTIVE]: '🟡',
  [CircadianPhaseType.SLEEP_PREPARATION]: '⚫',
}
