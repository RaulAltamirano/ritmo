import { PrismaClient } from '@prisma/client'
import { USER_PREFERENCES } from '../config/database'

export class UserPreferencesFactory {
  constructor(private readonly prisma: PrismaClient) {}

  async createDemoPreferences(userId: string) {
    return this.prisma.userPreferences.create({
      data: {
        userId,
        notificationSettings: USER_PREFERENCES.notificationSettings,
        privacySettings: USER_PREFERENCES.privacySettings,
        accessibilitySettings: USER_PREFERENCES.accessibilitySettings,
      },
    })
  }

  async createPreferences(
    userId: string,
    preferences?: {
      notificationSettings?: {
        email?: boolean
        push?: boolean
        reminders?: boolean
      }
      privacySettings?: {
        profileVisibility?: 'public' | 'private'
        activityVisibility?: 'public' | 'private'
      }
      accessibilitySettings?: {
        theme?: 'light' | 'dark' | 'system'
        fontSize?: 'small' | 'medium' | 'large'
        highContrast?: boolean
      }
    },
  ) {
    return this.prisma.userPreferences.create({
      data: {
        userId,
        notificationSettings:
          preferences?.notificationSettings ?? USER_PREFERENCES.notificationSettings,
        privacySettings:
          preferences?.privacySettings ?? USER_PREFERENCES.privacySettings,
        accessibilitySettings:
          preferences?.accessibilitySettings ?? USER_PREFERENCES.accessibilitySettings,
      },
    })
  }
}
