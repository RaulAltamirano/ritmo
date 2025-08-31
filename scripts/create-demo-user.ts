import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@ritmo.app' }
    })

    if (existingUser) {
      console.log('Demo user already exists')
      return existingUser
    }

    // Get demo password from environment or use default
    const demoPassword = process.env.DEMO_USER_PASSWORD || 'Demo123!'
    
    // Hash password
    const hashedPassword = await bcrypt.hash(demoPassword, 12)

    // Create demo user with transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: 'demo@ritmo.app',
          name: 'Demo User',
          password: hashedPassword,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          emailVerified: true
        }
      })

      // Create default profile
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          timezone: 'UTC',
          language: 'es'
        }
      })

      // Create default preferences
      await tx.userPreference.createMany({
        data: [
          { userId: user.id, key: 'theme', value: 'system' },
          { userId: user.id, key: 'notifications_email', value: 'true' },
          { userId: user.id, key: 'notifications_push', value: 'true' },
          { userId: user.id, key: 'notifications_reminders', value: 'true' },
          { userId: user.id, key: 'privacy_profile_visibility', value: 'private' },
          { userId: user.id, key: 'privacy_activity_visibility', value: 'private' }
        ]
      })

      return { user, profile }
    })

    console.log('Demo user created successfully:', result.user.email)
    return result.user
  } catch (error) {
    console.error('Error creating demo user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createDemoUser()
  .then(() => {
    console.log('Demo user setup completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Demo user setup failed:', error)
    process.exit(1)
  }) 