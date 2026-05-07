import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEMO_USER_DATA } from '../config/database'

export class UserFactory {
  constructor(private readonly prisma: PrismaClient) {}

  async createDemoUser() {
    const hashedPassword = await bcrypt.hash(DEMO_USER_DATA.password, 12)

    return this.prisma.user.create({
      data: {
        email: DEMO_USER_DATA.email,
        username: DEMO_USER_DATA.username,
        passwordHash: hashedPassword,
        firstName: DEMO_USER_DATA.firstName,
        lastName: DEMO_USER_DATA.lastName,
        displayName: DEMO_USER_DATA.displayName,
        avatar: DEMO_USER_DATA.avatar,
        bio: DEMO_USER_DATA.bio,
        timezone: DEMO_USER_DATA.timezone,
        language: DEMO_USER_DATA.language,
        isEmailVerified: true,
        isActive: true,
      },
    })
  }

  async createUser(userData: Partial<typeof DEMO_USER_DATA>) {
    const hashedPassword = await bcrypt.hash(
      userData.password ?? DEMO_USER_DATA.password,
      12,
    )

    return this.prisma.user.create({
      data: {
        email: userData.email ?? DEMO_USER_DATA.email,
        username: userData.username ?? DEMO_USER_DATA.username,
        passwordHash: hashedPassword,
        firstName: userData.firstName ?? DEMO_USER_DATA.firstName,
        lastName: userData.lastName ?? DEMO_USER_DATA.lastName,
        displayName: userData.displayName ?? DEMO_USER_DATA.displayName,
        avatar: userData.avatar ?? DEMO_USER_DATA.avatar,
        bio: userData.bio ?? DEMO_USER_DATA.bio,
        timezone: userData.timezone ?? DEMO_USER_DATA.timezone,
        language: userData.language ?? DEMO_USER_DATA.language,
        isEmailVerified: true,
        isActive: true,
      },
    })
  }
}
