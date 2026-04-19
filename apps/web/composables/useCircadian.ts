/**
 * 🌅 RITMO CIRCADIAN COMPOSABLE - 2025 BEST PRACTICES
 *
 * Modern circadian rhythm composable that:
 * - Fetches current phase from API
 * - Provides reactive phase data
 * - Handles timezone and custom time
 * - Includes task recommendations
 * - Optimized for performance
 */

import { computed, onMounted, onUnmounted, readonly, ref } from 'vue'
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
  keyword: string
  description: string
  idealFor: string
  color: string
  icon: string
  emoji: string
  isPremium: boolean
  isIntuitive: boolean
  scientificReferences: string[]
  evidenceLevel: string
  sortOrder: number
}

export interface CurrentPhaseResponse {
  phase: CircadianPhase
  currentTime: string
  timeUntilNext: number
  taskRecommendations: {
    primary: string[]
    secondary: string[]
    avoid: string[]
  }
  productivityExpectation: {
    min: number
    max: number
    default: number
    description: string
  }
}

export interface UseCircadianOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
  timezone?: string
  customTime?: Date
}

export const useCircadian = (options: UseCircadianOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute
    timezone = 'UTC',
    customTime,
  } = options

  const httpClient = useAuthenticatedHttpClient()

  // Reactive state
  const currentPhase = ref<CircadianPhase | null>(null)
  const timeUntilNext = ref<number>(0)
  const taskRecommendations = ref<any>({})
  const productivityExpectation = ref<any>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Auto-refresh timer
  let refreshTimer: NodeJS.Timeout | null = null

  // Computed properties
  const isPhaseActive = computed(() => !!currentPhase.value)
  const phaseProgress = computed(() => {
    if (!currentPhase.value) return 0

    const now = new Date()
    const currentHour = now.getHours()
    const startHour = currentPhase.value.startHour
    const endHour = currentPhase.value.endHour
    const totalDuration = endHour - startHour
    const elapsed = currentHour - startHour

    return Math.max(0, Math.min(1, elapsed / totalDuration))
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

  // Methods
  const fetchCurrentPhase = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (timezone) params.append('timezone', timezone)
      if (customTime) params.append('customTime', customTime.toISOString())

      const response = await httpClient.get<CurrentPhaseResponse>(
        `/api/circadian/current-phase?${params}`,
      )

      currentPhase.value = response.data.phase
      timeUntilNext.value = response.data.timeUntilNext
      taskRecommendations.value = response.data.taskRecommendations
      productivityExpectation.value = response.data.productivityExpectation
      lastUpdated.value = new Date()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch circadian phase'
      console.error('Circadian phase fetch error:', err)

      // Fallback: Calculate phase client-side
      const fallbackPhase = calculateCurrentPhaseClientSide()
      if (fallbackPhase) {
        currentPhase.value = fallbackPhase
        timeUntilNext.value = calculateTimeUntilNextPhase(fallbackPhase)
        lastUpdated.value = new Date()
      }
    } finally {
      isLoading.value = false
    }
  }

  // Client-side fallback calculation
  const calculateCurrentPhaseClientSide = (): CircadianPhase | null => {
    const now = new Date()
    const currentHour = now.getHours()

    // Define phases based on the constants from the API
    const phases: CircadianPhase[] = [
      {
        id: '1',
        type: 'slow_activation',
        category: 'activation',
        priority: 'low',
        startHour: 5,
        endHour: 7,
        duration: 120,
        name: 'Slow Activation Phase',
        keyword: 'Calm',
        description:
          'Low alertness due to sleep inertia. Cortisol levels begin to rise, but performance is still suboptimal.',
        idealFor: 'Meditation, journaling, visualization',
        color: '#fde047',
        icon: 'coffee',
        emoji: '🟡',
        isPremium: false,
        isIntuitive: true,
        scientificReferences: ['PMC10683050'],
        evidenceLevel: 'high',
        sortOrder: 1,
      },
      {
        id: '2',
        type: 'morning_focus_peak',
        category: 'performance',
        priority: 'critical',
        startHour: 7,
        endHour: 9,
        duration: 120,
        name: 'Morning Focus Peak',
        keyword: 'Focus',
        description:
          'High attention and short-term memory performance, supported by circadian cortisol peak.',
        idealFor: 'Technical reading, structured study',
        color: '#4ade80',
        icon: 'sun',
        emoji: '🟢',
        isPremium: true,
        isIntuitive: false,
        scientificReferences: ['Springer2023'],
        evidenceLevel: 'high',
        sortOrder: 2,
      },
      {
        id: '3',
        type: 'cognitive_peak',
        category: 'performance',
        priority: 'critical',
        startHour: 9,
        endHour: 12,
        duration: 180,
        name: 'Cognitive Performance Peak',
        keyword: 'Peak',
        description:
          'Maximum cognitive performance for problem-solving, logic, and deep work.',
        idealFor: 'Programming, logic, deep work',
        color: '#60a5fa',
        icon: 'activity',
        emoji: '🔵',
        isPremium: true,
        isIntuitive: false,
        scientificReferences: ['PMC10683050'],
        evidenceLevel: 'high',
        sortOrder: 3,
      },
      {
        id: '4',
        type: 'second_productivity',
        category: 'performance',
        priority: 'high',
        startHour: 13,
        endHour: 15,
        duration: 120,
        name: 'Second Productivity Peak',
        keyword: 'Review',
        description:
          'Second circasemidian peak. If recovered, cognitive performance improves again.',
        idealFor: 'Review, technical tasks, recap',
        color: '#38bdf8',
        icon: 'repeat',
        emoji: '🔵',
        isPremium: true,
        isIntuitive: false,
        scientificReferences: ['Circasemidian rhythm Wiki'],
        evidenceLevel: 'medium',
        sortOrder: 4,
      },
      {
        id: '5',
        type: 'creative_window',
        category: 'creative',
        priority: 'medium',
        startHour: 15,
        endHour: 17,
        duration: 120,
        name: 'Creative/Verbal Window',
        keyword: 'Create',
        description: 'Verbal fluency and creative thinking increase in the afternoon.',
        idealFor: 'Writing, design, language output',
        color: '#a78bfa',
        icon: 'pen-tool',
        emoji: '🟣',
        isPremium: false,
        isIntuitive: true,
        scientificReferences: ['GQ2024'],
        evidenceLevel: 'medium',
        sortOrder: 5,
      },
      {
        id: '6',
        type: 'transition',
        category: 'reflection',
        priority: 'medium',
        startHour: 17,
        endHour: 19,
        duration: 120,
        name: 'Transition Phase',
        keyword: 'Reflect',
        description:
          'Energy starts to decline; reflection and memory consolidation become more prominent.',
        idealFor: 'Consolidation, active review, journaling',
        color: '#fdba74',
        icon: 'book-open',
        emoji: '🟠',
        isPremium: false,
        isIntuitive: true,
        scientificReferences: ['PMC10683050'],
        evidenceLevel: 'high',
        sortOrder: 6,
      },
      {
        id: '7',
        type: 'introspective',
        category: 'reflection',
        priority: 'low',
        startHour: 19,
        endHour: 21,
        duration: 120,
        name: 'Introspective Phase',
        keyword: 'Plan',
        description:
          'Autobiographical memory and emotional integration become dominant.',
        idealFor: 'Slow reading, visualization, planning',
        color: '#fde047',
        icon: 'moon',
        emoji: '🟡',
        isPremium: false,
        isIntuitive: true,
        scientificReferences: ['Nature2018'],
        evidenceLevel: 'medium',
        sortOrder: 7,
      },
      {
        id: '8',
        type: 'sleep_preparation',
        category: 'rest',
        priority: 'low',
        startHour: 21,
        endHour: 23,
        duration: 120,
        name: 'Sleep Preparation',
        keyword: 'Sleep',
        description: 'Cortical activity decreases as melatonin rises.',
        idealFor: 'Rest routine, sleep hygiene',
        color: '#a3a3a3',
        icon: 'bed',
        emoji: '⚫',
        isPremium: false,
        isIntuitive: false,
        scientificReferences: ['Circadian rhythm Wiki'],
        evidenceLevel: 'high',
        sortOrder: 8,
      },
    ]

    // Find current phase
    const currentPhase = phases.find(
      phase => currentHour >= phase.startHour && currentHour < phase.endHour,
    )

    // Handle overnight hours (23:00 - 5:00)
    if (!currentPhase) {
      return phases.find(phase => phase.type === 'sleep_preparation') || null
    }

    return currentPhase
  }

  const calculateTimeUntilNextPhase = (phase: CircadianPhase): number => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const endHour = phase.endHour
    const endMinute = 0

    let timeUntilNext = endHour * 60 + endMinute - (currentHour * 60 + currentMinute)

    // Handle overnight transition
    if (timeUntilNext <= 0) {
      timeUntilNext += 24 * 60 // Add 24 hours
    }

    return timeUntilNext
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

    // Image mapping for different phases
    const phaseImages = {
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

    // Get images for current phase or use default
    const images = phaseImages[currentPhase.value.type as keyof typeof phaseImages] || [
      'https://plus.unsplash.com/premium_photo-1755882941142-5c8a5f27e2f3?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ]

    // Randomly select an image from the available ones
    const randomImage = images[Math.floor(Math.random() * images.length)]

    return {
      label: currentPhase.value.name,
      emoji: currentPhase.value.emoji,
      image: randomImage,
      suggestion: `Ideal for: ${currentPhase.value.idealFor}`,
      color: currentPhase.value.color,
      progress: phaseProgress.value,
      timeUntilNext: timeUntilNextFormatted.value,
    }
  })

  // Lifecycle
  onMounted(() => {
    fetchCurrentPhase()
    if (autoRefresh) {
      startAutoRefresh()
    }
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // State
    currentPhase: readonly(currentPhase),
    timeUntilNext: readonly(timeUntilNext),
    taskRecommendations: readonly(taskRecommendations),
    productivityExpectation: readonly(productivityExpectation),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),

    // Computed
    isPhaseActive,
    phaseProgress,
    timeUntilNextFormatted,
    getPhaseDataForHeader,

    // Methods
    fetchCurrentPhase,
    startAutoRefresh,
    stopAutoRefresh,
  }
}
