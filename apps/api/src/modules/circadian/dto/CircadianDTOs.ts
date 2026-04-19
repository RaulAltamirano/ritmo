/**
 * 🌅 CIRCADIAN DTOs - RITMO API 2025
 *
 * Data Transfer Objects para el módulo circadian
 * Definiciones de tipos para las fases circadianas
 */

// ========================================
// CORE DTOs
// ========================================

export interface CircadianPhaseDTO {
  id: string
  type: string
  name: string
  description: string
  startHour: number
  endHour: number
  priority: 'low' | 'medium' | 'high'
  category: string
  isPremium: boolean
  isIntuitive: boolean
  taskRecommendations: string[]
  productivityTips: string[]
  color: string
  icon: string
}

export interface CurrentPhaseDTO {
  phase: CircadianPhaseDTO
  currentTime: {
    utc: string
    local: string
    timezone: string
  }
  nextPhase: {
    phase: CircadianPhaseDTO
    timeUntil: string
  }
  progress: {
    percentage: number
    timeRemaining: string
  }
}

export interface AllPhasesDTO {
  phases: CircadianPhaseDTO[]
  totalPhases: number
  currentPhase: CircadianPhaseDTO | null
  timezone: string
  lastUpdated: string
}

export interface SimplePhasesDTO {
  phases: CircadianPhaseDTO[]
}

// ========================================
// REQUEST/RESPONSE DTOs
// ========================================

export interface GetCurrentPhaseRequestDTO {
  timezone?: string
  customTime?: string
}

export interface GetPhasesRequestDTO {
  includeInactive?: boolean
  category?: string
  priority?: string
}

// ========================================
// ERROR DTOs
// ========================================

export interface CircadianErrorDTO {
  code: string
  message: string
  details?: any
  timestamp: string
}

// ========================================
// HEALTH CHECK DTOs
// ========================================

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
