import prisma from '../../../core/database/prisma.js'
import { ResourceNotFoundException } from '../../../shared/exceptions/app.exceptions.js'

export async function resolvePlanId(
  userId: string,
  planId?: string | null,
): Promise<string | null> {
  if (planId === undefined || planId === null || planId === '') return null
  await assertPlanOwned(userId, planId)
  return planId
}

export async function assertPlanOwned(userId: string, planId: string): Promise<void> {
  const plan = await prisma.plan.findFirst({
    where: { id: planId, userId, isDeleted: false },
    select: { id: true },
  })
  if (!plan) throw new ResourceNotFoundException('Plan', planId)
}
