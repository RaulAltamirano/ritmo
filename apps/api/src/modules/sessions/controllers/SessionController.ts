/**
 * 🎫 SESSION CONTROLLER - RITMO API 2025
 *
 * Controlador independiente para gestión de sesiones
 * Siguiendo Clean Architecture y Domain Driven Design
 */

import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import { SessionService } from '../services/SessionService.js'

export class SessionController {
  private sessionService: SessionService

  constructor() {
    this.sessionService = new SessionService()
  }

  /**
   * GET /api/sessions
   * Obtiene todas las sesiones activas del usuario
   */
  async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user
      if (!user) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId((req as any).requestId)
          .send(res)
        return
      }

      const sessions = await this.sessionService.getUserSessions(user.id)
      ApiResponses.ok({ sessions }, 'User sessions retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/sessions/stats
   * Obtiene estadísticas de sesiones del usuario
   */
  async getSessionStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = (req as any).user
      if (!user) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId((req as any).requestId)
          .send(res)
        return
      }

      const stats = await this.sessionService.getSessionStats(user.id)
      ApiResponses.ok({ stats }, 'Session statistics retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /api/sessions/{sessionId}
   * Desactiva una sesión específica
   */
  async deactivateSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = (req as any).user
      if (!user) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId((req as any).requestId)
          .send(res)
        return
      }

      const sessionId = req.params.sessionId
      if (!sessionId) {
        ApiResponses.badRequest('Session ID is required')
          .withRequestId((req as any).requestId)
          .send(res)
        return
      }

      await this.sessionService.deactivateSession(sessionId, user.id)
      ApiResponses.ok(null, 'Session deactivated successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /api/sessions/all
   * Desactiva todas las sesiones del usuario
   */
  async deactivateAllSessions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = (req as any).user
      if (!user) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId((req as any).requestId)
          .send(res)
        return
      }

      await this.sessionService.deactivateAllUserSessions(user.id)

      // Clear cookies
      res.clearCookie('access_token')
      res.clearCookie('refresh_token')

      ApiResponses.ok(null, 'All sessions deactivated successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }
}
