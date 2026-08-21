import type { PrismaClient } from '@prisma/client'
import { EXERCISE_SEEDS } from '../../../src/modules/training/data/exercises.seed.js'
import { PROGRAM_TEMPLATE_SEEDS } from '../../../src/modules/training/data/programTemplates.seed.js'

export async function seedProgramTemplates(prisma: PrismaClient): Promise<void> {
  const exercises = await prisma.exercise.findMany({
    select: { id: true, slug: true },
  })
  const exerciseIds = new Map(exercises.map(exercise => [exercise.slug, exercise.id]))

  for (const template of PROGRAM_TEMPLATE_SEEDS) {
    const days = template.days.map(templateDay => ({
      dayNumber: templateDay.dayNumber,
      name: templateDay.name,
      focus: templateDay.focus,
      slots: {
        create: templateDay.slots.map(slot => {
          const exerciseId = exerciseIds.get(slot.exerciseSlug)
          if (!exerciseId) {
            throw new Error(`Missing seeded exercise: ${slot.exerciseSlug}`)
          }
          return {
            sortOrder: slot.sortOrder,
            block: slot.block,
            exerciseId,
            setsReps: slot.setsReps,
            targetRir: slot.targetRir,
            targetRpe: slot.targetRpe,
            emphasis: slot.emphasis,
          }
        }),
      },
    }))

    await prisma.programTemplate.upsert({
      where: { code: template.code },
      create: {
        code: template.code,
        level: template.level,
        daysPerWeek: template.daysPerWeek,
        sourceFile: template.sourceFile,
        days: { create: days },
      },
      update: {
        level: template.level,
        daysPerWeek: template.daysPerWeek,
        sourceFile: template.sourceFile,
        days: {
          deleteMany: {},
          create: days,
        },
      },
    })
  }
}

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

  await seedProgramTemplates(prisma)
}
