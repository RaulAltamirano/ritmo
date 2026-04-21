import { PrismaClient } from '@prisma/client'
import { UserFactory } from '../factories/UserFactory'

export async function seedUsers(prisma: PrismaClient) {
  console.log('👤 Seeding users...')

  const userFactory = new UserFactory(prisma)
  const user = await userFactory.createDemoUser()

  console.log(`✅ Created user: ${user.email}`)
  return user
}


