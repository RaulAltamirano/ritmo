/**
 * 🚀 RITMO AUTH MIDDLEWARE - 2025 MODERN BEST PRACTICES
 *
 * Optimized authentication middleware following latest patterns:
 * - Zero legacy code
 * - Modern route protection
 * - Clean redirects
 * - Single responsibility
 * - Efficient initialization with caching
 * - Loading state management
 */

import { useAuth } from '~/composables/auth'
import { isPublicRoute, requiresAuthentication } from '~/config/protected-routes'

// Global auth initialization flag with caching
let authInitialized = false
let authInitPromise: Promise<any> | null = null

export default defineNuxtRouteMiddleware(async (to: any) => {
  // Skip middleware on server-side
  if (process.server) {
    return undefined
  }

  // Get authentication state
  const { isAuthenticated, initAuth } = useAuth()

  // Initialize auth only once with promise caching
  if (!authInitialized) {
    authInitPromise ??= initAuth()
    await authInitPromise
    authInitialized = true
  }

  // Check route requirements
  const needsAuth = requiresAuthentication(to.path)
  const isPublic = isPublicRoute(to.path)

  // Protect routes that require authentication
  if (needsAuth && !isAuthenticated.value) {
    return navigateTo({
      path: '/auth/login',
      query: {
        redirect: to.fullPath,
        reason: 'authentication_required',
      },
    })
  }

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated.value &&
    (to.path === '/auth/login' || to.path === '/auth/register')
  ) {
    return navigateTo('/today')
  }

  // Allow access to public routes
  if (isPublic) {
    return undefined
  }

  // Allow access to protected routes for authenticated users
  if (needsAuth && isAuthenticated.value) {
    return undefined
  }

  return undefined
})
