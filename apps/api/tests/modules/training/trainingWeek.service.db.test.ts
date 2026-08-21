import {
  BlockPhase,
  EquipmentProfile,
  TrainingGoal,
  TrainingLevel,
  TrainingWeekStatus,
} from '@prisma/client'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { seedTrainingCatalog } from '../../../scripts/database/seeds/trainingSeed.js'
import type { OpenAiTrainingClient } from '../../../src/modules/training/services/OpenAiTrainingClient.js'
import { TrainingProfileService } from '../../../src/modules/training/services/TrainingProfileService.js'
import { TrainingWeekService } from '../../../src/modules/training/services/TrainingWeekService.js'
import { InvalidInputException } from '../../../src/shared/exceptions/app.exceptions.js'
import { workerPrisma } from '../../setup/worker-context.ts'

let sequence = 0

async function createUser() {
  sequence += 1
  const suffix = `training-week-${Date.now()}-${sequence}`
  return workerPrisma.user.create({
    data: {
      email: `${suffix}@example.com`,
      username: suffix,
      passwordHash: 'hash',
      timezone: 'UTC',
    },
  })
}

async function createCompleteProfile(
  userId: string,
  overrides: Record<string, unknown> = {},
) {
  return workerPrisma.trainingProfile.create({
    data: {
      userId,
      level: TrainingLevel.intermediate,
      daysPerWeek: 4,
      minutesPerSession: 60,
      equipment: EquipmentProfile.full_gym,
      goal: TrainingGoal.hypertrophy,
      hasActiveInjury: false,
      ...overrides,
    },
  })
}

function createClient(
  result: {
    substitutions: Array<{
      fromExerciseId: string
      toExerciseId: string
      reason: string
    }>
    warning?: string
  } = { substitutions: [] },
): OpenAiTrainingClient {
  return {
    proposeSubstitutions: vi.fn().mockResolvedValue(result),
  } as unknown as OpenAiTrainingClient
}

describe('TrainingWeekService', () => {
  beforeAll(async () => {
    await seedTrainingCatalog(workerPrisma)
  })

  beforeEach(async () => {
    await seedTrainingCatalog(workerPrisma)
  })

  it('generates a web-shaped draft from the selected template', async () => {
    const user = await createUser()
    await createCompleteProfile(user.id)
    const service = new TrainingWeekService(createClient())

    const week = await service.generateWeek(user.id, '2026-08-17')

    expect(week).toMatchObject({
      weekStart: '2026-08-17',
      status: TrainingWeekStatus.draft,
      blockPhase: BlockPhase.accumulation,
      weekInBlock: 1,
      programTemplateCode: 'intermediate_2_0',
      substitutions: [],
    })
    expect(week.days).toHaveLength(4)
    expect(week.days.map(day => day.weekday)).toEqual([1, 2, 4, 5])
    expect(week.days.map(day => day.date)).toEqual([
      '2026-08-17',
      '2026-08-18',
      '2026-08-20',
      '2026-08-21',
    ])
    expect(week.days[0]?.exercises[0]).toEqual(
      expect.objectContaining({
        exerciseId: expect.any(String),
        name: expect.any(String),
        block: expect.stringMatching(/^[abc]$/),
        setsReps: expect.any(String),
        targetRir: expect.any(String),
        targetRpe: expect.any(String),
      }),
    )
  })

  it('replaces the existing draft for the same user and week start', async () => {
    const user = await createUser()
    await createCompleteProfile(user.id)
    const service = new TrainingWeekService(createClient())

    const first = await service.generateWeek(user.id, '2026-08-17')
    const second = await service.generateWeek(user.id, '2026-08-17')

    expect(second.id).toBe(first.id)
    await expect(
      workerPrisma.trainingWeek.count({
        where: { userId: user.id, weekStart: new Date('2026-08-17T00:00:00Z') },
      }),
    ).resolves.toBe(1)
  })

  it('applies an owned week and advances the profile into deload', async () => {
    const user = await createUser()
    await createCompleteProfile(user.id, { weekInBlock: 4 })
    const service = new TrainingWeekService(createClient())
    const draft = await service.generateWeek(user.id, '2026-08-17')

    const result = await service.applyWeek(user.id, draft.id)

    expect(result.week.status).toBe(TrainingWeekStatus.applied)
    expect(result.profile.blockPhase).toBe(BlockPhase.deload)
    expect(result.profile.weekInBlock).toBe(1)
    expect(result.profile.programTemplateId).not.toBeNull()
  })

  it('does not advance the profile when an applied week is applied again', async () => {
    const user = await createUser()
    await createCompleteProfile(user.id)
    const service = new TrainingWeekService(createClient())
    const draft = await service.generateWeek(user.id, '2026-08-17')

    const first = await service.applyWeek(user.id, draft.id)
    const second = await service.applyWeek(user.id, draft.id)

    expect(first.profile.weekInBlock).toBe(2)
    expect(second.week.status).toBe(TrainingWeekStatus.applied)
    expect(second.profile.weekInBlock).toBe(2)
  })

  it('generates successfully when OpenAI proposes no substitutions', async () => {
    const user = await createUser()
    await createCompleteProfile(user.id)
    const client = createClient({ substitutions: [], warning: 'openai_unavailable' })

    const week = await new TrainingWeekService(client).generateWeek(
      user.id,
      '2026-08-17',
    )

    expect(week.substitutions).toEqual([])
    expect(week.warning).toBe('openai_unavailable')
  })

  it.each([
    { result: {}, expectedWarning: null },
    {
      result: { substitutions: null, warning: 'model_warning' },
      expectedWarning: 'model_warning',
    },
    { result: { substitutions: 'invalid' }, expectedWarning: null },
  ])(
    'generates successfully for malformed OpenAI substitution shape %#',
    async ({ result, expectedWarning }) => {
      const user = await createUser()
      await createCompleteProfile(user.id)
      const client = {
        proposeSubstitutions: vi.fn().mockResolvedValue(result),
      } as unknown as OpenAiTrainingClient

      const week = await new TrainingWeekService(client).generateWeek(
        user.id,
        '2026-08-17',
      )

      expect(week.substitutions).toEqual([])
      expect(week.warning).toBe(expectedWarning)
    },
  )

  it('rejects OpenAI substitutions outside the source exercise family', async () => {
    const user = await createUser()
    await createCompleteProfile(user.id)
    const template = await workerPrisma.programTemplate.findUniqueOrThrow({
      where: { code: 'intermediate_2_0' },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            slots: {
              orderBy: { sortOrder: 'asc' },
              include: { exercise: true },
            },
          },
        },
      },
    })
    const source = template.days[0].slots[0].exercise
    const invalidTarget = await workerPrisma.exercise.findFirstOrThrow({
      where: { family: { not: source.family } },
    })
    const client = createClient({
      substitutions: [
        {
          fromExerciseId: source.id,
          toExerciseId: invalidTarget.id,
          reason: 'invalid family',
        },
      ],
    })

    const week = await new TrainingWeekService(client).generateWeek(
      user.id,
      '2026-08-17',
    )

    expect(week.substitutions).toEqual([])
    expect(week.days[0].exercises[0].exerciseId).toBe(source.id)
  })

  it('blocks generation for an active injury', async () => {
    const user = await createUser()
    await new TrainingProfileService().upsertProfile(user.id, {
      level: TrainingLevel.intermediate,
      daysPerWeek: 4,
      minutesPerSession: 60,
      equipment: EquipmentProfile.full_gym,
      goal: TrainingGoal.hypertrophy,
      hasActiveInjury: true,
    })

    await expect(
      new TrainingWeekService(createClient()).generateWeek(user.id, '2026-08-17'),
    ).rejects.toBeInstanceOf(InvalidInputException)
  })
})
