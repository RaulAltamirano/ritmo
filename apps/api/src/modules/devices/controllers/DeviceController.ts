/**
 * 📱 DEVICE CONTROLLER - RITMO API 2025
 *
 * Controlador independiente para gestión de dispositivos
 * Siguiendo Clean Architecture y Domain Driven Design
 */

import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import { DeviceService } from '../services/DeviceService.js'

export class DeviceController {
  private readonly deviceService: DeviceService

  constructor() {
    this.deviceService = new DeviceService()
  }

  /**
   * GET /api/devices
   * Obtiene todos los dispositivos del usuario
   */
  async getDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as any
      if (!user) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId((req as any).requestId)
          .send(res)
        return
      }

      const devices = await this.deviceService.getUserDevices(user.id)
      ApiResponses.ok({ devices }, 'User devices retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/devices/stats
   * Obtiene estadísticas de dispositivos
   */
  async getDeviceStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as any
      if (!user) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId((req as any).requestId)
          .send(res)
        return
      }

      const stats = await this.deviceService.getDeviceStats(user.id)
      ApiResponses.ok({ stats }, 'Device statistics retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /api/devices/:deviceId
   * Desautoriza un dispositivo específico
   */
  async deauthorizeDevice(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { user } = req as any
      if (!user) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId((req as any).requestId)
          .send(res)
        return
      }

      const { deviceId } = req.params
      if (!deviceId) {
        ApiResponses.badRequest('Device ID is required')
          .withRequestId((req as any).requestId)
          .send(res)
        return
      }

      await this.deviceService.deauthorizeDevice(deviceId, user.id)
      ApiResponses.ok(null, 'Device deauthorized successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }
}
