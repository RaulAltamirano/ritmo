/**
 * Centralized route configuration for the application
 * This ensures consistency across components and prevents route mismatches
 *
 * Updated to match the actual page structure in /pages directory
 */

export const ROUTES = {
  // Main navigation routes
  DASHBOARD: '/dashboard',
  TODAY: '/today',
  /** Listado y detalle de planes (estudio, hábitos, metas). Antes `/projects` y `/proyectos`. */
  PROJECTS: '/planes',

  // Secondary navigation routes
  SCHEDULE: '/schedule',
  /** Weekly strength plan (WFITNESS). */
  TRAINING: '/training',
  STUDY_PLAN: '/study-plan',
  JOURNAL: '/journal',

  // Productivity routes
  ANALYTICS: '/analytics',
  FOCUS: '/focus',

  // User routes
  PROFILE: '/profile',
  PROFILE_SESSIONS: '/profile/sessions',
  SETTINGS: '/settings',

  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Additional routes
  TASKS: '/tasks',
  TAREAS: '/tareas', // Spanish version
  SESSIONS: '/profile/sessions', // Updated to new structure
  PHASE_IMAGES: '/gallery/phase-images',
  CONFIGURACION: '/configuracion', // Spanish version of settings
  ANALITICAS: '/analiticas', // Spanish version of analytics

  // Root
  HOME: '/',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]

/**
 * Helper function to get route path by key
 */
export const getRoute = (key: RouteKey): RoutePath => {
  return ROUTES[key]
}

/**
 * Helper function to check if a path matches a route
 */
export const isRoute = (path: string, routeKey: RouteKey): boolean => {
  return path === ROUTES[routeKey]
}

/**
 * Helper function to get all route paths
 */
export const getAllRoutes = (): RoutePath[] => {
  return Object.values(ROUTES)
}

/**
 * Route validation - ensures all routes have corresponding pages
 * This can be used for development/debugging
 */
export const validateRoutes = (): { valid: RoutePath[]; invalid: RoutePath[] } => {
  const allRoutes = getAllRoutes()
  const validRoutes: RoutePath[] = []
  const invalidRoutes: RoutePath[] = []

  // This would need to be implemented with actual file system checking
  // For now, we'll assume all routes are valid based on the page structure
  allRoutes.forEach(route => {
    // Basic validation - routes should start with / and not be empty
    if (route.startsWith('/') && route !== '') {
      validRoutes.push(route)
    } else {
      invalidRoutes.push(route)
    }
  })

  return { valid: validRoutes, invalid: invalidRoutes }
}
