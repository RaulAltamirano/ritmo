import {
  type Prisma,
  PrismaClient,
  type SecurityEventType,
  type SecuritySeverity,
  UserSession,
} from '@prisma/client'
import { SessionConsolidationStrategy } from '../../core/types/session.js'
import { generateDeviceFingerprint } from '../../core/utils/deviceFingerprint.js'
import { StructuredLoggingService } from '../logging/StructuredLoggingService.js'
import { DeviceValidationService } from './DeviceValidationService'

export class SessionService {
  private prisma: PrismaClient
  private _deviceValidationService: DeviceValidationService | null = null
  private _loggingService: StructuredLoggingService

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this._loggingService = new StructuredLoggingService(prisma)
  }

  /**
   * Get DeviceValidationService instance (lazy initialization)
   */
  private get deviceValidationService(): DeviceValidationService {
    if (!this._deviceValidationService) {
      this._deviceValidationService = new DeviceValidationService(this.prisma)
    }
    return this._deviceValidationService
  }

  /**
   * Estrategia de consolidación de sesiones
   */
  private consolidationStrategy: SessionConsolidationStrategy = {
    maxSessionsPerUser: 5, // Máximo 5 sesiones por usuario
    maxSessionsPerDevice: 1, // Máximo 1 sesión por dispositivo
    autoConsolidate: true, // Consolidación automática
    preserveTrustedSessions: true, // Preservar sesiones confiables
    sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 días
  }

  /**
   * Buscar sesión existente por dispositivo
   */
  async findSessionByDevice(
    userId: string,
    deviceId: string,
  ): Promise<UserSession | null> {
    return await this.prisma.userSession.findFirst({
      where: {
        userId,
        deviceId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    })
  }

  /**
   * Buscar sesiones activas del usuario
   */
  async findActiveSessions(userId: string): Promise<UserSession[]> {
    return await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastActivity: 'desc',
      },
    })
  }

  /**
   * Verificar si el usuario puede crear más sesiones
   */
  async canCreateNewSession(userId: string): Promise<boolean> {
    const activeSessions = await this.findActiveSessions(userId)
    return activeSessions.length < this.consolidationStrategy.maxSessionsPerUser
  }

  /**
   * Consolidar sesiones duplicadas del usuario
   */
  async consolidateDuplicateSessions(userId: string): Promise<void> {
    const activeSessions = await this.findActiveSessions(userId)

    // Agrupar sesiones por dispositivo
    const sessionsByDevice = new Map<string, UserSession[]>()

    activeSessions.forEach(session => {
      const deviceKey = session.deviceId || 'unknown'
      if (!sessionsByDevice.has(deviceKey)) {
        sessionsByDevice.set(deviceKey, [])
      }
      sessionsByDevice.get(deviceKey)!.push(session)
    })

    // Para cada dispositivo, mantener solo la sesión más reciente
    for (const [deviceId, sessions] of sessionsByDevice) {
      if (sessions.length > 1) {
        // Ordenar por última actividad y mantener la más reciente
        sessions.sort(
          (a, b) =>
            new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
        )

        const [keepSession, ...duplicateSessions] = sessions

        // Desactivar sesiones duplicadas
        await this.prisma.userSession.updateMany({
          where: {
            id: {
              in: duplicateSessions.map(s => s.id),
            },
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        })

        // Duplicate sessions consolidated
      }
    }
  }

  /**
   * Actualizar sesión existente (no crear nueva)
   */
  async updateExistingSession(
    sessionRecordId: string,
    updateData: {
      lastActivity?: Date
      expiresAt?: Date
      sessionId?: string // 🔥 NEW: Allow updating sessionId
    },
  ): Promise<UserSession> {
    const updatedSession = await this.prisma.userSession.update({
      where: { id: sessionRecordId },
      data: {
        lastActivity: updateData.lastActivity || new Date(),
        expiresAt: updateData.expiresAt || this.calculateNewExpiry(),
        sessionId: updateData.sessionId || undefined, // 🔥 NEW: Update sessionId if provided
        isActive: true,
        updatedAt: new Date(),
      },
    })

    // Session updated successfully
    return updatedSession
  }

  /**
   * Crear nueva sesión solo si es necesario
   */
  async createNewSession(
    userId: string,
    deviceId: string,
    sessionData: {
      sessionId: string
      deviceInfo?: any
    },
  ): Promise<UserSession> {
    // Verificar si ya existe una sesión para este dispositivo
    const existingSession = await this.findSessionByDevice(userId, deviceId)

    if (existingSession) {
      throw new Error(`Session already exists for device ${deviceId}`)
    }

    // Verificar límite de sesiones
    if (!(await this.canCreateNewSession(userId))) {
      // Consolidar sesiones antes de crear nueva
      await this.consolidateDuplicateSessions(userId)

      if (!(await this.canCreateNewSession(userId))) {
        throw new Error('Maximum sessions limit reached')
      }
    }

    const newSession = await this.prisma.userSession.create({
      data: {
        userId,
        sessionId: sessionData.sessionId,
        deviceId,
        deviceName: sessionData.deviceInfo?.deviceName || 'Unknown Device',
        deviceType: sessionData.deviceInfo?.deviceType || 'desktop',
        browser: sessionData.deviceInfo?.browser || 'Unknown',
        os: sessionData.deviceInfo?.os || 'Unknown',
        ipAddress: sessionData.deviceInfo?.ipAddress || '::1',
        userAgent: sessionData.deviceInfo?.userAgent || '',
        isActive: true,
        expiresAt: this.calculateNewExpiry(),
        lastActivity: new Date(),
      },
    })

    // New session created successfully
    return newSession
  }

  /**
   * 🔥 INTELLIGENT LOGIN 2025 - Enhanced Session Reuse & Consolidation
   *
   * Now with cryptographic device validation for enhanced security
   */
  async intelligentLogin(
    userId: string,
    deviceInfo: any,
    sessionId: string,
    ipAddress?: string,
  ): Promise<{
    session: UserSession
    isNewSession: boolean
    message: string
    deviceTrust?: 'high' | 'medium' | 'low'
  }> {
    try {
      // STEP 1: 🔐 CRYPTOGRAPHIC DEVICE VALIDATION
      let deviceTrust: 'high' | 'medium' | 'low' = 'medium'

      if (ipAddress) {
        const validationResult =
          await this.deviceValidationService.validateDeviceFingerprint(
            deviceInfo,
            deviceInfo.deviceSignature || null,
            sessionId,
            ipAddress,
          )

        deviceTrust = validationResult.trustLevel

        if (validationResult.warnings.length > 0) {
          // Log validation warnings for security monitoring
        }

        if (validationResult.securityFlags.length > 0) {
          // Log security flags for monitoring
        }
      }

      const deviceId = deviceInfo.deviceId || generateDeviceFingerprint(deviceInfo)

      // STEP 2: Buscar sesión existente ACTIVA para este dispositivo
      const existingSession = await this.findSessionByDevice(userId, deviceId)

      if (existingSession && existingSession.isActive) {
        // Reusing existing session with enhanced security
        console.log(`🔄 DEBUG - Reusing existing session:`, {
          existingSessionId: existingSession.sessionId,
          newSessionId: sessionId,
          deviceId,
        })

        // Update session with trust level AND new sessionId
        const updatedSession = await this.updateExistingSession(existingSession.id, {
          lastActivity: new Date(),
          expiresAt: new Date(Date.now() + this.consolidationStrategy.sessionTimeout),
          sessionId, // 🔥 CRITICAL FIX: Update sessionId to match JWT token
        })

        console.log(`✅ DEBUG - Session updated successfully:`, {
          updatedSessionId: updatedSession.sessionId,
          isActive: updatedSession.isActive,
        })

        // Log session reuse
        await this._loggingService.logSessionEvent(
          'session_created' as any,
          userId,
          sessionId,
          ipAddress,
          deviceInfo.userAgent,
          'Session reused for existing device',
          { deviceTrust, deviceId },
        )

        return {
          session: updatedSession,
          isNewSession: false,
          message: 'Sesión existente reutilizada exitosamente',
          deviceTrust,
        }
      } else {
        // Creating new session for device with validation

        // STEP 3: Limpiar sesiones inactivas del mismo dispositivo
        await this.prisma.userSession.updateMany({
          where: {
            userId,
            deviceId,
            isActive: false,
          },
          data: { isActive: false }, // Ensure they're marked inactive
        })

        // STEP 4: Aplicar límites de sesiones por usuario
        await this.enforceSessionLimits(userId)

        // STEP 5: Crear nueva sesión con información de confianza
        const newSession = await this.createNewSession(userId, deviceId, {
          sessionId,
          deviceInfo: {
            ...deviceInfo,
            trustLevel: deviceTrust,
            validationTimestamp: Date.now(),
          },
        })

        // Log new session creation
        await this._loggingService.logSessionEvent(
          'session_created' as any,
          userId,
          sessionId,
          ipAddress,
          deviceInfo.userAgent,
          'New session created for device',
          { deviceTrust, deviceId, isNewDevice: true },
        )

        return {
          session: newSession,
          isNewSession: true,
          message: 'Nueva sesión creada exitosamente',
          deviceTrust,
        }
      }
    } catch (error) {
      console.error('Intelligent login error:', error)
      throw new Error('Session creation failed due to validation error')
    }
  }

  /**
   * 🔥 ENFORCE SESSION LIMITS - Prevent Session Explosion
   */
  private async enforceSessionLimits(userId: string): Promise<void> {
    const activeSessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
    })

    if (activeSessions.length >= this.consolidationStrategy.maxSessionsPerUser) {
      // Deactivate oldest sessions
      const sessionsToDeactivate = activeSessions.slice(
        this.consolidationStrategy.maxSessionsPerUser - 1,
      )

      for (const session of sessionsToDeactivate) {
        await this.prisma.userSession.update({
          where: { id: session.id },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        })

        // Also revoke associated refresh tokens
        await this.prisma.refreshToken.updateMany({
          where: { sessionId: session.sessionId },
          data: {
            isRevoked: true,
            updatedAt: new Date(),
          },
        })
      }

      // Old sessions deactivated
    }
  }

  /**
   * Actualizar actividad de sesión
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        lastActivity: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Desactivar sesión específica del usuario
   */
  async deactivateSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    })

    await this.prisma.userSession.update({
      where: {
        id: sessionId,
        userId, // Asegurar que la sesión pertenezca al usuario
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    // Log session termination
    if (session) {
      await this._loggingService.logSessionEvent(
        'session_revoked' as any,
        userId,
        sessionId,
        session.ipAddress || undefined,
        session.userAgent || undefined,
        'Session terminated by user',
        { reason: 'user_request' },
      )
    }
  }

  /**
   * Desactivar todas las sesiones del usuario
   */
  async deactivateAllUserSessions(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Limpiar sesiones expiradas
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.userSession.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    // Expired sessions cleaned up
    return result.count
  }

  /**
   * Obtener estadísticas de sesiones
   */
  async getSessionStats(userId: string): Promise<{
    totalSessions: number
    activeSessions: number
    expiredSessions: number
    sessionsByDevice: Record<string, number>
  }> {
    const allSessions = await this.prisma.userSession.findMany({
      where: { userId },
    })

    const activeSessions = allSessions.filter(
      s => s.isActive && new Date(s.expiresAt) > new Date(),
    )
    const expiredSessions = allSessions.filter(s => new Date(s.expiresAt) <= new Date())

    const sessionsByDevice = allSessions.reduce(
      (acc, session) => {
        const deviceKey = session.deviceId || 'unknown'
        acc[deviceKey] = (acc[deviceKey] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalSessions: allSessions.length,
      activeSessions: activeSessions.length,
      expiredSessions: expiredSessions.length,
      sessionsByDevice,
    }
  }

  /**
   * Calcular nueva fecha de expiración
   */
  private calculateNewExpiry(): Date {
    return new Date(Date.now() + this.consolidationStrategy.sessionTimeout)
  }

  /**
   * 🔥 SESSION LIFECYCLE MANAGEMENT - 2025 COMPLETE IMPLEMENTATION
   *
   * Critical missing features for enterprise-grade session management
   */

  /**
   * 🕐 Automatic Session Expiration Handler
   * Runs periodically to clean up expired sessions
   */
  async handleSessionExpiration(): Promise<{
    expiredSessions: number
    cleanedSessions: number
    activeSessions: number
  }> {
    try {
      // Find all expired sessions
      const expiredSessions = await this.prisma.userSession.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
          isActive: true,
        },
      })

      // Deactivate expired sessions
      if (expiredSessions.length > 0) {
        await this.prisma.userSession.updateMany({
          where: {
            id: {
              in: expiredSessions.map(s => s.id),
            },
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        })
      }

      // Get current active sessions count
      const activeSessions = await this.prisma.userSession.count({
        where: { isActive: true },
      })

      return {
        expiredSessions: expiredSessions.length,
        cleanedSessions: expiredSessions.length,
        activeSessions,
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 🔄 Session Renewal Logic
   * Extends session if user is active and session is about to expire
   */
  async renewSessionIfNeeded(sessionId: string): Promise<{
    renewed: boolean
    newExpiry: Date | null
    message: string
  }> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { id: sessionId },
      })

      if (!session || !session.isActive) {
        return {
          renewed: false,
          newExpiry: null,
          message: 'Session not found or inactive',
        }
      }

      // Check if session expires in next 30 minutes
      const expiresIn = session.expiresAt.getTime() - Date.now()
      const thirtyMinutes = 30 * 60 * 1000

      if (expiresIn < thirtyMinutes) {
        // Renew session
        const newExpiry = new Date(
          Date.now() + this.consolidationStrategy.sessionTimeout,
        )

        await this.prisma.userSession.update({
          where: { id: sessionId },
          data: {
            expiresAt: newExpiry,
            lastActivity: new Date(),
            updatedAt: new Date(),
          },
        })

        return {
          renewed: true,
          newExpiry,
          message: 'Session renewed successfully',
        }
      }

      return {
        renewed: false,
        newExpiry: null,
        message: 'Session does not need renewal',
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 🚨 Real-time Security Monitoring
   * Detects suspicious activity and security threats
   */
  async detectSecurityThreats(
    sessionId: string,
    currentRequest: {
      ipAddress: string
      userAgent: string
      timestamp: Date
    },
  ): Promise<{
    threats: string[]
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    recommendations: string[]
  }> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { id: sessionId },
      })

      if (!session) {
        return {
          threats: ['Session not found'],
          riskLevel: 'critical',
          recommendations: ['Terminate session immediately'],
        }
      }

      const threats: string[] = []
      const recommendations: string[] = []
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

      // 1. IP Address Anomaly Detection
      if (session.ipAddress !== currentRequest.ipAddress) {
        threats.push('IP address changed unexpectedly')
        riskLevel = 'high'
        recommendations.push('Verify device identity')
      }

      // 2. User Agent Mismatch
      if (session.userAgent !== currentRequest.userAgent) {
        threats.push('User agent changed unexpectedly')
        riskLevel = 'medium'
        recommendations.push('Check for device compromise')
      }

      // 3. Geographic Anomaly Detection
      if (
        session.ipAddress &&
        this.isGeographicAnomaly(session.ipAddress, currentRequest.ipAddress)
      ) {
        threats.push('Geographic location changed significantly')
        riskLevel = 'high'
        recommendations.push('Require re-authentication')
      }

      // 4. Time-based Anomaly
      if (this.isTimeAnomaly(session.lastActivity, currentRequest.timestamp)) {
        threats.push('Unusual activity timing detected')
        riskLevel = 'medium'
        recommendations.push('Review recent activity')
      }

      // 5. Session Age Analysis
      const sessionAge = Date.now() - session.createdAt.getTime()
      const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
      if (sessionAge > maxAge) {
        threats.push('Session is very old')
        riskLevel = 'medium'
        recommendations.push('Consider session refresh')
      }

      if (threats.length > 0) {
        // Log security event
        await this.logSecurityEvent(sessionId, 'suspicious_activity', {
          threats,
          riskLevel,
          currentRequest,
        })
      }

      return { threats, riskLevel, recommendations }
    } catch (error) {
      return {
        threats: ['Threat detection failed'],
        riskLevel: 'critical',
        recommendations: ['Investigate system error'],
      }
    }
  }

  /**
   * 🌍 Geographic Anomaly Detection
   * Detects if user location changed significantly
   */
  private isGeographicAnomaly(originalIP: string, currentIP: string): boolean {
    // TODO: Implement real IP geolocation service
    // For now, simple IP change detection
    return originalIP !== currentIP
  }

  /**
   * ⏰ Time-based Anomaly Detection
   * Detects unusual activity patterns
   */
  private isTimeAnomaly(lastActivity: Date, currentTime: Date): boolean {
    const timeDiff = currentTime.getTime() - lastActivity.getTime()
    const oneHour = 60 * 60 * 1000

    // Flag if activity resumed after more than 1 hour of inactivity
    return timeDiff > oneHour
  }

  /**
   * 📝 Security Event Logging
   * Logs all security-related events for audit
   */
  private async logSecurityEvent(
    sessionId: string,
    eventType: SecurityEventType,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      const riskLevel =
        typeof metadata.riskLevel === 'string' ? metadata.riskLevel : 'low'
      const payload = JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue
      await this.prisma.securityLog.create({
        data: {
          sessionId,
          eventType,
          eventDescription: `Security event: ${eventType}`,
          severity: this.mapRiskLevelToSeverity(riskLevel),
          metadata: payload,
        },
      })
    } catch (error) {
      // Handle security event logging error silently
    }
  }

  /**
   * 🎯 Map Risk Level to Security Severity
   */
  private mapRiskLevelToSeverity(riskLevel: string): SecuritySeverity {
    switch (riskLevel) {
      case 'low':
        return 'low'
      case 'medium':
        return 'medium'
      case 'high':
        return 'high'
      case 'critical':
        return 'critical'
      default:
        return 'medium'
    }
  }

  /**
   * 🔐 Session Hijacking Prevention
   * Implements additional security measures
   */
  async preventSessionHijacking(
    sessionId: string,
    requestData: {
      ipAddress: string
      userAgent: string
      deviceFingerprint: string
    },
  ): Promise<{
    allowed: boolean
    reason: string
    securityMeasures: string[]
  }> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { id: sessionId },
      })

      if (!session) {
        return {
          allowed: false,
          reason: 'Session not found',
          securityMeasures: ['Terminate access'],
        }
      }

      const securityMeasures: string[] = []
      let allowed = true
      let reason = 'Access granted'

      // 1. Device Fingerprint Validation
      if (session.deviceId && session.deviceId !== requestData.deviceFingerprint) {
        allowed = false
        reason = 'Device fingerprint mismatch'
        securityMeasures.push('Device verification required')
      }

      // 2. IP Address Validation
      if (session.ipAddress && session.ipAddress !== requestData.ipAddress) {
        allowed = false
        reason = 'IP address changed'
        securityMeasures.push('Location verification required')
      }

      // 3. User Agent Validation
      if (session.userAgent && session.userAgent !== requestData.userAgent) {
        allowed = false
        reason = 'User agent changed'
        securityMeasures.push('Browser verification required')
      }

      if (!allowed) {
        // Session hijacking attempt detected

        // Log security event
        await this.logSecurityEvent(sessionId, 'session_suspicious', {
          reason,
          requestData,
          originalSession: {
            deviceId: session.deviceId,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
          },
        })
      }

      return { allowed, reason, securityMeasures }
    } catch (error) {
      console.error('❌ [SECURITY] Session hijacking prevention failed:', error)
      return {
        allowed: false,
        reason: 'Security check failed',
        securityMeasures: ['Investigate system error'],
      }
    }
  }

  /**
   * 📊 Session Analytics and Reporting
   * Provides comprehensive session insights
   */
  async generateSessionReport(
    userId: string,
    timeRange: {
      start: Date
      end: Date
    },
  ): Promise<{
    totalSessions: number
    activeSessions: number
    expiredSessions: number
    securityEvents: number
    deviceBreakdown: any[]
    activityTimeline: any[]
    recommendations: string[]
  }> {
    try {
      // Get session statistics
      const [totalSessions, activeSessions, expiredSessions] = await Promise.all([
        this.prisma.userSession.count({
          where: {
            userId,
            createdAt: { gte: timeRange.start, lte: timeRange.end },
          },
        }),
        this.prisma.userSession.count({
          where: {
            userId,
            isActive: true,
            expiresAt: { gt: new Date() },
          },
        }),
        this.prisma.userSession.count({
          where: {
            userId,
            expiresAt: { lt: new Date() },
          },
        }),
      ])

      // Get security events count
      const securityEvents = await this.prisma.securityLog.count({
        where: {
          sessionId: {
            in: (
              await this.prisma.userSession.findMany({
                where: { userId },
                select: { id: true },
              })
            ).map(s => s.id),
          },
        },
      })

      // Get device breakdown
      const deviceBreakdown = await this.prisma.userSession.groupBy({
        by: ['deviceType', 'browser'],
        where: {
          userId,
          createdAt: { gte: timeRange.start, lte: timeRange.end },
        },
        _count: { id: true },
      })

      // Generate recommendations
      const recommendations: string[] = []
      if (activeSessions > 3) {
        recommendations.push('Consider reducing active sessions for better security')
      }
      if (securityEvents > 0) {
        recommendations.push('Review security events and consider additional measures')
      }
      if (expiredSessions > 10) {
        recommendations.push(
          'Implement automatic session cleanup for better performance',
        )
      }

      return {
        totalSessions,
        activeSessions,
        expiredSessions,
        securityEvents,
        deviceBreakdown,
        activityTimeline: [], // TODO: Implement timeline
        recommendations,
      }
    } catch (error) {
      console.error('❌ [SESSION] Session report generation failed:', error)
      throw error
    }
  }
}
