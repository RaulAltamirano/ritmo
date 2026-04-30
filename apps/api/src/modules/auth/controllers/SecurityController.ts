/**
 * 🛡️ SECURITY CONTROLLER - RITMO API 2025
 *
 * Controlador para operaciones de seguridad
 * Maneja logs de seguridad, verificación de email y auditoría
 */

import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import { SecurityService } from '../services/SecurityService.js'

export class SecurityController {
  private readonly securityService: SecurityService

  constructor() {
    this.securityService = new SecurityService()
  }

  /**
   * GET /api/auth/security-logs
   * Obtiene logs de seguridad del usuario
   */
  async getSecurityLogs(
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

      const { page = 1, limit = 20, severity } = req.query
      const logs = await this.securityService.getSecurityLogs(user.id, {
        page: Number(page),
        limit: Number(limit),
        severity: severity as string,
      })

      ApiResponses.ok({ logs }, 'Security logs retrieved').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/email-verifications
   * Verifica el email del usuario
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.securityService.verifyEmail(req.body)
      ApiResponses.ok({ verified: result }, 'Email verified successfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/email-verification-resends
   * Reenvía email de verificación
   */
  async resendVerification(
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

      await this.securityService.resendVerificationEmail(user.id)
      ApiResponses.ok(null, 'Verification email resent').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/auth/security-summary
   * Obtiene resumen de seguridad del usuario
   */
  async getSecuritySummary(
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

      const summary = await this.securityService.getSecuritySummary(user.id)
      ApiResponses.ok({ summary }, 'Security summary retrieved').send(res)
    } catch (error) {
      next(error)
    }
  }
}
