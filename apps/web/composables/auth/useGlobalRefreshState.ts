/**
 * 🚀 RITMO GLOBAL REFRESH STATE - 2025 BEST PRACTICES
 *
 * Centralized access to global refresh state:
 * - Single source of truth for refresh status
 * - Prevents circular dependencies
 * - Clean separation of concerns
 * - Proper singleton pattern for test isolation
 */

// Global state for refresh management
let globalRefreshState = {
  isRefreshing: false,
  hasRefreshPromise: false,
  queueLength: 0,
}

// Promise for ongoing refresh
let refreshPromise: Promise<boolean> | null = null

/**
 * Update global refresh state
 */
export const updateGlobalRefreshState = (state: {
  isRefreshing: boolean
  hasRefreshPromise: boolean
  queueLength: number
}) => {
  globalRefreshState = { ...state }
}

/**
 * Get global refresh state
 */
export const getGlobalRefreshState = () => ({ ...globalRefreshState })

/**
 * Set refresh promise
 */
export const setRefreshPromise = (promise: Promise<boolean> | null) => {
  refreshPromise = promise
}

/**
 * Get refresh promise
 */
export const getRefreshPromise = () => refreshPromise

/**
 * Reset global state (useful for tests)
 */
export const resetGlobalRefreshState = () => {
  globalRefreshState = {
    isRefreshing: false,
    hasRefreshPromise: false,
    queueLength: 0,
  }
  refreshPromise = null
}

/**
 * Composable for accessing global refresh state
 */
export const useGlobalRefreshState = () => {
  return {
    getRefreshState: getGlobalRefreshState,
    updateRefreshState: updateGlobalRefreshState,
    setRefreshPromise,
    getRefreshPromise,
    resetGlobalRefreshState,
  }
}
