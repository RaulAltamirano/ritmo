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
      select: {
        timezone: true,
        language: true,
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
      theme: 'auto',
    }

    // Merge with stored preferences
    const storedPreferences = (user.preferences as Partial<UserPreferencesDTO>) || {}
    return { ...defaultPreferences, ...storedPreferences }
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferencesDTO>,
  ): Promise<UserPreferencesDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Update basic fields
    const updateData: any = {}
    if (preferences.timezone) updateData.timezone = preferences.timezone
    if (preferences.language) updateData.language = preferences.language

    // Store complex preferences in JSON field
    const currentPreferences = (user.preferences as Partial<UserPreferencesDTO>) || {}
    const mergedPreferences = { ...currentPreferences, ...preferences }

    updateData.preferences = mergedPreferences

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return mergedPreferences as UserPreferencesDTO
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
