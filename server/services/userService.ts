import { prisma } from '../lib/prisma'
import type { User, Profile, UserPreference } from '@prisma/client'

export interface CreateUserData {
  email: string
  name?: string
  avatar?: string
}

export interface UpdateUserData {
  name?: string
  avatar?: string
}

export interface CreateProfileData {
  bio?: string
  timezone?: string
  language?: string
}

export interface UpdateProfileData {
  bio?: string
  timezone?: string
  language?: string
}

/**
 * User Service - Handles all user-related database operations
 */
export class UserService {
  /**
   * Create a new user with profile
   */
  static async createUser(data: CreateUserData, profileData?: CreateProfileData): Promise<User & { profile?: Profile }> {
    try {
      return await prisma.user.create({
        data: {
          ...data,
          profile: profileData ? {
            create: profileData
          } : undefined
        },
        include: {
          profile: true
        }
      })
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  /**
   * Get user by ID with profile
   */
  static async getUserById(id: string): Promise<(User & { profile?: Profile }) | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true
        }
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email }
      })
    } catch (error) {
      console.error('Error fetching user by email:', error)
      throw new Error('Failed to fetch user')
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Failed to delete user')
    }
  }

  /**
   * Update or create user profile
   */
  static async upsertProfile(userId: string, data: UpdateProfileData): Promise<Profile> {
    try {
      return await prisma.profile.upsert({
        where: { userId },
        update: data,
        create: {
          userId,
          ...data
        }
      })
    } catch (error) {
      console.error('Error upserting profile:', error)
      throw new Error('Failed to update profile')
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(userId: string): Promise<UserPreference[]> {
    try {
      return await prisma.userPreference.findMany({
        where: { userId }
      })
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      throw new Error('Failed to fetch user preferences')
    }
  }

  /**
   * Set user preference
   */
  static async setUserPreference(userId: string, key: string, value: string): Promise<UserPreference> {
    try {
      return await prisma.userPreference.upsert({
        where: {
          userId_key: {
            userId,
            key
          }
        },
        update: { value },
        create: {
          userId,
          key,
          value
        }
      })
    } catch (error) {
      console.error('Error setting user preference:', error)
      throw new Error('Failed to set user preference')
    }
  }

  /**
   * Get user preference by key
   */
  static async getUserPreference(userId: string, key: string): Promise<UserPreference | null> {
    try {
      return await prisma.userPreference.findUnique({
        where: {
          userId_key: {
            userId,
            key
          }
        }
      })
    } catch (error) {
      console.error('Error fetching user preference:', error)
      throw new Error('Failed to fetch user preference')
    }
  }
} 