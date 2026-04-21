/**
 * 📱 DEVICE CONTROLLER - RITMO API 2025
 *
 * Controlador para gestión de dispositivos
 * Maneja dispositivos autorizados y confianza
 */

import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import { DeviceService } from '../services/DeviceService.js'

export class DeviceController {
  private deviceService: DeviceService

  constructor() {
    this.deviceService = new DeviceService()
  }

  /**
   * GET /api/auth/devices
   * Obtiene todos los dispositivos del usuario
   */
  async getDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user
      if (!user) {
        ApiResponses.unauthorized('User not authenticated').send(res, 401)
        return
      }

      const devices = await this.deviceService.getUserDevices(user.id)
      ApiResponses.ok({ devices }, 'User devices retrieved').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /api/auth/devices/{deviceId}
   * Desautoriza un dispositivo específico
   */
  async deauthorizeDevice(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = (req as any).user
      if (!user) {
        ApiResponses.unauthorized('User not authenticated').send(res, 401)
        return
      }

      const deviceId = req.params.deviceId
      if (!deviceId) {
        ApiResponses.badRequest('Device ID required').send(res, 400)
        return
      }

      await this.deviceService.deauthorizeDevice(deviceId, user.id)
      ApiResponses.ok(null, 'Device deauthorized').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/auth/devices/stats
   * Obtiene estadísticas de dispositivos
   */
  async getDeviceStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user
      if (!user) {
        ApiResponses.unauthorized('User not authenticated').send(res, 401)
        return
      }

      const stats = await this.deviceService.getDeviceStats(user.id)
      ApiResponses.ok({ stats }, 'Device statistics retrieved').send(res)
    } catch (error) {
      next(error)
    }
  }
}
