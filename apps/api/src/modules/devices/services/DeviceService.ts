/**
 * 📱 DEVICE SERVICE - RITMO API 2025
 *
 * Dispositivos derivados de `UserSession` (no existe modelo `Device` en Prisma).
 */

import type { UserSession } from '@prisma/client'
import prisma from '../../../core/database/prisma.js'
import { DeviceDTO, DeviceStatsDTO } from '../dto/DeviceDTOs.js'

export class DeviceService {
  async getUserDevices(userId: string): Promise<DeviceDTO[]> {
    const sessions = await prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActivity: 'desc' },
    })

    const latestByDevice = new Map<string, UserSession>()
    for (const session of sessions) {
      const key = session.deviceId || session.sessionId
      if (!latestByDevice.has(key)) {
        latestByDevice.set(key, session)
      }
    }

    return [...latestByDevice.values()].map(s => this.toDeviceDTO(s))
  }

  async getDeviceStats(userId: string): Promise<DeviceStatsDTO> {
    const sessions = await prisma.userSession.findMany({
      where: { userId },
      select: { deviceId: true, sessionId: true, deviceType: true, isTrusted: true },
    })

    const deviceKeys = new Map<string, { trusted: boolean; deviceType: string }>()
    for (const s of sessions) {
      const key = s.deviceId || s.sessionId
      const prev = deviceKeys.get(key)
      deviceKeys.set(key, {
        trusted: (prev?.trusted ?? false) || s.isTrusted,
        deviceType: s.deviceType,
      })
    }

    const stats = await prisma.userSession.groupBy({
      by: ['deviceType'],
      where: { userId },
      _count: { id: true },
    })

    const totalDevices = deviceKeys.size
    const trustedDevices = [...deviceKeys.values()].filter(d => d.trusted).length

    return {
      totalDevices,
      trustedDevices,
      untrustedDevices: Math.max(0, totalDevices - trustedDevices),
      byType: stats.reduce(
        (acc, stat) => {
          acc[stat.deviceType] = stat._count.id
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  }

  async deauthorizeDevice(deviceId: string, userId: string): Promise<void> {
    const existing = await prisma.userSession.findFirst({
      where: {
        userId,
        OR: [{ deviceId }, { id: deviceId }, { sessionId: deviceId }],
      },
    })

    if (!existing) {
      throw new Error('Device not found')
    }

    await prisma.userSession.updateMany({
      where: {
        userId,
        OR: [{ deviceId }, { id: deviceId }, { sessionId: deviceId }],
      },
      data: { isActive: false },
    })
  }

  private toDeviceDTO(session: UserSession): DeviceDTO {
    return {
      id: session.deviceId || session.id,
      userId: session.userId,
      deviceName: session.deviceName || 'Unknown device',
      deviceType: String(session.deviceType),
      browser: session.browser || '',
      os: session.os || '',
      ipAddress: session.ipAddress || '',
      userAgent: session.userAgent || '',
      isTrusted: session.isTrusted,
      lastSeenAt: session.lastActivity,
      createdAt: session.createdAt,
    }
  }
}
