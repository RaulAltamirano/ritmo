import { PrismaClient } from '@prisma/client'
import { CIRCADIAN_PHASES } from '../config/database'

const phasePayload = (
  phaseData: (typeof CIRCADIAN_PHASES)[number],
): Parameters<PrismaClient['circadianPhase']['upsert']>[0]['create'] => ({
  type: phaseData.type,
  category: phaseData.category,
  priority: phaseData.priority,
  startHour: phaseData.startHour,
  endHour: phaseData.endHour,
  duration: phaseData.duration,
  name: phaseData.name,
  keyword: phaseData.keyword,
  description: phaseData.description,
  idealFor: phaseData.idealFor,
  color: phaseData.color,
  icon: phaseData.icon,
  emoji: phaseData.emoji,
  isPremium: phaseData.isPremium,
  isIntuitive: phaseData.isIntuitive,
  scientificReferences: phaseData.scientificReferences,
  evidenceLevel: phaseData.evidenceLevel,
  sortOrder: phaseData.sortOrder,
})

export class CircadianPhaseFactory {
  constructor(private readonly prisma: PrismaClient) {}

  async createCircadianPhases() {
    console.log('🌅 Upserting circadian phases...')

    const phases = await Promise.all(
      CIRCADIAN_PHASES.map(phaseData =>
        this.prisma.circadianPhase.upsert({
          where: { type: phaseData.type },
          create: phasePayload(phaseData),
          update: {
            category: phaseData.category,
            priority: phaseData.priority,
            startHour: phaseData.startHour,
            endHour: phaseData.endHour,
            duration: phaseData.duration,
            name: phaseData.name,
            keyword: phaseData.keyword,
            description: phaseData.description,
            idealFor: phaseData.idealFor,
            color: phaseData.color,
            icon: phaseData.icon,
            emoji: phaseData.emoji,
            isPremium: phaseData.isPremium,
            isIntuitive: phaseData.isIntuitive,
            scientificReferences: phaseData.scientificReferences,
            evidenceLevel: phaseData.evidenceLevel,
            sortOrder: phaseData.sortOrder,
          },
        }),
      ),
    )

    console.log(`✅ Upserted ${phases.length} circadian phases`)
    return phases
  }

  async createCircadianPhase(phaseData: {
    type:
      | 'slow_activation'
      | 'morning_focus_peak'
      | 'cognitive_peak'
      | 'second_productivity'
      | 'creative_window'
      | 'transition'
      | 'introspective'
      | 'sleep_preparation'
    category: 'activation' | 'performance' | 'creative' | 'reflection' | 'rest'
    priority: 'low' | 'medium' | 'high' | 'critical'
    startHour: number
    endHour: number
    duration: number
    name: string
    keyword: string
    description: string
    idealFor: string
    color: string
    icon: string
    emoji: string
    isPremium?: boolean
    isIntuitive?: boolean
    scientificReferences?: string[]
    evidenceLevel?: string
    sortOrder?: number
  }) {
    return this.prisma.circadianPhase.upsert({
      where: { type: phaseData.type },
      create: {
        type: phaseData.type,
        category: phaseData.category,
        priority: phaseData.priority,
        startHour: phaseData.startHour,
        endHour: phaseData.endHour,
        duration: phaseData.duration,
        name: phaseData.name,
        keyword: phaseData.keyword,
        description: phaseData.description,
        idealFor: phaseData.idealFor,
        color: phaseData.color,
        icon: phaseData.icon,
        emoji: phaseData.emoji,
        isPremium: phaseData.isPremium ?? false,
        isIntuitive: phaseData.isIntuitive ?? true,
        scientificReferences: phaseData.scientificReferences ?? [],
        evidenceLevel: phaseData.evidenceLevel ?? 'medium',
        sortOrder: phaseData.sortOrder ?? 0,
      },
      update: {
        category: phaseData.category,
        priority: phaseData.priority,
        startHour: phaseData.startHour,
        endHour: phaseData.endHour,
        duration: phaseData.duration,
        name: phaseData.name,
        keyword: phaseData.keyword,
        description: phaseData.description,
        idealFor: phaseData.idealFor,
        color: phaseData.color,
        icon: phaseData.icon,
        emoji: phaseData.emoji,
        isPremium: phaseData.isPremium ?? false,
        isIntuitive: phaseData.isIntuitive ?? true,
        scientificReferences: phaseData.scientificReferences ?? [],
        evidenceLevel: phaseData.evidenceLevel ?? 'medium',
        sortOrder: phaseData.sortOrder ?? 0,
      },
    })
  }
}
