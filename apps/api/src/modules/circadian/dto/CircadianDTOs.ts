/**
 * Data Transfer Objects — circadian module (aligned with Prisma `CircadianPhase`).
 */

export interface CircadianPhaseDTO {
  id: string
  type: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
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
  sortOrder: number
  /** Derived from `idealFor` for convenience */
  taskRecommendations: string[]
  productivityTips: string[]
}

export interface CurrentPhaseResponseDTO {
  phase: CircadianPhaseDTO
  timezone: string
  referenceTime: string
  /** Minutes until this phase ends in the resolved timezone */
  timeUntilNext: number
}

export interface SimplePhasesDTO {
  phases: CircadianPhaseDTO[]
}

export interface GetCurrentPhaseRequestDTO {
  timezone?: string
  customTime?: string
}

export interface GetPhasesRequestDTO {
  includeInactive?: boolean
  category?: string
  priority?: string
}

export interface CircadianErrorDTO {
  code: string
  message: string
  details?: unknown
  timestamp: string
}

export interface CircadianHealthDTO {
  status: 'healthy' | 'degraded' | 'unhealthy'
  module: string
  version: string
  timestamp: string
  endpoints: string[]
  phaseData: {
    totalPhases: number
    activePhases: number
    lastUpdate: string
  }
}
