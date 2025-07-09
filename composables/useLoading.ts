import { ref, computed } from 'vue'

interface LoadingState {
  isLoading: boolean
  message: string
  progress: number | null
  type: 'full' | 'overlay' | 'inline' | 'none'
}

const loadingState = ref<LoadingState>({
  isLoading: false,
  message: 'Loading...',
  progress: null,
  type: 'none'
})

const loadingQueue = ref<Set<string>>(new Set())

export const useLoading = () => {
  // Show loading screen
  const showLoading = (options: {
    message?: string
    type?: 'full' | 'overlay' | 'inline'
    progress?: number
    key?: string
  } = {}) => {
    const {
      message = 'Loading...',
      type = 'full',
      progress = null,
      key = 'default'
    } = options

    loadingQueue.value.add(key)
    
    loadingState.value = {
      isLoading: true,
      message,
      progress,
      type
    }
  }

  // Hide loading screen
  const hideLoading = (key: string = 'default') => {
    loadingQueue.value.delete(key)
    
    if (loadingQueue.value.size === 0) {
      loadingState.value = {
        isLoading: false,
        message: 'Loading...',
        progress: null,
        type: 'none'
      }
    }
  }

  // Update loading progress
  const updateProgress = (progress: number) => {
    if (loadingState.value.isLoading) {
      loadingState.value.progress = Math.min(100, Math.max(0, progress))
    }
  }

  // Update loading message
  const updateMessage = (message: string) => {
    if (loadingState.value.isLoading) {
      loadingState.value.message = message
    }
  }

  // Show loading with steps
  const showLoadingWithSteps = async (steps: Array<{
    message: string
    action: () => Promise<void>
    progress?: number
  }>) => {
    const totalSteps = steps.length
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const progress = step.progress ?? ((i + 1) / totalSteps) * 100
      
      showLoading({
        message: step.message,
        type: 'overlay',
        progress: Math.round(progress)
      })
      
      try {
        await step.action()
      } catch (error) {
        hideLoading()
        throw error
      }
    }
    
    hideLoading()
  }

  // Loading state getters
  const isLoading = computed(() => loadingState.value.isLoading)
  const loadingMessage = computed(() => loadingState.value.message)
  const loadingProgress = computed(() => loadingState.value.progress)
  const loadingType = computed(() => loadingState.value.type)
  const hasActiveLoadings = computed(() => loadingQueue.value.size > 0)

  return {
    // State
    isLoading,
    loadingMessage,
    loadingProgress,
    loadingType,
    hasActiveLoadings,
    
    // Actions
    showLoading,
    hideLoading,
    updateProgress,
    updateMessage,
    showLoadingWithSteps
  }
} 