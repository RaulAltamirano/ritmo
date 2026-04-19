/**
 * 👤 USER SERVICE - RITMO API 2025
 *
 * Servicio independiente para gestión de usuarios
 * Siguiendo Clean Architecture y Domain Driven Design
 */

import prisma from '../../../core/database/prisma.js'
import { ProfileUpdateDTO, UserDTO, UserPreferencesDTO } from '../dto/UserDTOs.js'

export class UserService {
  /**
   * Obtiene un usuario por su ID
   */
  async getUserById(userId: string): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return this.toUserDTO(user)
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(userId: string, profileData: ProfileUpdateDTO): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: profileData,
    })

    return this.toUserDTO(updatedUser)
  }

  /**
   * Obtiene las preferencias del usuario
   */
  async getUserPreferences(userId: string): Promise<UserPreferencesDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        timezone: true,
        language: true,
        theme: true,
        preferences: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Default preferences if not set
    const defaultPreferences: UserPreferencesDTO = {
      timezone: user.timezone || 'UTC',
      language: user.language || 'es',
      theme: user.theme || 'system',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        profileVisibility: 'private',
        showEmail: false,
        showLastSeen: true,
      },
    }

    // Merge with stored JSON preferences
    if (user.preferences) {
      const storedPreferences = user.preferences as any

      if (storedPreferences.notificationSettings) {
        defaultPreferences.notifications = {
          ...defaultPreferences.notifications,
          ...storedPreferences.notificationSettings,
        }
      }

      if (storedPreferences.privacySettings) {
        defaultPreferences.privacy = {
          ...defaultPreferences.privacy,
          ...storedPreferences.privacySettings,
        }
      }

      if (storedPreferences.accessibilitySettings) {
        defaultPreferences.accessibility = storedPreferences.accessibilitySettings
      }
    }

    return defaultPreferences
  }

  /**
   * Actualiza las preferencias del usuario
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferencesDTO>,
  ): Promise<UserPreferencesDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Separar campos directos del User de campos JSON en UserPreferences
    const userUpdateData: any = {}
    const preferencesUpdateData: any = {}

    // Campos directos del modelo User
    if (preferences.theme !== undefined) {
      userUpdateData.theme = preferences.theme
    }
    if (preferences.timezone !== undefined) {
      userUpdateData.timezone = preferences.timezone
    }
    if (preferences.language !== undefined) {
      userUpdateData.language = preferences.language
    }

    // Campos JSON en UserPreferences
    if (preferences.notifications !== undefined) {
      preferencesUpdateData.notificationSettings = preferences.notifications
    }
    if (preferences.privacy !== undefined) {
      preferencesUpdateData.privacySettings = preferences.privacy
    }
    if (preferences.accessibility !== undefined) {
      preferencesUpdateData.accessibilitySettings = preferences.accessibility
    }

    // Actualizar campos directos del User
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      })
    }

    // Actualizar o crear UserPreferences
    if (Object.keys(preferencesUpdateData).length > 0) {
      if (user.preferences) {
        // Actualizar preferencias existentes
        await prisma.userPreferences.update({
          where: { userId },
          data: preferencesUpdateData,
        })
      } else {
        // Crear nuevas preferencias
        await prisma.userPreferences.create({
          data: {
            userId,
            ...preferencesUpdateData,
          },
        })
      }
    }

    // Obtener las preferencias actualizadas
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
      },
    })

    return this.getUserPreferences(userId)
  }

  /**
   * Convierte un usuario de la base de datos a DTO
   */
  private toUserDTO(user: any): UserDTO {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      timezone: user.timezone,
      language: user.language,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
