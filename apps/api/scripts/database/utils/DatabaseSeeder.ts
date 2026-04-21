import { PrismaClient } from '@prisma/client'
import { ActivityFactory } from '../factories/ActivityFactory'
import { CircadianPhaseFactory } from '../factories/CircadianPhaseFactory'
import { UserFactory } from '../factories/UserFactory'
import { UserPreferencesFactory } from '../factories/UserPreferencesFactory'

export class DatabaseSeeder {
  private userFactory: UserFactory
  private activityFactory: ActivityFactory
  private userPreferencesFactory: UserPreferencesFactory
  private circadianPhaseFactory: CircadianPhaseFactory

  constructor(private prisma: PrismaClient) {
    this.userFactory = new UserFactory(prisma)
    this.activityFactory = new ActivityFactory(prisma)
    this.userPreferencesFactory = new UserPreferencesFactory(prisma)
    this.circadianPhaseFactory = new CircadianPhaseFactory(prisma)
  }

  async cleanDatabase() {
    console.log('🧹 Cleaning existing data...')
    await this.prisma.activity.deleteMany()
    await this.prisma.userPreferences.deleteMany()
    await this.prisma.circadianPhasePreference.deleteMany()
    await this.prisma.circadianPhaseSession.deleteMany()
    await this.prisma.circadianPhase.deleteMany()
    await this.prisma.user.deleteMany()
  }

  async seedDemoData() {
    console.log('🌱 Starting database seed...')

    // Clean existing data
    await this.cleanDatabase()

    // Create circadian phases first (they don't depend on users)
    console.log('🌅 Creating circadian phases...')
    const phases = await this.circadianPhaseFactory.createCircadianPhases()

    // Create demo user
    console.log('👤 Creating demo user...')
    const user = await this.userFactory.createDemoUser()

    // Create user preferences
    console.log('⚙️ Creating user preferences...')
    await this.userPreferencesFactory.createDemoPreferences(user.id)

    // Create sample activities
    console.log('📝 Creating sample activities...')
    const activities = await this.activityFactory.createDemoActivities(user.id)

    console.log('✅ Database seeded successfully!')
    console.log(`🌅 Created ${phases.length} circadian phases`)
    console.log(`👤 Created user: ${user.email}`)
    console.log(`📝 Created ${activities.length} activities`)

    return { phases, user, activities }
  }
}
