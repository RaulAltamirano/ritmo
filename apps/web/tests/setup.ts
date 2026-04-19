import { beforeEach, vi } from 'vitest'

// Mock Nuxt composables
vi.mock('#app', () => ({
  definePageMeta: vi.fn(),
  navigateTo: vi.fn(),
  useRoute: vi.fn(() => ({
    path: '/',
    query: {},
    params: {},
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
  })),
  useHead: vi.fn(),
}))

// Mock Nuxt utilities
;(globalThis as any).definePageMeta = vi.fn()
;(globalThis as any).navigateTo = vi.fn()
;(globalThis as any).useRoute = vi.fn()
;(globalThis as any).useRouter = vi.fn()
;(globalThis as any).useHead = vi.fn()

// Mock $fetch
;(globalThis as any).$fetch = vi.fn()

// Mock Pinia properly - use real Pinia for reactivity
vi.mock('pinia', async () => {
  const actual = await vi.importActual('pinia')
  return actual
})

// Mock Vue composables - use real Vue for reactivity
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return actual
})

// Mock @ritmo/ui
vi.mock('@ritmo/ui', () => ({
  BaseButton: vi.fn(),
  BaseInput: vi.fn(),
  BaseModal: vi.fn(),
  BaseSpinner: vi.fn(),
  BaseToast: vi.fn(),
  BaseMenuItem: vi.fn(),
  EmptyState: vi.fn(),
  PageHeader: vi.fn(),
}))

// Note: useAuth composable is NOT mocked here - let composable tests use the real implementation

// Note: Auth store is NOT mocked here - let store tests use the real implementation

// Mock auth API
vi.mock('~/composables/auth/useAuthAPI', () => ({
  useAuthAPI: vi.fn(() => ({
    login: vi.fn().mockResolvedValue({ success: true }),
    register: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn().mockResolvedValue({ success: true }),
    verifyAuthentication: vi.fn().mockResolvedValue({ success: true }),
    refreshUserData: vi.fn().mockResolvedValue({ success: true }),
  })),
}))

// Mock authenticated HTTP client
vi.mock('~/composables/auth/useAuthenticatedHttpClient', () => ({
  useAuthenticatedHttpClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
}))

// Setup test environment
beforeEach(() => {
  vi.clearAllMocks()
})
