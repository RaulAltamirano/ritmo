/**
 * 🎫 SESSION SERVICE - RITMO API 2025
 *
 * Servicio independiente para gestión de sesiones
 * Siguiendo Clean Architecture y Domain Driven Design
 */

import prisma from '../../../core/database/prisma.js'
import { SessionService as CoreSessionService } from '../../../infrastructure/security/SessionService.js'
import { SessionDTO, SessionStatsDTO } from '../dto/SessionDTOs.js'

export class SessionService {
  private coreSessionService: CoreSessionService

  constructor() {
    this.coreSessionService = new CoreSessionService(prisma)
  }

  /**
   * Obtiene todas las sesiones activas del usuario
   */
  async getUserSessions(userId: string): Promise<SessionDTO[]> {
    const sessions = await this.coreSessionService.findActiveSessions(userId)
    return sessions.map(session => this.toSessionDTO(session))
  }

  /**
   * Obtiene estadísticas de sesiones del usuario
   */
  async getSessionStats(userId: string): Promise<SessionStatsDTO> {
    return await this.coreSessionService.getSessionStats(userId)
  }

  /**
   * Desactiva una sesión específica
   */
  async deactivateSession(sessionId: string, userId: string): Promise<void> {
    await this.coreSessionService.deactivateSession(sessionId, userId)
  }

  /**
   * Desactiva todas las sesiones del usuario
   */
  async deactivateAllUserSessions(userId: string): Promise<void> {
    await this.coreSessionService.deactivateAllUserSessions(userId)
  }

  /**
   * Convierte una sesión de la base de datos a DTO
   */
  private toSessionDTO(session: any): SessionDTO {
    return {
      id: session.id,
      userId: session.userId,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isActive: session.isActive,
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
      deviceTrust: session.deviceTrust || 'medium',
    }
  }
}
