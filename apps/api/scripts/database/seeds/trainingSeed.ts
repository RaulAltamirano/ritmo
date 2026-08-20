import type { PrismaClient } from '@prisma/client'
import { EXERCISE_SEEDS } from '../../../src/modules/training/data/exercises.seed.js'

export async function seedTrainingCatalog(prisma: PrismaClient): Promise<void> {
  for (const e of EXERCISE_SEEDS) {
    await prisma.exercise.upsert({
      where: { slug: e.slug },
      create: {
        slug: e.slug,
        name: e.name,
        family: e.family,
        equipment: e.equipment,
        isCore: e.isCore,
      },
      update: {
        name: e.name,
        family: e.family,
        equipment: e.equipment,
        isCore: e.isCore,
      },
    })
  }
}
