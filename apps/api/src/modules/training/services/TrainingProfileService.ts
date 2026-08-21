import type {
  EquipmentProfile,
  Prisma,
  TrainingGoal,
  TrainingLevel,
  TrainingProfile,
} from '@prisma/client'

import prisma from '../../../core/database/prisma.js'
import {
  type ChatMessage,
  OpenAiTrainingClient,
  type ProfileFields,
} from './OpenAiTrainingClient.js'

export type FrontendTrainingProfile = TrainingProfile

export interface TrainingProfilePatch {
  level?: TrainingLevel | null
  daysPerWeek?: number | null
  minutesPerSession?: number | null
  equipment?: EquipmentProfile | null
  goal?: TrainingGoal | null
  hasActiveInjury?: boolean | null
  injuriesNotes?: string | null
  restrictions?: string | null
  understandsRir?: boolean
}

export interface ChatResult {
  assistantMessage: string
  profileDraft: FrontendTrainingProfile | null
  readyToGenerate: boolean
  stop: boolean
}

const REQUIRED_FIELDS = [
  'level',
  'daysPerWeek',
  'minutesPerSession',
  'equipment',
  'goal',
  'hasActiveInjury',
] as const

type PersistedProfileData = Partial<
  Pick<
    Prisma.TrainingProfileUncheckedCreateInput,
    | 'level'
    | 'daysPerWeek'
    | 'minutesPerSession'
    | 'equipment'
    | 'goal'
    | 'hasActiveInjury'
    | 'injuriesNotes'
    | 'restrictions'
    | 'understandsRir'
  >
>

export class TrainingProfileService {
  constructor(private readonly client?: OpenAiTrainingClient) {}

  async getProfile(userId: string): Promise<FrontendTrainingProfile | null> {
    return prisma.trainingProfile.findUnique({ where: { userId } })
  }

  async upsertProfile(
    userId: string,
    patch: TrainingProfilePatch,
  ): Promise<FrontendTrainingProfile> {
    const data: PersistedProfileData = patch
    return prisma.trainingProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    })
  }

  isComplete(profile: FrontendTrainingProfile): boolean {
    return (
      profile.level !== null &&
      profile.daysPerWeek !== null &&
      profile.minutesPerSession !== null &&
      profile.equipment !== null &&
      profile.goal !== null &&
      profile.hasActiveInjury === false
    )
  }

  isStop(profile: Pick<FrontendTrainingProfile, 'hasActiveInjury'>): boolean {
    return profile.hasActiveInjury === true
  }

  async chat(userId: string, messages: ChatMessage[]): Promise<ChatResult> {
    const current = await this.getProfile(userId)
    const intake = await (this.client ?? new OpenAiTrainingClient()).chatIntake({
      messages,
      missingSlots: this.missingSlots(current),
      profilePartial: current ?? {},
    })
    const patch = this.persistedPatch(intake.profilePatch)
    const profile =
      Object.keys(patch).length > 0 ? await this.upsertProfile(userId, patch) : current
    const stop = profile ? this.isStop(profile) : false

    return {
      assistantMessage: intake.assistantMessage,
      profileDraft: profile,
      readyToGenerate: profile ? this.isComplete(profile) && !stop : false,
      stop,
    }
  }

  private missingSlots(profile: FrontendTrainingProfile | null): string[] {
    return REQUIRED_FIELDS.filter(
      field => profile?.[field] === null || profile?.[field] === undefined,
    )
  }

  private persistedPatch(patch: Partial<ProfileFields>): TrainingProfilePatch {
    return {
      ...(patch.level !== undefined && { level: patch.level }),
      ...(patch.daysPerWeek !== undefined && { daysPerWeek: patch.daysPerWeek }),
      ...(patch.minutesPerSession !== undefined && {
        minutesPerSession: patch.minutesPerSession,
      }),
      ...(patch.equipment !== undefined && { equipment: patch.equipment }),
      ...(patch.goal !== undefined && { goal: patch.goal }),
      ...(patch.hasActiveInjury !== undefined && {
        hasActiveInjury: patch.hasActiveInjury,
      }),
      ...(patch.injuriesNotes !== undefined && {
        injuriesNotes: patch.injuriesNotes,
      }),
      ...(patch.restrictions !== undefined && {
        restrictions: patch.restrictions,
      }),
      ...(patch.understandsRir !== undefined && {
        understandsRir: patch.understandsRir,
      }),
    }
  }
}
