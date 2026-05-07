import { PrismaClient } from '@prisma/client'
import { CircadianPhaseFactory } from '../../factories/CircadianPhaseFactory'

export async function seedCircadianPhases(prisma: PrismaClient) {
  console.log('🌅 Seeding circadian phases...')

  const circadianPhaseFactory = new CircadianPhaseFactory(prisma)
  const phases = await circadianPhaseFactory.createCircadianPhases()

  console.log(`✅ Created ${phases.length} circadian phases`)
  return phases
}
