/**
 * 📱 DEVICE SERVICE - RITMO API 2025
 *
 * Servicio independiente para gestión de dispositivos
 * Siguiendo Clean Architecture y Domain Driven Design
 */

import prisma from '../../../core/database/prisma.js'
import { DeviceDTO, DeviceStatsDTO } from '../dto/DeviceDTOs.js'

export class DeviceService {
  /**
   * Obtiene todos los dispositivos del usuario
   */
  async getUserDevices(userId: string): Promise<DeviceDTO[]> {
    const devices = await prisma.device.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
    })

    return devices.map(device => this.toDeviceDTO(device))
  }

  /**
   * Obtiene estadísticas de dispositivos del usuario
   */
  async getDeviceStats(userId: string): Promise<DeviceStatsDTO> {
    const stats = await prisma.device.groupBy({
      by: ['deviceType'],
      where: { userId },
      _count: {
        id: true,
      },
    })

    const totalDevices = await prisma.device.count({
      where: { userId },
    })

    const trustedDevices = await prisma.device.count({
      where: {
        userId,
        isTrusted: true,
      },
    })

    return {
      totalDevices,
      trustedDevices,
      untrustedDevices: totalDevices - trustedDevices,
      byType: stats.reduce(
        (acc, stat) => {
          acc[stat.deviceType] = stat._count.id
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  }

  /**
   * Desautoriza un dispositivo específico
   */
  async deauthorizeDevice(deviceId: string, userId: string): Promise<void> {
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        userId,
      },
    })

    if (!device) {
      throw new Error('Device not found')
    }

    // Deactivate all sessions for this device
    await prisma.session.updateMany({
      where: {
        deviceId,
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
      },
    })

    // Remove device
    await prisma.device.delete({
      where: { id: deviceId },
    })
  }

  /**
   * Convierte un dispositivo de la base de datos a DTO
   */
  private toDeviceDTO(device: any): DeviceDTO {
    return {
      id: device.id,
      userId: device.userId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      browser: device.browser,
      os: device.os,
      ipAddress: device.ipAddress,
      userAgent: device.userAgent,
      isTrusted: device.isTrusted,
      lastSeenAt: device.lastSeenAt,
      createdAt: device.createdAt,
    }
  }
}
