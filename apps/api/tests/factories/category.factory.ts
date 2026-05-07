import { faker } from '@faker-js/faker'

import type { Category } from '@prisma/client'

import { workerPrisma } from '../setup/worker-context.ts'

export type CategoryCreateInput = {
  userId: string
} & Partial<Pick<Category, 'name'>>

export function buildCategory(overrides: CategoryCreateInput): {
  userId: string
  name: string
} {
  return {
    userId: overrides.userId,
    name: overrides.name ?? faker.commerce.department(),
  }
}

async function createCategory(overrides: CategoryCreateInput): Promise<Category> {
  const data = buildCategory(overrides)
  return workerPrisma.category.create({
    data: {
      userId: data.userId,
      name: data.name,
    },
  })
}

export const categoryFactory = {
  build: buildCategory,
  create: createCategory,
}
