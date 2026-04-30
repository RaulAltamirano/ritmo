/**
 * 🛡️ SECURITY SERVICE - RITMO API 2025
 *
 * Servicio para operaciones de seguridad
 * Maneja logs de seguridad, verificación de email y auditoría
 */

import prisma from '../../../core/database/prisma.js'
import { StructuredLoggingService } from '../../../infrastructure/logging/StructuredLoggingService.js'
import {
  EmailVerificationDTO,
  SecurityLogDTO,
  SecuritySummaryDTO,
} from '../dto/AuthDTOs.js'

export class SecurityService {
  private readonly loggingService: StructuredLoggingService

  constructor() {
    this.loggingService = new StructuredLoggingService(prisma)
  }

  async getSecurityLogs(
    userId: string,
    options: { page: number; limit: number; severity?: string },
  ): Promise<{ logs: SecurityLogDTO[]; total: number; page: number; limit: number }> {
    const { page, limit, severity } = options
    const skip = (page - 1) * limit

    const whereClause: any = { userId }
    if (severity) {
      whereClause.severity = severity
    }

    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.securityLog.count({ where: whereClause }),
    ])

    return {
      logs: logs.map(log => this.toSecurityLogDTO(log)),
      total,
      page,
      limit,
    }
  }

  async getSecuritySummary(userId: string): Promise<SecuritySummaryDTO> {
    const [
      totalSessions,
      activeSessions,
      trustedDevices,
      recentLogins,
      failedAttempts,
      user,
    ] = await Promise.all([
      prisma.userSession.count({ where: { userId } }),
      prisma.userSession.count({ where: { userId, isActive: true } }),
      prisma.userSession.count({ where: { userId, isTrusted: true } }),
      prisma.securityLog.count({
        where: {
          userId,
          eventType: 'login_success',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      }),
      prisma.securityLog.count({
        where: {
          userId,
          eventType: 'login_failed',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { lastPasswordChange: true, isEmailVerified: true },
      }),
    ])

    return {
      totalSessions,
      activeSessions,
      trustedDevices,
      recentLogins,
      failedAttempts,
      lastPasswordChange: user?.lastPasswordChange,
      twoFactorEnabled: false, // TODO: Implement 2FA
      emailVerified: user?.isEmailVerified ?? false,
    }
  }

  verifyEmail(verificationData: EmailVerificationDTO): Promise<boolean> {
    // TODO: Implement email verification logic
    // This would typically involve:
    // 1. Validating the verification token
    // 2. Updating user's email verification status
    // 3. Logging the verification event

    console.log('Email verification requested:', verificationData)
    return Promise.resolve(true)
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, isEmailVerified: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified')
    }

    // TODO: Generate new verification token and send email
    console.log(`Resending verification email to ${user.email}`)

    // Log the resend event
    await this.loggingService.logAuthEvent(
      'system_event',
      userId,
      null,
      undefined,
      undefined,
      'Verification email resent',
      'low',
      { email: user.email },
    )
  }

  private toSecurityLogDTO(log: any): SecurityLogDTO {
    return {
      id: log.id,
      userId: log.userId,
      eventType: log.eventType,
      severity: log.severity,
      description: log.description,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      metadata: log.metadata,
      createdAt: log.createdAt,
    }
  }
}
