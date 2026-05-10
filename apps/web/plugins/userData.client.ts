/**
 * 🚀 RITMO USER DATA PLUGIN - 2025 MODERN BEST PRACTICES
 *
 * Plugin for initializing and managing user data globally:
 * - Ensures user data is available across the app
 * - Handles user data initialization
 * - Provides global user data access
 * - Manages user data lifecycle
 */

import { useUserData } from '@/composables/shared/useUserData'

export default defineNuxtPlugin(() => {
  // Initialize user data system on app start
  if (process.client) {
    try {
      // Initialize user data composable
      useUserData()
    } catch (error: any) {
      console.error('User data system initialization failed:', error)
    }
  }
})
