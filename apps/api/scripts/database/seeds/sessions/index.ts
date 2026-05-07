import { PrismaClient } from '@prisma/client'
import { UserPreferencesFactory } from '../factories/UserPreferencesFactory'

export async function seedUserPreferences(prisma: PrismaClient, userId: string) {
  console.log('⚙️ Seeding user preferences...')

  const userPreferencesFactory = new UserPreferencesFactory(prisma)
  const preferences = await userPreferencesFactory.createDemoPreferences(userId)

  console.log('✅ Created user preferences')
  return preferences
}
