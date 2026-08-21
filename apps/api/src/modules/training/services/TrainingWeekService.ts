import type {
  EquipmentProfile,
  Exercise,
  Prisma,
  TrainingProfile,
} from '@prisma/client'

import prisma from '../../../core/database/prisma.js'
import { parseCalendarDateString } from '../../../core/utils/calendarDate.js'
import {
  InvalidInputException,
  ResourceNotFoundException,
} from '../../../shared/exceptions/app.exceptions.js'
import {
  type FrontendTrainingWeek,
  toFrontendTrainingWeek,
} from '../dto/trainingWeek.dto.js'
import { CatalogValidator } from './CatalogValidator.js'
import {
  OpenAiTrainingClient,
  type SubstitutionResult,
} from './OpenAiTrainingClient.js'
import {
  type FrontendTrainingProfile,
  TrainingProfileService,
} from './TrainingProfileService.js'
import {
  applyDraftSubstitutions,
  buildDraftDays,
  draftExerciseIds,
  type DraftDay,
  validDraftSubstitutions,
} from './TrainingWeekDraft.js'
import { advanceBlock, selectProgramCode } from './WfitnessMotor.js'

const weekInclude = {
  programTemplate: true,
  days: {
    orderBy: { dayNumber: 'asc' as const },
    include: {
      exercises: {
        orderBy: { sortOrder: 'asc' as const },
        include: { exercise: true },
      },
    },
  },
} as const

export class TrainingWeekService {
  constructor(
    private readonly client = new OpenAiTrainingClient(),
    private readonly validator = new CatalogValidator(),
    private readonly profiles = new TrainingProfileService(),
  ) {}

  async generateWeek(userId: string, weekStart: string): Promise<FrontendTrainingWeek> {
    const start = this.parseMonday(weekStart)
    const profile = await this.profiles.getProfile(userId)
    this.assertCanGenerate(profile)

    const template = await this.loadTemplate(profile)
    const catalog = await prisma.exercise.findMany()
    const draftDays = buildDraftDays(profile, template.days, start)
    const proposal = await this.propose(profile, draftDays, catalog)
    const substitutions = validDraftSubstitutions(
      proposal.substitutions,
      draftDays,
      catalog,
      profile.equipment,
      this.validator,
    )
    const days = applyDraftSubstitutions(draftDays, substitutions)

    const week = await prisma.$transaction(async tx => {
      const saved = await tx.trainingWeek.upsert({
        where: { userId_weekStart: { userId, weekStart: start } },
        create: {
          userId,
          weekStart: start,
          status: 'draft',
          profileSnapshot: this.profileSnapshot(profile),
          programTemplateId: template.id,
          blockPhase: profile.blockPhase,
          weekInBlock: profile.weekInBlock,
          substitutions: substitutions as unknown as Prisma.InputJsonValue,
          warning: proposal.warning ?? null,
          days: { create: days },
        },
        update: {
          status: 'draft',
          profileSnapshot: this.profileSnapshot(profile),
          programTemplateId: template.id,
          blockPhase: profile.blockPhase,
          weekInBlock: profile.weekInBlock,
          summary: null,
          substitutions: substitutions as unknown as Prisma.InputJsonValue,
          warning: proposal.warning ?? null,
          days: { deleteMany: {}, create: days },
        },
      })
      return tx.trainingWeek.findUniqueOrThrow({
        where: { id: saved.id },
        include: weekInclude,
      })
    })

    return toFrontendTrainingWeek(week)
  }

  async applyWeek(
    userId: string,
    weekId: string,
  ): Promise<{ week: FrontendTrainingWeek; profile: FrontendTrainingProfile }> {
    const result = await prisma.$transaction(async tx => {
      const week = await tx.trainingWeek.findFirst({
        where: { id: weekId, userId },
      })
      if (!week) throw new ResourceNotFoundException('Training week', weekId)

      const profile = await tx.trainingProfile.findUnique({ where: { userId } })
      if (!profile) throw new InvalidInputException('Training profile is required')

      const nextBlock = advanceBlock(profile)
      const updatedProfile = await tx.trainingProfile.update({
        where: { userId },
        data: {
          ...nextBlock,
          ...(!profile.programTemplateId && {
            programTemplateId: week.programTemplateId,
          }),
        },
      })
      const updatedWeek = await tx.trainingWeek.update({
        where: { id: week.id },
        data: { status: 'applied' },
        include: weekInclude,
      })
      return { week: updatedWeek, profile: updatedProfile }
    })

    return {
      week: toFrontendTrainingWeek(result.week),
      profile: result.profile,
    }
  }

  async getWeek(
    userId: string,
    weekStart: string,
  ): Promise<FrontendTrainingWeek | null> {
    const week = await prisma.trainingWeek.findUnique({
      where: {
        userId_weekStart: {
          userId,
          weekStart: this.parseMonday(weekStart),
        },
      },
      include: weekInclude,
    })
    return week ? toFrontendTrainingWeek(week) : null
  }

  async getExercises(): Promise<Exercise[]> {
    return prisma.exercise.findMany({ orderBy: { name: 'asc' } })
  }

  private assertCanGenerate(
    profile: FrontendTrainingProfile | null,
  ): asserts profile is TrainingProfile & {
    level: NonNullable<TrainingProfile['level']>
    daysPerWeek: number
    equipment: EquipmentProfile
  } {
    if (profile && this.profiles.isStop(profile)) {
      throw new InvalidInputException(
        'Active injury requires review by a health professional or WFITNESS coach',
      )
    }
    if (!profile || !this.profiles.isComplete(profile)) {
      throw new InvalidInputException('Complete the training profile before generating')
    }
  }

  private async loadTemplate(
    profile: TrainingProfile & {
      level: NonNullable<TrainingProfile['level']>
      daysPerWeek: number
    },
  ) {
    const where = profile.programTemplateId
      ? { id: profile.programTemplateId }
      : { code: selectProgramCode(profile.level, profile.daysPerWeek) }
    const template = await prisma.programTemplate.findUnique({
      where,
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
    if (!template)
      throw new InvalidInputException('Training program template not found')
    return template
  }

  private async propose(
    profile: TrainingProfile & { equipment: EquipmentProfile },
    days: DraftDay[],
    catalog: Exercise[],
  ): Promise<SubstitutionResult> {
    try {
      return await this.client.proposeSubstitutions({
        exerciseIds: draftExerciseIds(days),
        catalog,
        equipment: profile.equipment,
        ...(profile.restrictions && { restrictions: profile.restrictions }),
      })
    } catch {
      return { substitutions: [], warning: 'openai_unavailable' }
    }
  }

  private profileSnapshot(profile: TrainingProfile): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(profile)) as Prisma.InputJsonValue
  }

  private parseMonday(value: string): Date {
    try {
      const date = parseCalendarDateString(value)
      if (date.getUTCDay() !== 1) throw new Error('not Monday')
      return date
    } catch {
      throw new InvalidInputException('weekStart must be a Monday in YYYY-MM-DD format')
    }
  }
}
