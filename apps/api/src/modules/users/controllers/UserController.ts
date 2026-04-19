import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import { UpdatePreferencesRequestDTO } from '../dto/UserDTOs.js'
import { UserService } from '../services/UserService.js'

export class UserController {
  private readonly userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  /**
   * GET /api/users/me
   * Obtiene información del usuario actual
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user
      const requestId = (req as any).requestId

      if (!user?.id) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId(requestId)
          .send(res)
        return
      }

      const userData = await this.userService.getUserById(user.id)

      ApiResponses.ok({ user: userData }, 'Current user retrieved successfully')
        .withRequestId(requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * PUT /api/users/profile
   * Actualiza el perfil del usuario
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user
      const requestId = (req as any).requestId

      if (!user?.id) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId(requestId)
          .send(res)
        return
      }

      const result = await this.userService.updateProfile(user.id, req.body)

      ApiResponses.ok({ user: result }, 'Profile updated successfully')
        .withRequestId(requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/users/preferences
   * Obtiene las preferencias del usuario (incluyendo tema)
   */
  async getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user
      const requestId = (req as any).requestId

      if (!user?.id) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId(requestId)
          .send(res)
        return
      }

      const preferences = await this.userService.getUserPreferences(user.id)

      ApiResponses.ok({ preferences }, 'User preferences retrieved successfully')
        .withRequestId(requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * PUT /api/users/preferences
   * Actualiza las preferencias del usuario (incluyendo tema)
   */
  async updatePreferences(
    req: Request<{}, {}, UpdatePreferencesRequestDTO>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = (req as any).user
      const requestId = (req as any).requestId

      if (!user?.id) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId(requestId)
          .send(res)
        return
      }

      const result = await this.userService.updateUserPreferences(
        user.id,
        req.body as any,
      )

      ApiResponses.ok({ preferences: result }, 'Preferences updated successfully')
        .withRequestId(requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * PUT /api/users/preferences/theme
   * Actualiza específicamente el tema del usuario
   */
  async updateTheme(
    req: Request<{}, {}, { theme: 'light' | 'dark' | 'system' }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = (req as any).user
      const requestId = (req as any).requestId

      if (!user?.id) {
        ApiResponses.unauthorized('User not authenticated')
          .withRequestId(requestId)
          .send(res)
        return
      }

      const { theme } = req.body
      const result = await this.userService.updateUserPreferences(user.id, { theme })

      ApiResponses.ok({ preferences: result }, 'Theme updated successfully')
        .withRequestId(requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }
}
