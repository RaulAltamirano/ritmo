/**
 * Configuración de rutas protegidas que requieren autenticación
 */

export const PROTECTED_ROUTES = [
  '/',
  '/dashboard',
  '/tareas',
  '/tasks',
  '/plans',
  '/projects',
  '/proyectos',
  '/analytics',
  '/analiticas',
  '/schedule',
  '/training',
  '/journal',
  '/sessions',
  '/profile',
  '/settings',
  '/configuracion',
  '/focus',
  '/study-plan',
  '/today',
  '/phase-images',
] as const

export const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/reset-password',
] as const

export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route))
}

export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(route => path === route)
}

export const requiresAuthentication = (path: string): boolean => {
  return isProtectedRoute(path) && !isPublicRoute(path)
}
