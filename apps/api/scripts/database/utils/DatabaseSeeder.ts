import { PrismaClient } from '@prisma/client'
import { ActivityFactory } from '../factories/ActivityFactory'
import { CircadianPhaseFactory } from '../factories/CircadianPhaseFactory'
import { UserFactory } from '../factories/UserFactory'
import { UserPreferencesFactory } from '../factories/UserPreferencesFactory'

export class DatabaseSeeder {
  private readonly userFactory: UserFactory
  private readonly activityFactory: ActivityFactory
  private readonly userPreferencesFactory: UserPreferencesFactory
  private readonly circadianPhaseFactory: CircadianPhaseFactory

  constructor(private readonly prisma: PrismaClient) {
    this.userFactory = new UserFactory(prisma)
    this.activityFactory = new ActivityFactory(prisma)
    this.userPreferencesFactory = new UserPreferencesFactory(prisma)
    this.circadianPhaseFactory = new CircadianPhaseFactory(prisma)
  }

  async cleanDatabase() {
    console.log('🧹 Cleaning existing data...')
    await this.prisma.workSessionIdempotency.deleteMany()
    await this.prisma.workSession.deleteMany()
    await this.prisma.dailyCheckin.deleteMany()
    await this.prisma.task.deleteMany()
    await this.prisma.category.deleteMany()
    await this.prisma.refreshToken.deleteMany()
    await this.prisma.userSession.deleteMany()
    await this.prisma.securityLog.deleteMany()
    await this.prisma.passwordHistory.deleteMany()
    await this.prisma.emailVerificationToken.deleteMany()
    await this.prisma.phoneVerificationToken.deleteMany()
    await this.prisma.passwordResetToken.deleteMany()
    await this.prisma.emailNotificationSettings.deleteMany()
    await this.prisma.userPreferences.deleteMany()
    await this.prisma.circadianPhasePreference.deleteMany()
    await this.prisma.circadianPhaseSession.deleteMany()
    await this.prisma.user.deleteMany()
    await this.prisma.circadianPhase.deleteMany()
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

    // Create sample tasks
    console.log('📝 Creating sample tasks...')
    const tasks = await this.activityFactory.createDemoActivities(user.id)

    console.log('✅ Database seeded successfully!')
    console.log(`🌅 Created ${phases.length} circadian phases`)
    console.log(`👤 Created user: ${user.email}`)
    console.log(`📝 Created ${tasks.length} tasks`)

    return { phases, user, activities: tasks }
  }
}
