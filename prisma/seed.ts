import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.activityMetric.deleteMany()
  await prisma.scheduleBlock.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.userPreference.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user
  console.log('👤 Creating demo user...')
  const user = await prisma.user.create({
    data: {
      email: 'demo@ritmo.app',
      name: 'Demo User',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      profiles: {
        create: {
          bio: 'Productivity enthusiast and lifelong learner',
          timezone: 'America/Mexico_City',
          language: 'es'
        }
      },
      preferences: {
        create: [
          { key: 'theme', value: 'dark' },
          { key: 'notifications', value: 'enabled' },
          { key: 'pomodoro_duration', value: '25' },
          { key: 'break_duration', value: '5' },
          { key: 'long_break_duration', value: '15' }
        ]
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
        type: 'WORK',
        duration: 120,
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),   // 4 hours from now
        priority: 'HIGH',
        tags: ['documentation', 'project']
      }
    }),
    prisma.activity.create({
      data: {
        userId: user.id,
        title: 'Study React patterns',
        description: 'Review advanced React patterns and best practices',
        type: 'STUDY',
        duration: 90,
        startTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
        endTime: new Date(Date.now() + 6.5 * 60 * 60 * 1000), // 6.5 hours from now
        priority: 'MEDIUM',
        tags: ['react', 'learning']
      }
    }),
    prisma.activity.create({
      data: {
        userId: user.id,
        title: 'Morning workout',
        description: 'Cardio and strength training session',
        type: 'EXERCISE',
        duration: 45,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        priority: 'HIGH',
        tags: ['fitness', 'health']
      }
    }),
    prisma.activity.create({
      data: {
        userId: user.id,
        title: 'Design new logo concepts',
        description: 'Create initial logo concepts for the brand refresh',
        type: 'CREATIVE',
        duration: 60,
        startTime: new Date(Date.now() + 26 * 60 * 60 * 1000), // Tomorrow + 2 hours
        endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
        priority: 'MEDIUM',
        tags: ['design', 'branding']
      }
    }),
    prisma.activity.create({
      data: {
        userId: user.id,
        title: 'Team meeting',
        description: 'Weekly team sync and project updates',
        type: 'SOCIAL',
        duration: 30,
        startTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
        endTime: new Date(Date.now() + 8.5 * 60 * 60 * 1000),
        priority: 'HIGH',
        tags: ['meeting', 'team']
      }
    })
  ])

  // Create default schedule
  console.log('📅 Creating default schedule...')
  const schedule = await prisma.schedule.create({
    data: {
      userId: user.id,
      name: 'Default Schedule',
      description: 'My daily productivity schedule',
      isActive: true,
      scheduleBlocks: {
        create: [
          // Monday - Friday work blocks
          { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', activityType: 'WORK', priority: 'HIGH' },
          { dayOfWeek: 1, startTime: '13:00', endTime: '17:00', activityType: 'WORK', priority: 'HIGH' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '12:00', activityType: 'WORK', priority: 'HIGH' },
          { dayOfWeek: 2, startTime: '13:00', endTime: '17:00', activityType: 'WORK', priority: 'HIGH' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', activityType: 'WORK', priority: 'HIGH' },
          { dayOfWeek: 3, startTime: '13:00', endTime: '17:00', activityType: 'WORK', priority: 'HIGH' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '12:00', activityType: 'WORK', priority: 'HIGH' },
          { dayOfWeek: 4, startTime: '13:00', endTime: '17:00', activityType: 'WORK', priority: 'HIGH' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '12:00', activityType: 'WORK', priority: 'HIGH' },
          { dayOfWeek: 5, startTime: '13:00', endTime: '17:00', activityType: 'WORK', priority: 'HIGH' },
          
          // Exercise blocks
          { dayOfWeek: 1, startTime: '07:00', endTime: '08:00', activityType: 'EXERCISE', priority: 'MEDIUM' },
          { dayOfWeek: 3, startTime: '07:00', endTime: '08:00', activityType: 'EXERCISE', priority: 'MEDIUM' },
          { dayOfWeek: 5, startTime: '07:00', endTime: '08:00', activityType: 'EXERCISE', priority: 'MEDIUM' },
          
          // Study blocks
          { dayOfWeek: 2, startTime: '19:00', endTime: '21:00', activityType: 'STUDY', priority: 'MEDIUM' },
          { dayOfWeek: 4, startTime: '19:00', endTime: '21:00', activityType: 'STUDY', priority: 'MEDIUM' },
          
          // Creative time
          { dayOfWeek: 6, startTime: '10:00', endTime: '12:00', activityType: 'CREATIVE', priority: 'LOW' },
          
          // Rest day
          { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', activityType: 'REST', priority: 'LOW' }
        ]
      }
    }
  })

  // Create sample activity metrics for the past week
  console.log('📊 Creating sample activity metrics...')
  const today = new Date()
  const metrics = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    metrics.push(
      prisma.activityMetric.create({
        data: {
          userId: user.id,
          date: date,
          totalTime: Math.floor(Math.random() * 480) + 120, // 2-10 hours
          completed: Math.floor(Math.random() * 8) + 2,     // 2-10 activities
          productivity: Math.random() * 0.4 + 0.6           // 0.6-1.0
        }
      })
    )
  }
  
  await Promise.all(metrics)

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created user: ${user.email}`)
  console.log(`📝 Created ${activities.length} activities`)
  console.log(`📅 Created schedule: ${schedule.name}`)
  console.log(`📊 Created ${metrics.length} activity metrics`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 