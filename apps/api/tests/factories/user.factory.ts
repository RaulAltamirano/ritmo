import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import type { User } from '@prisma/client'

import { workerPrisma } from '../setup/worker-context.ts'

export function buildUser(
  overrides?: Partial<{
    email: string
    username: string
    passwordHash: string
    firstName: string | null
    lastName: string | null
    timezone: string
  }>,
): {
  email: string
  username: string
  passwordHash: string
  firstName: string | null
  lastName: string | null
  timezone: string
} {
  // Username schema: max 30 chars, alphanumeric + _ -
  const suffix = faker.string.alphanumeric(12)
  return {
    email: overrides?.email ?? `u_${suffix}@example.com`,
    username: overrides?.username ?? `u_${suffix}`,
    passwordHash: bcrypt.hashSync('SecurePass123!', 4),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    timezone: 'UTC',
    ...overrides,
  }
}

async function createUser(incoming?: Partial<User>): Promise<User> {
  const built = buildUser(incoming ?? undefined)
  return workerPrisma.user.create({
    data: {
      email: built.email,
      username: built.username,
      passwordHash: built.passwordHash,
      firstName: built.firstName ?? undefined,
      lastName: built.lastName ?? undefined,
      timezone: built.timezone,
    },
  })
}

export const userFactory = {
  build: buildUser,
  create: createUser,
}
