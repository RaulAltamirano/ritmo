/**
 * 🌅 CIRCADIAN CONTROLLER - RITMO API 2025
 *
 * Controlador para el módulo de fases circadianas
 * Maneja las solicitudes HTTP para fases circadianas
 */

import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import {
  CircadianHealthDTO,
  GetCurrentPhaseRequestDTO,
  GetPhasesRequestDTO,
} from '../dto/CircadianDTOs.js'
import { CircadianService } from '../services/CircadianService.js'

export class CircadianController {
  private readonly circadianService: CircadianService

  constructor() {
    this.circadianService = new CircadianService()
  }

  /**
   * GET /api/circadian/phases
   * Obtiene todas las fases circadianas disponibles
   */
  async getPhases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: GetPhasesRequestDTO = {
        includeInactive: req.query.includeInactive === 'true',
        category: req.query.category as string,
        priority: req.query.priority as string,
      }

      const result = await this.circadianService.getAllPhases(request)

      ApiResponses.ok(result, 'Fases circadianas obtenidas exitosamente')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/circadian/current-phase
   * Obtiene la fase circadian actual basada en UTC
   */
  async getCurrentPhase(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const request: GetCurrentPhaseRequestDTO = {
        timezone: (req.query.timezone as string) ?? 'UTC',
        customTime: req.query.customTime as string,
      }

      const result = await this.circadianService.getCurrentPhase(request)

      ApiResponses.ok(result, 'Fase circadian actual obtenida exitosamente')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/circadian/health
   * Health check del módulo circadian
   */
  async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const counts = await this.circadianService.getPhaseCounts()
      const healthData: CircadianHealthDTO = {
        status: 'healthy',
        module: 'circadian',
        version: 'v1',
        timestamp: new Date().toISOString(),
        endpoints: [
          'GET /api/circadian/phases',
          'GET /api/circadian/current-phase',
          'GET /api/circadian/health',
        ],
        phaseData: {
          totalPhases: counts.totalPhases,
          activePhases: counts.activePhases,
          lastUpdate: new Date().toISOString(),
        },
      }

      ApiResponses.ok(healthData, 'Circadian module is healthy')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }
}
