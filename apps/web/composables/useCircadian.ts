/**
 * Circadian rhythm composable — data comes only from GET /circadian/current-phase (DB-backed API).
 */

import {
  getFractionalHourInTimezone,
  getWallClockInTimezone,
  minutesUntilPhaseEnd,
} from '@ritmo/shared'
import type { MaybeRefOrGetter } from 'vue'
import { computed, onMounted, onUnmounted, readonly, ref, toValue, watch } from 'vue'
import { useAuthenticatedHttpClient } from './auth/useAuthenticatedHttpClient'

export interface CircadianPhase {
  id: string
  type: string
  category: string
  priority: string
  startHour: number
  endHour: number
  duration: number
  name: string
  keyword?: string
  description: string
  idealFor?: string
  color: string
  icon: string
  emoji?: string
  isPremium: boolean
  isIntuitive: boolean
  scientificReferences?: string[]
  evidenceLevel?: string
  sortOrder?: number
  taskRecommendations?: string[]
}

/** Matches API `CurrentPhaseResponseDTO` */
export interface CurrentPhasePayload {
  phase: CircadianPhase
  timezone: string
  referenceTime: string
  timeUntilNext: number
}

export interface UseCircadianOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  /** IANA zone (e.g. America/Mexico_City). Accepts ref/getter so profile hydration updates fetches. */
  timezone?: MaybeRefOrGetter<string>
  customTime?: Date
}

export const useCircadian = (options: UseCircadianOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 60000, customTime } = options

  const resolvedTimezone = (): string => toValue(options.timezone ?? 'UTC')

  const httpClient = useAuthenticatedHttpClient()

  const currentPhase = ref<CircadianPhase | null>(null)

  /** Wall-clock tick so countdown/progress advance between API polls (same math as server). */
  const wallClockTick = ref(0)
  let wallClockTimer: ReturnType<typeof setInterval> | null = null
  const taskRecommendations = ref<{ primary?: string[] }>({})
  const productivityExpectation = ref<Record<string, unknown>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  let refreshTimer: NodeJS.Timeout | null = null

  /** Drives recomputation of progress and “time until next phase” between API polls. */
  const effectiveNow = (): Date => {
    if (customTime) return customTime
    const tick = wallClockTick.value
    const d = new Date()
    d.setMilliseconds(d.getMilliseconds() + tick * 0)
    return d
  }

  const iconToEmojiMap: Record<string, string> = {
    moon: '🌙',
    bed: '🛌',
    sun: '☀️',
    coffee: '☕',
    activity: '⚡',
    repeat: '🔁',
    'pen-tool': '🖊️',
    'book-open': '📖',
  }

  const resolvePhaseEmoji = (phase: Partial<CircadianPhase>): string => {
    const emojiCandidate = phase.emoji?.trim()
    if (emojiCandidate) return emojiCandidate

    const rawIcon = (phase.icon || '').trim()
    const normalizedIcon = rawIcon.toLowerCase()
    if (iconToEmojiMap[normalizedIcon]) return iconToEmojiMap[normalizedIcon]

    if (rawIcon && [...rawIcon].length <= 3) return rawIcon

    return '🌙'
  }

  const isPhaseActive = computed(() => !!currentPhase.value)

  const phaseProgress = computed(() => {
    if (!currentPhase.value) return 0

    const currentHourWithMinutes = getFractionalHourInTimezone(
      effectiveNow(),
      resolvedTimezone(),
    )
    const startHour = currentPhase.value.startHour
    const endHour = currentPhase.value.endHour
    const wrapsToNextDay = endHour <= startHour
    const totalDuration = wrapsToNextDay
      ? 24 - startHour + endHour
      : endHour - startHour

    let elapsed: number
    if (wrapsToNextDay) {
      elapsed =
        currentHourWithMinutes >= startHour
          ? currentHourWithMinutes - startHour
          : 24 - startHour + currentHourWithMinutes
    } else {
      elapsed = currentHourWithMinutes - startHour
    }

    if (totalDuration <= 0) return 0
    return Math.max(0, Math.min(1, elapsed / totalDuration))
  })

  const timeUntilNext = computed(() => {
    if (!currentPhase.value) return 0
    const wall = getWallClockInTimezone(effectiveNow(), resolvedTimezone())
    return minutesUntilPhaseEnd(
      currentPhase.value.startHour,
      currentPhase.value.endHour,
      wall,
    )
  })

  const timeUntilNextFormatted = computed(() => {
    if (timeUntilNext.value <= 0) return 'Now'

    const hours = Math.floor(timeUntilNext.value / 60)
    const minutes = timeUntilNext.value % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  })

  const normalizePhase = (phase: CircadianPhase): CircadianPhase => {
    const computedDurationHours =
      phase.endHour <= phase.startHour
        ? 24 - phase.startHour + phase.endHour
        : phase.endHour - phase.startHour
    const fallbackIdealFor =
      phase.description || 'Actividades alineadas a tu fase circadiana actual'

    return {
      ...phase,
      duration: phase.duration || computedDurationHours * 60,
      keyword: phase.keyword || phase.name,
      idealFor: phase.idealFor || fallbackIdealFor,
      emoji: resolvePhaseEmoji(phase),
      scientificReferences: phase.scientificReferences || [],
      evidenceLevel: phase.evidenceLevel || 'medium',
      sortOrder: phase.sortOrder ?? 0,
      taskRecommendations: phase.taskRecommendations || [],
    }
  }

  const fetchCurrentPhase = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      const tz = resolvedTimezone()
      if (tz) params.append('timezone', tz)
      if (customTime) params.append('customTime', customTime.toISOString())

      const response = await httpClient.get<CurrentPhasePayload>(
        `/circadian/current-phase?${params}`,
      )
      const payload = response.data

      if (!payload?.phase) {
        throw new Error('Invalid circadian response: phase not found')
      }

      const normalizedPhase = normalizePhase(payload.phase)
      currentPhase.value = normalizedPhase

      const primary = normalizedPhase.taskRecommendations?.length
        ? normalizedPhase.taskRecommendations
        : []
      taskRecommendations.value = { primary }
      productivityExpectation.value = {}
      lastUpdated.value = new Date()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch circadian phase'
      error.value = message
      console.error('Circadian phase fetch error:', err)
      currentPhase.value = null
    } finally {
      isLoading.value = false
    }
  }

  const startAutoRefresh = () => {
    if (!autoRefresh || refreshTimer) return

    refreshTimer = setInterval(() => {
      fetchCurrentPhase()
    }, refreshInterval)
  }

  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  const getPhaseDataForHeader = computed(() => {
    if (!currentPhase.value) return null

    const phaseImages: Record<string, string[]> = {
      slow_activation: [
        'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVsYXh8ZW58MHx8MHx8fDA%3D',
        'https://images.unsplash.com/photo-1499810631641-541e76d678a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJlbGF4fGVufDB8fDB8fHww',
      ],
      morning_focus_peak: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9ybmluZ3xlbnwwfDB8MHx8',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VucmlzZXxlbnwwfDB8MHx8',
      ],
      cognitive_peak: [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9jdXN8ZW58MHx8MHx8fDA%3D',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29ya3xlbnwwfDB8MHx8',
      ],
      second_productivity: [
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVhbXxlbnwwfDB8MHx8',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVldGluZ3xlbnwwfDB8MHx8',
      ],
      creative_window: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JlYXRpdml0eXxlbnwwfDB8MHx8',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJhaW5zdG9ybXxlbnwwfDB8MHx8',
      ],
      transition: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWZ0ZXJub29ufGVufDB8MHx8fDA%3D',
        'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVsYXh8ZW58MHx8MHx8fDA%3D',
      ],
      introspective: [
        'https://images.unsplash.com/photo-1499810631641-541e76d678a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJlbGF4fGVufDB8fDB8fHww',
        'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVsYXh8ZW58MHx8MHx8fDA%3D',
      ],
      sleep_preparation: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmlnaHR8ZW58MHx8MHx8fDA%3D',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2xlZXB8ZW58MHx8MHx8fDA%3D',
      ],
    }

    const images = phaseImages[currentPhase.value.type] || [
      'https://plus.unsplash.com/premium_photo-1755882941142-5c8a5f27e2f3?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ]

    const randomImage = images[Math.floor(Math.random() * images.length)]

    return {
      label: currentPhase.value.name,
      emoji: currentPhase.value.emoji,
      iconKey: currentPhase.value.type,
      image: randomImage,
      suggestion: `Ideal for: ${currentPhase.value.idealFor}`,
      color: currentPhase.value.color,
      progress: phaseProgress.value,
      timeUntilNext: timeUntilNextFormatted.value,
    }
  })

  watch(
    () => resolvedTimezone(),
    () => {
      fetchCurrentPhase()
    },
  )

  onMounted(() => {
    wallClockTimer = setInterval(() => {
      wallClockTick.value++
    }, 30000)
    fetchCurrentPhase()
    if (autoRefresh) {
      startAutoRefresh()
    }
  })

  onUnmounted(() => {
    stopAutoRefresh()
    if (wallClockTimer) {
      clearInterval(wallClockTimer)
      wallClockTimer = null
    }
  })

  return {
    currentPhase: readonly(currentPhase),
    timeUntilNext,
    taskRecommendations: readonly(taskRecommendations),
    productivityExpectation: readonly(productivityExpectation),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),

    isPhaseActive,
    phaseProgress,
    timeUntilNextFormatted,
    getPhaseDataForHeader,

    fetchCurrentPhase,
    startAutoRefresh,
    stopAutoRefresh,
  }
}
