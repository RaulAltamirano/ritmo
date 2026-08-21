import {
  BlockPhase,
  EquipmentProfile,
  TrainingGoal,
  TrainingLevel,
} from '@prisma/client'
import { describe, expect, it } from 'vitest'

import { TrainingProfileService } from '../../../src/modules/training/services/TrainingProfileService.js'
import type { TrainingProfilePatch } from '../../../src/modules/training/services/TrainingProfileService.js'
import { workerPrisma } from '../../setup/worker-context.ts'

let sequence = 0

async function createUser() {
  sequence += 1
  const suffix = `training-profile-${Date.now()}-${sequence}`
  return workerPrisma.user.create({
    data: {
      email: `${suffix}@example.com`,
      username: suffix,
      passwordHash: 'hash',
      timezone: 'UTC',
    },
  })
}

describe('TrainingProfileService', () => {
  it('persists partial profile patches until the profile is complete', async () => {
    const service = new TrainingProfileService()
    const user = await createUser()

    const partial = await service.upsertProfile(user.id, {
      level: TrainingLevel.intermediate,
    })

    expect(partial.level).toBe(TrainingLevel.intermediate)
    expect(service.isComplete(partial)).toBe(false)

    const complete = await service.upsertProfile(user.id, {
      daysPerWeek: 4,
      minutesPerSession: 60,
      equipment: EquipmentProfile.full_gym,
      goal: TrainingGoal.hypertrophy,
      hasActiveInjury: false,
    })

    expect(service.isComplete(complete)).toBe(true)
    await expect(service.getProfile(user.id)).resolves.toEqual(complete)
  })

  it('ignores block and periodization fields on upsert', async () => {
    const service = new TrainingProfileService()
    const user = await createUser()

    const profile = await service.upsertProfile(user.id, {
      level: TrainingLevel.basic,
      blockPhase: BlockPhase.deload,
      weekInBlock: 99,
      programTemplateId: 'fake-template-id',
      blockLengthWeeks: 99,
      historyWindowWeeks: 99,
    } as TrainingProfilePatch & {
      blockPhase: BlockPhase
      weekInBlock: number
      programTemplateId: string
      blockLengthWeeks: number
      historyWindowWeeks: number
    })

    expect(profile.level).toBe(TrainingLevel.basic)
    expect(profile.blockPhase).toBe(BlockPhase.accumulation)
    expect(profile.weekInBlock).toBe(1)
    expect(profile.programTemplateId).toBeNull()
    expect(profile.blockLengthWeeks).toBe(4)
    expect(profile.historyWindowWeeks).toBe(1)
  })

  it('stops plan generation only for an explicit active injury', async () => {
    const service = new TrainingProfileService()
    const user = await createUser()

    const notesOnly = await service.upsertProfile(user.id, {
      injuriesNotes: 'Dolor previo de hombro',
    })
    expect(service.isStop(notesOnly)).toBe(false)

    const activeInjury = await service.upsertProfile(user.id, {
      hasActiveInjury: true,
    })
    expect(service.isStop(activeInjury)).toBe(true)
    expect(service.isComplete(activeInjury)).toBe(false)
  })

  it.each([
    [{ daysPerWeek: 2 }, 'daysPerWeek'],
    [{ daysPerWeek: 7 }, 'daysPerWeek'],
    [{ daysPerWeek: 3.5 }, 'daysPerWeek'],
    [{ minutesPerSession: 0 }, 'minutesPerSession'],
    [{ minutesPerSession: -10 }, 'minutesPerSession'],
    [{ level: 'expert' }, 'level'],
    [{ equipment: 'hotel' }, 'equipment'],
    [{ goal: 'endurance' }, 'goal'],
  ])('rejects invalid profile patch %#', async (patch, field) => {
    const service = new TrainingProfileService()
    const user = await createUser()

    await expect(
      service.upsertProfile(user.id, patch as TrainingProfilePatch),
    ).rejects.toMatchObject({
      name: 'InvalidInputException',
      message: expect.stringContaining(field),
    })
  })
})
