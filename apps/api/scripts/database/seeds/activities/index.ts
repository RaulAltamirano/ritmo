import { PrismaClient } from '@prisma/client'
import { ActivityFactory } from '../factories/ActivityFactory'

export async function seedActivities(prisma: PrismaClient, userId: string) {
  console.log('📝 Seeding activities...')

  const activityFactory = new ActivityFactory(prisma)
  const activities = await activityFactory.createDemoActivities(userId)

  console.log(`✅ Created ${activities.length} activities`)
  return activities
}
