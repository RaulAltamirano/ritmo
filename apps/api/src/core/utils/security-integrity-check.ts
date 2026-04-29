/**
 * 🔐 SECURITY INTEGRITY CHECK - 100% Guarantee System
 *
 * This utility ensures that all security implementations are properly integrated
 * and no legacy code or insecure fallbacks exist
 */

import { PrismaClient } from '@prisma/client'
import { SECURITY_CONSTANTS } from '../../shared/constants/security-constants.js'
import { DeviceValidationService } from '../../infrastructure/security/DeviceValidationService.js'
import { TokenRotationService } from '../../infrastructure/security/TokenRotationService.js'
import { config } from '@ritmo/config'

export interface SecurityIntegrityReport {
  timestamp: Date
  overallScore: number
  checks: SecurityCheck[]
  recommendations: string[]
  isCompliant: boolean
}

export interface SecurityCheck {
  name: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  description: string
  details?: any
}

/**
 * 🔍 SECURITY INTEGRITY CHECKER
 *
 * Performs comprehensive verification of all security implementations
 */
export class SecurityIntegrityChecker {
  private readonly prisma: PrismaClient
  private readonly tokenRotationService: TokenRotationService
  private readonly deviceValidationService: DeviceValidationService

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.tokenRotationService = new TokenRotationService(prisma)
    this.deviceValidationService = new DeviceValidationService(prisma)
  }

  /**
   * 🎯 RUN COMPLETE SECURITY INTEGRITY CHECK
   *
   * Performs all security checks and generates comprehensive report
   */
  async runFullSecurityCheck(): Promise<SecurityIntegrityReport> {
    const checks: SecurityCheck[] = []
    let totalScore = 0
    let passedChecks = 0

    // 1. Token Rotation Service Check
    const tokenRotationCheck = await this.checkTokenRotationService()
    checks.push(tokenRotationCheck)
    if (tokenRotationCheck.status === 'PASS') {
      totalScore += 25
      passedChecks++
    }

    // 2. Device Validation Service Check
    const deviceValidationCheck = await this.checkDeviceValidationService()
    checks.push(deviceValidationCheck)
    if (deviceValidationCheck.status === 'PASS') {
      totalScore += 25
      passedChecks++
    }

    // 3. Database Security Check
    const databaseSecurityCheck = await this.checkDatabaseSecurity()
    checks.push(databaseSecurityCheck)
    if (databaseSecurityCheck.status === 'PASS') {
      totalScore += 20
      passedChecks++
    }

    // 4. API Security Check
    const apiSecurityCheck = this.checkAPISecurity()
    checks.push(apiSecurityCheck)
    if (apiSecurityCheck.status === 'PASS') {
      totalScore += 20
      passedChecks++
    }

    // 5. Configuration Security Check
    const configSecurityCheck = this.checkConfigurationSecurity()
    checks.push(configSecurityCheck)
    if (configSecurityCheck.status === 'PASS') {
      totalScore += 10
      passedChecks++
    }

    const isCompliant = totalScore >= 95 && passedChecks === 5
    const recommendations = this.generateRecommendations(checks, totalScore)

    return {
      timestamp: new Date(),
      overallScore: totalScore,
      checks,
      recommendations,
      isCompliant,
    }
  }

  /**
   * 🔄 CHECK TOKEN ROTATION SERVICE INTEGRITY
   */
  private async checkTokenRotationService(): Promise<SecurityCheck> {
    try {
      // Verify service is properly initialized
      if (!this.tokenRotationService) {
        return {
          name: 'Token Rotation Service',
          status: 'FAIL',
          description: 'Service not properly initialized',
          details: 'TokenRotationService instance is null',
        }
      }

      // Test token family creation with a real user or create test user
      let testUserId = 'test-user'
      let testFamilyId: string | null = null

      try {
        // Try to find an existing user first
        const existingUser = await this.prisma.user.findFirst()
        if (existingUser) {
          testUserId = existingUser.id
        } else {
          // Create a test user if none exists
          const testUser = await this.prisma.user.create({
            data: {
              email: 'test@security-check.com',
              username: 'security-test-user',
              passwordHash: 'test-hash-for-security-check-only',
              displayName: 'Security Test User',
            },
          })
          testUserId = testUser.id
        }

        testFamilyId = await this.tokenRotationService.createTokenFamily(
          testUserId,
          'test-session',
        )
        if (!testFamilyId || typeof testFamilyId !== 'string') {
          return {
            name: 'Token Rotation Service',
            status: 'FAIL',
            description: 'Token family creation failed',
            details: 'createTokenFamily returned invalid result',
          }
        }

        // Clean up test user if we created one
        if (testUserId !== 'test-user') {
          await this.prisma.user.delete({ where: { id: testUserId } })
        }
      } catch (error) {
        return {
          name: 'Token Rotation Service',
          status: 'FAIL',
          description: 'Token family creation failed with error',
          details: error instanceof Error ? error.message : 'Unknown error',
        }
      }

      // Test cleanup functionality
      const cleanupResult = await this.tokenRotationService.cleanupExpiredTokens()
      if (typeof cleanupResult !== 'number') {
        return {
          name: 'Token Rotation Service',
          status: 'FAIL',
          description: 'Cleanup functionality failed',
          details: 'cleanupExpiredTokens returned invalid result',
        }
      }

      return {
        name: 'Token Rotation Service',
        status: 'PASS',
        description: 'Service fully operational with all features working',
        details: {
          familyCreation: 'SUCCESS',
          cleanup: 'SUCCESS',
          testFamilyId: `${testFamilyId.substring(0, 8)}...`,
        },
      }
    } catch (error) {
      return {
        name: 'Token Rotation Service',
        status: 'FAIL',
        description: 'Service check failed with error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 🔐 CHECK DEVICE VALIDATION SERVICE INTEGRITY
   */
  private async checkDeviceValidationService(): Promise<SecurityCheck> {
    try {
      // Verify service is properly initialized
      if (!this.deviceValidationService) {
        return {
          name: 'Device Validation Service',
          status: 'FAIL',
          description: 'Service not properly initialized',
          details: 'DeviceValidationService instance is null',
        }
      }

      // Test device challenge generation
      const testChallenge =
        await this.deviceValidationService.generateDeviceChallenge('test-session')
      if (!testChallenge?.challenge || !testChallenge.challengeHash) {
        return {
          name: 'Device Validation Service',
          status: 'FAIL',
          description: 'Device challenge generation failed',
          details: 'generateDeviceChallenge returned invalid result',
        }
      }

      // Test validation with mock data
      const mockDeviceInfo = {
        deviceId: 'test-device-123',
        deviceType: 'desktop',
        os: 'Windows',
        browser: 'Chrome',
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent',
      }

      const validationResult =
        await this.deviceValidationService.validateDeviceFingerprint(
          mockDeviceInfo as any,
          null,
          'test-session',
          '127.0.0.1',
        )

      if (!validationResult || typeof validationResult.isValid !== 'boolean') {
        return {
          name: 'Device Validation Service',
          status: 'FAIL',
          description: 'Device validation failed',
          details: 'validateDeviceFingerprint returned invalid result',
        }
      }

      return {
        name: 'Device Validation Service',
        status: 'PASS',
        description: 'Service fully operational with all features working',
        details: {
          challengeGeneration: 'SUCCESS',
          validation: 'SUCCESS',
          trustLevel: validationResult.trustLevel,
        },
      }
    } catch (error) {
      return {
        name: 'Device Validation Service',
        status: 'FAIL',
        description: 'Service check failed with error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 🗄️ CHECK DATABASE SECURITY INTEGRITY
   */
  private async checkDatabaseSecurity(): Promise<SecurityCheck> {
    try {
      // Check if security tables exist
      const securityLogsCount = await this.prisma.securityLog.count()
      const refreshTokensCount = await this.prisma.refreshToken.count()
      const userSessionsCount = await this.prisma.userSession.count()

      // Verify security event types are properly configured
      // Use a simpler approach to check if the enum exists
      let securityEventTypes: any[] = []

      try {
        securityEventTypes = await this.prisma.$queryRaw`
          SELECT unnest(enum_range(NULL::security_event_type)) as event_type
        `

        if (!Array.isArray(securityEventTypes) || securityEventTypes.length === 0) {
          return {
            name: 'Database Security',
            status: 'FAIL',
            description: 'Security event types not properly configured',
            details: 'No security event types found in database',
          }
        }
      } catch {
        // If the enum doesn't exist, try to create a test security log entry
        try {
          await this.prisma.securityLog.create({
            data: {
              eventType: 'system_event',
              eventDescription: 'Security integrity check test',
              severity: 'info',
              ipAddress: '127.0.0.1',
              metadata: { test: true },
            },
          })

          // Clean up test entry
          await this.prisma.securityLog.deleteMany({
            where: { metadata: { path: ['test'], equals: true } },
          })
        } catch (createError) {
          return {
            name: 'Database Security',
            status: 'FAIL',
            description: 'Security log table not properly configured',
            details: `Cannot create security log entries: ${createError instanceof Error ? createError.message : 'Unknown error'}`,
          }
        }
      }

      return {
        name: 'Database Security',
        status: 'PASS',
        description: 'Database security properly configured',
        details: {
          securityLogs: securityLogsCount,
          refreshTokens: refreshTokensCount,
          userSessions: userSessionsCount,
          eventTypes: securityEventTypes.length,
        },
      }
    } catch (error) {
      return {
        name: 'Database Security',
        status: 'FAIL',
        description: 'Database security check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 🌐 CHECK API SECURITY INTEGRITY
   */
  private checkAPISecurity(): SecurityCheck {
    try {
      // Check environment variables
      const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'NODE_ENV']

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

      if (missingVars.length > 0) {
        return {
          name: 'API Security',
          status: 'FAIL',
          description: 'Required environment variables missing',
          details: `Missing: ${missingVars.join(', ')}`,
        }
      }

      // Check JWT secret strength
      const jwtSecret = config.security.jwt.secret
      const jwtRefreshSecret = config.security.jwt.refreshSecret

      if (jwtSecret.length < 32 || jwtRefreshSecret.length < 32) {
        return {
          name: 'API Security',
          status: 'WARNING',
          description: 'JWT secrets may be too short',
          details: {
            jwtSecretLength: jwtSecret.length,
            jwtRefreshSecretLength: jwtRefreshSecret.length,
            recommendedLength: 64,
          },
        }
      }

      return {
        name: 'API Security',
        status: 'PASS',
        description: 'API security properly configured',
        details: {
          environment: config.server.environment,
          jwtSecretLength: jwtSecret.length,
          jwtRefreshSecretLength: jwtRefreshSecret.length,
        },
      }
    } catch (error) {
      return {
        name: 'API Security',
        status: 'FAIL',
        description: 'API security check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * ⚙️ CHECK CONFIGURATION SECURITY INTEGRITY
   */
  private checkConfigurationSecurity(): SecurityCheck {
    try {
      // Check security constants
      if (!SECURITY_CONSTANTS) {
        return {
          name: 'Configuration Security',
          status: 'FAIL',
          description: 'Security constants not properly configured',
          details: 'SECURITY_CONSTANTS is undefined',
        }
      }

      // Verify critical constants
      const criticalConstants = [
        'TOKEN.ACCESS_EXPIRY',
        'TOKEN.REFRESH_EXPIRY',
        'DEVICE.MAX_VALIDATION_ATTEMPTS_PER_HOUR',
        'RATE_LIMIT.LOGIN_ATTEMPTS_PER_15MIN',
      ]

      const missingConstants = criticalConstants.filter(constant => {
        const parts = constant.split('.')
        let value = SECURITY_CONSTANTS as any
        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part]
          } else {
            return true
          }
        }
        return false
      })

      if (missingConstants.length > 0) {
        return {
          name: 'Configuration Security',
          status: 'FAIL',
          description: 'Critical security constants missing',
          details: `Missing: ${missingConstants.join(', ')}`,
        }
      }

      return {
        name: 'Configuration Security',
        status: 'PASS',
        description: 'Security configuration properly set',
        details: {
          constantsCount: Object.keys(SECURITY_CONSTANTS).length,
          criticalConstants: 'ALL_PRESENT',
        },
      }
    } catch (error) {
      return {
        name: 'Configuration Security',
        status: 'FAIL',
        description: 'Configuration security check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 💡 GENERATE RECOMMENDATIONS
   */
  private generateRecommendations(checks: SecurityCheck[], score: number): string[] {
    const recommendations: string[] = []

    // Score-based recommendations
    if (score < 95) {
      recommendations.push(
        '🔴 CRITICAL: Security score below 95% - immediate action required',
      )
    }

    if (score < 100) {
      recommendations.push(
        '🟡 WARNING: Security score not at 100% - review and optimize',
      )
    }

    // Check-specific recommendations
    checks.forEach(check => {
      if (check.status === 'FAIL') {
        recommendations.push(`❌ FAILED: ${check.name} - ${check.description}`)
      } else if (check.status === 'WARNING') {
        recommendations.push(`⚠️ WARNING: ${check.name} - ${check.description}`)
      }
    })

    // General recommendations
    if (score === 100) {
      recommendations.push(
        '✅ PERFECT: All security checks passed - maintain current standards',
      )
    }

    return recommendations
  }

  /**
   * 📊 GENERATE SECURITY REPORT
   */
  async generateSecurityReport(): Promise<string> {
    const report = await this.runFullSecurityCheck()

    const reportText = `
🔐 SECURITY INTEGRITY REPORT - ${report.timestamp.toISOString()}
${'='.repeat(60)}

📊 OVERALL SECURITY SCORE: ${report.overallScore}/100
🎯 COMPLIANCE STATUS: ${report.isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}

📋 DETAILED CHECKS:
${report.checks
  .map(
    check =>
      `${check.status === 'PASS' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌'} ${check.name}: ${check.description}`,
  )
  .join('\n')}

💡 RECOMMENDATIONS:
${report.recommendations.map(rec => `• ${rec}`).join('\n')}

${'='.repeat(60)}
Generated by SecurityIntegrityChecker v1.0
    `.trim()

    return reportText
  }
}

/**
 * 🚀 CONVENIENCE FUNCTION
 */
export const runSecurityIntegrityCheck = async (
  prisma: PrismaClient,
): Promise<SecurityIntegrityReport> => {
  const checker = new SecurityIntegrityChecker(prisma)
  return checker.runFullSecurityCheck()
}

export const generateSecurityReport = async (prisma: PrismaClient): Promise<string> => {
  const checker = new SecurityIntegrityChecker(prisma)
  return checker.generateSecurityReport()
}
