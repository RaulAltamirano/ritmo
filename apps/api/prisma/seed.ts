import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.activity.deleteMany()
  await prisma.userPreferences.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user
  console.log('👤 Creating demo user...')
  const hashedPassword = await bcrypt.hash('Demo123!', 12)
  
  const user = await prisma.user.create({
    data: {
      email: 'demo@ritmo.app',
      username: 'demo',
      passwordHash: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      displayName: 'Demo User',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Productivity enthusiast and lifelong learner',
      timezone: 'America/Mexico_City',
      language: 'es',
      isEmailVerified: true,
      isActive: true
    }
  })

  // Create user preferences
  console.log('⚙️ Creating user preferences...')
  await prisma.userPreferences.create({
    data: {
      userId: user.id,
      notificationSettings: {
        email: true,
        push: true,
        reminders: true
      },
      privacySettings: {
        profileVisibility: 'private',
        activityVisibility: 'private'
      },
      accessibilitySettings: {
        theme: 'dark',
        fontSize: 'medium',
        highContrast: false
      }
    }
  })

  // Create sample activities
  console.log('📝 Creating sample activities...')
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        userId: user.id,
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new feature',
        type: 'work',
        duration: 120,
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),   // 4 hours from now
        priority: 'high',
        tags: ['documentation', 'project']
      }
    }),
    prisma.activity.create({
      data: {
        userId: user.id,
        title: 'Study React patterns',
        description: 'Review advanced React patterns and best practices',
        type: 'learning',
        duration: 90,
        startTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
        endTime: new Date(Date.now() + 6.5 * 60 * 60 * 1000), // 6.5 hours from now
        priority: 'medium',
        tags: ['react', 'learning']
      }
    }),
    prisma.activity.create({
      data: {
        userId: user.id,
        title: 'Morning workout',
        description: 'Cardio and strength training session',
        type: 'health',
        duration: 45,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        priority: 'high',
        tags: ['fitness', 'health']
      }
    }),
    prisma.activity.create({
      data: {
        userId: user.id,
        title: 'Design new logo concepts',
        description: 'Create initial logo concepts for the brand refresh',
        type: 'creative',
        duration: 60,
        startTime: new Date(Date.now() + 26 * 60 * 60 * 1000), // Tomorrow + 2 hours
        endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
        priority: 'medium',
        tags: ['design', 'branding']
      }
    }),
    prisma.activity.create({
      data: {
        userId: user.id,
        title: 'Team meeting',
        description: 'Weekly team sync and project updates',
        type: 'work',
        duration: 60,
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        endTime: new Date(Date.now() + 49 * 60 * 60 * 1000),
        priority: 'high',
        tags: ['meeting', 'team', 'sync']
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created user: ${user.email}`)
  console.log(`📝 Created ${activities.length} activities`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 