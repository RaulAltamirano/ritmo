/**
 * 🌅 CIRCADIAN SERVICE INTERFACE - 2025 BEST PRACTICES
 *
 * Defines the contract for circadian phase services
 * Following Clean Architecture principles
 */

import {
  CircadianPhaseCategory,
  CircadianPhasePriority,
  CircadianPhaseType,
} from '../../../types/circadian.js'

// ========================================
// DATA MODELS
// ========================================

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
  evidenceLevel: 'high' | 'medium' | 'low'
  sortOrder: number
}

export interface UserPreferences {
  id: string
  userId: string
  preferredPhases: CircadianPhaseType[]
  customHours?: {
    startHour: number
    endHour: number
  }
  notificationPreferences: {
    enabled: boolean
    types: Array<'push' | 'email' | 'both' | 'none'>
    advanceWarning: number
  }
  taskPreferences: Record<string, number>
  createdAt: Date
  updatedAt: Date
}

export interface WorkSession {
  id: string
  userId: string
  phaseType: CircadianPhaseType
  startTime: Date
  endTime?: Date
  taskType: string
  productivityScore?: number
  focusScore?: number
  energyLevel?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface PhaseAnalytics {
  phaseType: CircadianPhaseType
  totalSessions: number
  averageProductivity: number
  averageFocus: number
  averageEnergy: number
  mostCommonTasks: string[]
  optimalDuration: number
  recommendations: string[]
}

export interface UserAnalytics {
  userId: string
  period: {
    startDate: Date
    endDate: Date
    groupBy: 'day' | 'week' | 'month'
  }
  overallProductivity: number
  phaseAnalytics: PhaseAnalytics[]
  insights: string[]
  trends: {
    productivity: number[]
    focus: number[]
    energy: number[]
  }
}

export interface PhaseRecommendation {
  phase: CircadianPhase
  reason: string
  confidence: number
  suggestedTasks: string[]
  optimalDuration: number
  productivityExpectation: number
}

export interface DailySchedule {
  date: Date
  timezone: string
  phases: Array<{
    phase: CircadianPhase
    startTime: string
    endTime: string
    recommendedTasks: string[]
    productivityScore: number
    isOptimal: boolean
  }>
  totalProductivityScore: number
  recommendations: string[]
}

// ========================================
// SERVICE INTERFACE
// ========================================

export interface ICircadianService {
  // Phase Management
  getAllPhases(): Promise<CircadianPhase[]>
  getPhaseById(id: string): Promise<CircadianPhase | null>
  getPhasesByCategory(category: CircadianPhaseCategory): Promise<CircadianPhase[]>
  getCurrentPhase(timezone?: string, customTime?: Date): Promise<CircadianPhase | null>
  getNextPhase(currentHour: number): Promise<CircadianPhase | null>

  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreferences | null>
  updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences>
  createDefaultPreferences(userId: string): Promise<UserPreferences>

  // Session Management
  recordSession(
    session: Omit<WorkSession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WorkSession>
  getUserSessions(
    userId: string,
    filters?: {
      startDate?: Date
      endDate?: Date
      phaseType?: CircadianPhaseType
      limit?: number
    },
  ): Promise<WorkSession[]>
  getSessionById(id: string): Promise<WorkSession | null>
  updateSession(id: string, updates: Partial<WorkSession>): Promise<WorkSession>
  deleteSession(id: string): Promise<boolean>

  // Analytics & Insights
  getUserAnalytics(
    userId: string,
    period: {
      startDate: Date
      endDate: Date
      groupBy: 'day' | 'week' | 'month'
    },
  ): Promise<UserAnalytics>
  getPhaseAnalytics(
    userId: string,
    phaseType: CircadianPhaseType,
    period: {
      startDate: Date
      endDate: Date
    },
  ): Promise<PhaseAnalytics>
  getProductivityTrends(
    userId: string,
    period: {
      startDate: Date
      endDate: Date
    },
  ): Promise<{
    trends: number[]
    insights: string[]
    recommendations: string[]
  }>

  // Recommendations
  getPersonalizedRecommendations(
    userId: string,
    date?: Date,
  ): Promise<{
    currentPhase: CircadianPhase | null
    suggestedTasks: string[]
    nextPhase: CircadianPhase | null
    productivityTips: string[]
    timeManagement: string[]
  }>
  getPhaseRecommendations(
    userId: string,
    taskType: string,
  ): Promise<PhaseRecommendation[]>
  getOptimalSchedule(
    userId: string,
    date: Date,
    timezone?: string,
  ): Promise<DailySchedule>

  // Task Suggestions
  getTaskSuggestions(phaseType: CircadianPhaseType): Promise<{
    primary: string[]
    secondary: string[]
    avoid: string[]
  }>
  getPhaseSpecificTips(phaseType: CircadianPhaseType): Promise<string[]>

  // Utility Methods
  calculateTimeUntilNextPhase(currentHour: number, phaseEndHour: number): number
  isPhaseActive(phase: CircadianPhase, currentHour: number): boolean
  getPhaseOverlap(phase1: CircadianPhase, phase2: CircadianPhase): number
  validatePhaseSchedule(phases: CircadianPhase[]): {
    isValid: boolean
    errors: string[]
  }
}

// ========================================
// ERROR TYPES
// ========================================

export class CircadianError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message)
    this.name = 'CircadianError'
  }
}

export class PhaseNotFoundError extends CircadianError {
  constructor(phaseId: string) {
    super(`Phase with ID ${phaseId} not found`, 404, 'PHASE_NOT_FOUND')
  }
}

export class InvalidPhaseScheduleError extends CircadianError {
  constructor(errors: string[]) {
    super(`Invalid phase schedule: ${errors.join(', ')}`, 400, 'INVALID_SCHEDULE')
  }
}

export class UserPreferencesNotFoundError extends CircadianError {
  constructor(userId: string) {
    super(`Preferences for user ${userId} not found`, 404, 'PREFERENCES_NOT_FOUND')
  }
}

export class SessionNotFoundError extends CircadianError {
  constructor(sessionId: string) {
    super(`Session with ID ${sessionId} not found`, 404, 'SESSION_NOT_FOUND')
  }
}
