/**
 * 👤 USER SERVICE - RITMO API 2025
 *
 * Servicio para operaciones de usuario
 * Maneja perfil, preferencias y datos del usuario
 */

import prisma from '../../../core/database/prisma.js'
import { ProfileUpdateDTO, UserDTO, UserPreferencesDTO } from '../dto/AuthDTOs.js'

export class UserService {
  async getUserById(userId: string): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return this.toUserDTO(user)
  }

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

  async getUserPreferences(userId: string): Promise<UserPreferencesDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const theme: UserPreferencesDTO['theme'] =
      user.theme === 'system' ? 'auto' : (user.theme as 'light' | 'dark')

    const defaultPreferences: UserPreferencesDTO = {
      timezone: user.timezone || 'UTC',
      language: user.language || 'es',
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
      theme,
    }

    if (!user.preferences) {
      return defaultPreferences
    }

    const stored = user.preferences
    if (stored.notificationSettings) {
      defaultPreferences.notifications = {
        ...defaultPreferences.notifications,
        ...(stored.notificationSettings as object),
      } as UserPreferencesDTO['notifications']
    }
    if (stored.privacySettings) {
      defaultPreferences.privacy = {
        ...defaultPreferences.privacy,
        ...(stored.privacySettings as object),
      } as UserPreferencesDTO['privacy']
    }

    return defaultPreferences
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferencesDTO>,
  ): Promise<UserPreferencesDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const userUpdate: Record<string, unknown> = {}
    if (preferences.timezone !== undefined) userUpdate.timezone = preferences.timezone
    if (preferences.language !== undefined) userUpdate.language = preferences.language
    if (preferences.theme !== undefined) {
      userUpdate.theme = preferences.theme === 'auto' ? 'system' : preferences.theme
    }

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdate as any,
      })
    }

    const prefsUpdate: Record<string, unknown> = {}
    if (preferences.notifications !== undefined) {
      prefsUpdate.notificationSettings = preferences.notifications
    }
    if (preferences.privacy !== undefined) {
      prefsUpdate.privacySettings = preferences.privacy
    }

    if (Object.keys(prefsUpdate).length > 0) {
      if (user.preferences) {
        await prisma.userPreferences.update({
          where: { userId },
          data: prefsUpdate as any,
        })
      } else {
        await prisma.userPreferences.create({
          data: {
            userId,
            ...prefsUpdate,
          } as any,
        })
      }
    }

    return this.getUserPreferences(userId)
  }

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
