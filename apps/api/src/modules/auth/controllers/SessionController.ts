/**
 * 🎫 SESSION CONTROLLER - RITMO API 2025
 *
 * Controlador para gestión de sesiones
 * Maneja sesiones activas, estadísticas y dispositivos
 */

import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import { SessionService } from '../services/SessionService.js'

export class SessionController {
  private readonly sessionService: SessionService

  constructor() {
    this.sessionService = new SessionService()
  }

  /**
   * GET /api/auth/sessions
   * Obtiene todas las sesiones activas del usuario
   */
  async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as any
      if (!user) {
        ApiResponses.unauthorized('User not authenticated').send(res, 401)
        return
      }

      const sessions = await this.sessionService.getUserSessions(user.id)
      ApiResponses.ok({ sessions }, 'User sessions retrieved').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/auth/sessions/stats
   * Obtiene estadísticas de sesiones del usuario
   */
  async getSessionStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { user } = req as any
      if (!user) {
        ApiResponses.unauthorized('User not authenticated').send(res, 401)
        return
      }

      const stats = await this.sessionService.getSessionStats(user.id)
      ApiResponses.ok({ stats }, 'Session statistics retrieved').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /api/auth/sessions/{sessionId}
   * Desactiva una sesión específica
   */
  async deactivateSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { user } = req as any
      if (!user) {
        ApiResponses.unauthorized('User not authenticated').send(res, 401)
        return
      }

      const { sessionId } = req.params
      if (!sessionId) {
        ApiResponses.badRequest('Session ID required').send(res, 400)
        return
      }

      await this.sessionService.deactivateSession(sessionId, user.id)
      ApiResponses.ok(null, 'Session deactivated').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /api/auth/sessions/all
   * Desactiva todas las sesiones del usuario
   */
  async deactivateAllSessions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { user } = req as any
      if (!user) {
        ApiResponses.unauthorized('User not authenticated').send(res, 401)
        return
      }

      await this.sessionService.deactivateAllUserSessions(user.id)

      // Clear cookies
      res.clearCookie('access_token')
      res.clearCookie('refresh_token')

      ApiResponses.ok(null, 'All sessions deactivated').send(res)
    } catch (error) {
      next(error)
    }
  }
}
