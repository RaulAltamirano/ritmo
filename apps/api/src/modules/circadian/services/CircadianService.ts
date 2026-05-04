/**
 * Circadian service — single source of truth: `CircadianPhase` rows in PostgreSQL.
 */

import { type CircadianPhase, Prisma } from '@prisma/client'
import {
  getWallClockInTimezone,
  minutesUntilPhaseEnd,
  phaseContainsHour,
} from '@ritmo/shared'
import prisma from '../../../core/database/prisma.js'
import type {
  CircadianPhaseDTO,
  CurrentPhaseResponseDTO,
  GetCurrentPhaseRequestDTO,
  GetPhasesRequestDTO,
  SimplePhasesDTO,
} from '../dto/CircadianDTOs.js'

function idealForToTaskRecommendations(idealFor: string): string[] {
  return idealFor
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(Boolean)
}

function mapPhase(p: CircadianPhase): CircadianPhaseDTO {
  return {
    id: p.id,
    type: p.type,
    category: p.category,
    priority: p.priority as CircadianPhaseDTO['priority'],
    startHour: p.startHour,
    endHour: p.endHour,
    duration: p.duration,
    name: p.name,
    keyword: p.keyword,
    description: p.description,
    idealFor: p.idealFor,
    color: p.color,
    icon: p.icon,
    emoji: p.emoji,
    isPremium: p.isPremium,
    isIntuitive: p.isIntuitive,
    scientificReferences: p.scientificReferences,
    evidenceLevel: p.evidenceLevel,
    sortOrder: p.sortOrder,
    taskRecommendations: idealForToTaskRecommendations(p.idealFor),
    productivityTips: [],
  }
}

export class CircadianService {
  async getAllPhases(request: GetPhasesRequestDTO): Promise<SimplePhasesDTO> {
    const where: Prisma.CircadianPhaseWhereInput = {}

    if (!request.includeInactive) {
      where.isActive = true
    }
    if (request.category) {
      where.category = request.category as CircadianPhase['category']
    }
    if (request.priority) {
      where.priority = request.priority as CircadianPhase['priority']
    }

    const rows = await prisma.circadianPhase.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return { phases: rows.map(mapPhase) }
  }

  async getCurrentPhase(
    request: GetCurrentPhaseRequestDTO,
  ): Promise<CurrentPhaseResponseDTO> {
    const timezone = request.timezone?.trim() ?? 'UTC'
    const referenceDate = request.customTime ? new Date(request.customTime) : new Date()

    if (Number.isNaN(referenceDate.getTime())) {
      throw new RangeError('Invalid customTime')
    }

    const rows = await prisma.circadianPhase.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    if (rows.length === 0) {
      throw new Error(
        'No circadian phases in database. Run migrations and seed (for example npm run db:seed).',
      )
    }

    const wall = getWallClockInTimezone(referenceDate, timezone)
    const { hour } = wall

    const current = rows.find(p => phaseContainsHour(p.startHour, p.endHour, hour))
    if (!current) {
      throw new Error(
        `No circadian phase covers local hour ${hour} in ${timezone}. Check that circadian_phases seed covers the full day without gaps.`,
      )
    }

    const dto = mapPhase(current)
    const timeUntilNext = minutesUntilPhaseEnd(current.startHour, current.endHour, wall)

    return {
      phase: dto,
      timezone,
      referenceTime: referenceDate.toISOString(),
      timeUntilNext,
    }
  }

  async getPhaseCounts(): Promise<{ totalPhases: number; activePhases: number }> {
    const [totalPhases, activePhases] = await Promise.all([
      prisma.circadianPhase.count(),
      prisma.circadianPhase.count({ where: { isActive: true } }),
    ])
    return { totalPhases, activePhases }
  }
}
