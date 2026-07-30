/**
 * Breadcrumb composable for automatic navigation breadcrumbs
 * Generates breadcrumb data based on current route and route metadata
 */

export interface BreadcrumbItem {
  label: string
  to?: string
  isActive?: boolean
}

// Route metadata for breadcrumb labels
const ROUTE_METADATA = {
  // Main navigation
  '/': { label: 'Home', parent: null },
  '/dashboard': { label: 'Dashboard', parent: '/' },
  '/today': { label: 'Today', parent: '/' },
  '/planes': { label: 'Plans', parent: '/' },
  '/schedule': { label: 'Schedule', parent: '/' },
  '/training': { label: 'Training', parent: '/' },
  '/study-plan': { label: 'Study Plan', parent: '/' },
  '/journal': { label: 'Journal', parent: '/' },
  '/analytics': { label: 'Analytics', parent: '/' },
  '/focus': { label: 'Focus', parent: '/' },

  // User routes
  '/profile': { label: 'Profile', parent: '/' },
  '/profile/sessions': { label: 'Sessions', parent: '/profile' },
  '/settings': { label: 'Settings', parent: '/' },

  // Auth routes
  '/auth/login': { label: 'Sign In', parent: null },
  '/auth/register': { label: 'Sign Up', parent: null },
  '/auth/forgot-password': { label: 'Forgot Password', parent: '/auth/login' },

  // Additional routes
  '/tasks': { label: 'Tasks', parent: '/' },
  '/tareas': { label: 'Tareas', parent: '/' },
  '/configuracion': { label: 'Configuración', parent: '/' },
  '/analiticas': { label: 'Analíticas', parent: '/' },
} as const

export const useBreadcrumbs = () => {
  const route = useRoute()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = []
    const currentPath = route.path

    // Get current route metadata
    const currentRouteMeta = ROUTE_METADATA[currentPath as keyof typeof ROUTE_METADATA]

    if (!currentRouteMeta) {
      // If no metadata found, try to generate from path segments
      return generateBreadcrumbsFromPath(currentPath)
    }

    // Build breadcrumb chain by following parent relationships
    const buildChain = (path: string, visited = new Set<string>()): string[] => {
      if (visited.has(path)) return [] // Prevent infinite loops
      visited.add(path)

      const meta = ROUTE_METADATA[path as keyof typeof ROUTE_METADATA]
      if (!meta?.parent) {
        return [path]
      }

      return [...buildChain(meta.parent, visited), path]
    }

    const pathChain = buildChain(currentPath)

    // Convert path chain to breadcrumb items
    pathChain.forEach((path, index) => {
      const meta = ROUTE_METADATA[path as keyof typeof ROUTE_METADATA]
      if (meta) {
        const isLast = index === pathChain.length - 1
        breadcrumbs.push({
          label: meta.label,
          to: isLast ? undefined : path,
          isActive: isLast,
        })
      }
    })

    return breadcrumbs
  }

  const generateBreadcrumbsFromPath = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home if not root
    if (path !== '/') {
      breadcrumbs.push({
        label: 'Home',
        to: '/',
      })
    }

    // Build breadcrumbs from path segments
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1

      // Capitalize and format segment name
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      breadcrumbs.push({
        label,
        to: isLast ? undefined : currentPath,
        isActive: isLast,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = computed(() => generateBreadcrumbs())

  return {
    breadcrumbs,
    generateBreadcrumbs,
  }
}
