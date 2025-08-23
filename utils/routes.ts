/**
 * Rutas centralizadas de la aplicación
 * Todas las rutas deben ser definidas aquí para mantener consistencia
 */

export const ROUTES = {
  // Rutas públicas
  HOME: '/',
  LOGIN: '/login',
  
  // Rutas principales
  DASHBOARD: '/dashboard',
  HOY: '/hoy',
  TAREAS: '/tareas',
  PROYECTOS: '/proyectos',
  STUDY_PLAN: '/study-plan',
  JOURNAL: '/journal',
  HORARIO: '/schedule',
  ANALITICAS: '/analiticas',
  ENFOQUE: '/focus',
  
  // Rutas de perfil
  PERFIL: '/perfil',
  PROFILE: '/profile',
  CONFIGURACION: '/configuracion',
  
  // Rutas de desarrollo (eliminar en producción)
  TEST: '/test',
  TEST_NAVBAR: '/test-navbar',
  NAVBAR_DEMO: '/navbar-demo'
} as const

export const ROUTE_NAMES = {
  [ROUTES.HOME]: 'Inicio',
  [ROUTES.LOGIN]: 'Iniciar Sesión',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.HOY]: 'Hoy',
  [ROUTES.TAREAS]: 'Tareas',
  [ROUTES.PROYECTOS]: 'Proyectos',
  [ROUTES.STUDY_PLAN]: 'Study Plan',
  [ROUTES.JOURNAL]: 'Journal',
  [ROUTES.HORARIO]: 'Horario',
  [ROUTES.ANALITICAS]: 'Analíticas',
  [ROUTES.ENFOQUE]: 'Enfoque',
  [ROUTES.PERFIL]: 'Perfil',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.CONFIGURACION]: 'Configuración'
} as const

export const NAVIGATION_ITEMS = [
  {
    path: ROUTES.DASHBOARD,
    name: ROUTE_NAMES[ROUTES.DASHBOARD],
    icon: 'home',
    requiresAuth: true
  },
  {
    path: ROUTES.HOY,
    name: ROUTE_NAMES[ROUTES.HOY],
    icon: 'calendar',
    requiresAuth: true
  },
  {
    path: ROUTES.TAREAS,
    name: ROUTE_NAMES[ROUTES.TAREAS],
    icon: 'check-circle',
    requiresAuth: true
  },
  {
    path: ROUTES.PROYECTOS,
    name: ROUTE_NAMES[ROUTES.PROYECTOS],
    icon: 'folder',
    requiresAuth: true
  },
  {
    path: ROUTES.STUDY_PLAN,
    name: ROUTE_NAMES[ROUTES.STUDY_PLAN],
    icon: 'academic-cap',
    requiresAuth: true
  },
  {
    path: ROUTES.JOURNAL,
    name: ROUTE_NAMES[ROUTES.JOURNAL],
    icon: 'book-open',
    requiresAuth: true
  },
  {
    path: ROUTES.HORARIO,
    name: ROUTE_NAMES[ROUTES.HORARIO],
    icon: 'clock',
    requiresAuth: true
  },
  {
    path: ROUTES.ANALITICAS,
    name: ROUTE_NAMES[ROUTES.ANALITICAS],
    icon: 'chart-bar',
    requiresAuth: true
  },
  {
    path: ROUTES.ENFOQUE,
    name: ROUTE_NAMES[ROUTES.ENFOQUE],
    icon: 'eye',
    requiresAuth: true
  }
] as const

export const PROFILE_ITEMS = [
  {
    path: ROUTES.PERFIL,
    name: ROUTE_NAMES[ROUTES.PERFIL],
    icon: 'user'
  },
  {
    path: ROUTES.CONFIGURACION,
    name: ROUTE_NAMES[ROUTES.CONFIGURACION],
    icon: 'cog'
  }
] as const

/**
 * Función helper para navegación
 */
export const navigateToRoute = (route: keyof typeof ROUTES) => {
  return navigateTo(ROUTES[route])
}

/**
 * Función helper para obtener el nombre de una ruta
 */
export const getRouteName = (route: string): string => {
  return ROUTE_NAMES[route as keyof typeof ROUTE_NAMES] || route
}

/**
 * Función helper para verificar si una ruta requiere autenticación
 */
export const isRouteProtected = (route: string): boolean => {
  const navItem = NAVIGATION_ITEMS.find(item => item.path === route)
  return navItem?.requiresAuth || false
} 