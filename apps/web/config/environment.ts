/**
 * RITMO Web - Environment Configuration
 * Modern, scalable, and professional environment management
 * Uses Nuxt runtime config for better integration
 */

export interface WebConfig {
  app: {
    name: string
    version: string
    environment: string
  }
  api: {
    baseUrl: string
    endpoints: {
      auth: string
      tasks: string
      users: string
    }
  }
  features: {
    devtools: boolean
    analytics: boolean
    sentry: boolean
  }
  /** Timer / work sessions (client). `reflectionModalRequired`: env `NUXT_PUBLIC_TIMER_REFLECTION_REQUIRED` !== `'false'`. */
  timer: {
    reflectionModalRequired: boolean
  }
}

/**
 * Load environment configuration from Nuxt runtime config
 */
export function loadConfig(): WebConfig {
  const env = 'development'

  const apiBaseUrl =
    process.env.NUXT_PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL ??
    'http://localhost:3001/api'

  return {
    app: {
      name: process.env.NUXT_PUBLIC_APP_NAME ?? 'Ritmo',
      version: process.env.NUXT_PUBLIC_APP_VERSION ?? '2.0.0',
      environment: env,
    },

    api: {
      baseUrl: apiBaseUrl,
      endpoints: {
        auth: `${apiBaseUrl}/auth`,
        tasks: `${apiBaseUrl}/tasks`,
        users: `${apiBaseUrl}/users`,
      },
    },

    features: {
      devtools: true,
      analytics: false,
      sentry: false,
    },

    timer: {
      reflectionModalRequired:
        process.env.NUXT_PUBLIC_TIMER_REFLECTION_REQUIRED !== 'false',
    },
  }
}

/**
 * Get configuration instance
 */
export const config = loadConfig()

/**
 * Validate required environment variables
 */
export function validateConfig(): string[] {
  const errors: string[] = []

  if (!config.api.baseUrl) {
    errors.push('API_BASE_URL or NUXT_PUBLIC_API_BASE_URL is required')
  }

  if (!config.api.baseUrl.includes('http')) {
    errors.push('API_BASE_URL must be a valid HTTP URL')
  }

  return errors
}

/**
 * Get API base URL with fallback
 * This is the main function to use throughout the app
 */
export function getApiBaseUrl(): string {
  return config.api.baseUrl
}

/**
 * Build full API URL from endpoint
 */
export function buildApiUrl(endpoint: string): string {
  return `${config.api.baseUrl}${endpoint}`
}

export default config
