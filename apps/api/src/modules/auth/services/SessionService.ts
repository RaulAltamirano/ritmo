/**
 * 🎫 SESSION SERVICE - RITMO API 2025
 *
 * Servicio para gestión de sesiones
 * Maneja sesiones activas, estadísticas y dispositivos
 */

import prisma from '../../../core/database/prisma.js'
import { SessionService as CoreSessionService } from '../../../infrastructure/security/SessionService.js'
import { SessionDTO } from '../dto/AuthDTOs.js'

export class SessionService {
  private readonly coreSessionService: CoreSessionService

  constructor() {
    this.coreSessionService = new CoreSessionService(prisma)
  }

  async getUserSessions(userId: string): Promise<SessionDTO[]> {
    const sessions = await this.coreSessionService.findActiveSessions(userId)
    return sessions.map(session => this.toSessionDTO(session))
  }

  async getSessionStats(userId: string): Promise<any> {
    return this.coreSessionService.getSessionStats(userId)
  }

  async deactivateSession(sessionId: string, userId: string): Promise<void> {
    await this.coreSessionService.deactivateSession(sessionId, userId)
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    await this.coreSessionService.deactivateAllUserSessions(userId)
  }

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
      deviceTrust: session.deviceTrust ?? 'medium',
    }
  }
}
