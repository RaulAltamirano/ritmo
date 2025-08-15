export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth()
  
  // Initialize authentication on app start (only if we have stored tokens)
  if (process.client) {
    const hasStoredAuth = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_tokens')
    
    if (hasStoredAuth) {
      await initAuth()
    }
  }
  
  // Set up token refresh interval
  if (process.client) {
    // Check token expiry every 5 minutes
    setInterval(async () => {
      const { checkTokenExpiry, isAuthenticated } = useAuth()
      if (isAuthenticated.value) {
        await checkTokenExpiry()
      }
    }, 5 * 60 * 1000)
    
    // Listen for auth events
    window.addEventListener('auth-event', (event: any) => {
      console.log('Auth event:', event.detail)
      
      // Handle specific auth events
      switch (event.detail.type) {
        case 'login':
          // Update UI or trigger other actions
          break
        case 'logout':
          // Clear any cached data
          break
        case 'token_refresh':
          // Handle token refresh
          break
      }
    })
  }
}) 