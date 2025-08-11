// import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side
  if (process.server) {
    return
  }

  const { isAuthenticated } = useAuth()
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.includes(to.path)
  
  // If not authenticated and trying to access protected route
  if (!isAuthenticated.value && !isPublicRoute) {
    console.log('Auth middleware: Redirecting to login')
    return navigateTo('/login')
  }
  
  // If authenticated and trying to access auth pages
  if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
    console.log('Auth middleware: Redirecting to dashboard')
    return navigateTo('/dashboard')
  }
  
  console.log('Auth middleware: Allowing navigation to', to.path)
})
