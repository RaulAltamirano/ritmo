import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { useTheme } from '@/composables/shared/useTheme'

vi.mock('@/composables/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: { value: false } }),
}))

vi.mock('@/composables/shared/useHttpClient', () => ({
  useHttpClient: () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    extractData: (r: unknown) => r,
  }),
}))

const baseOptions = {
  storageKey: 'theme' as const,
  enableApiSync: false,
  autoSyncOnChange: false,
}

function runUseTheme() {
  const scope = effectScope(true)
  const api = scope.run(() => useTheme(baseOptions))!
  return { scope, api }
}

function matchMediaList(matches: boolean) {
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark', 'is-switching-theme')
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.colorScheme = ''
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query === '(prefers-color-scheme: dark)') return matchMediaList(false)
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('con modo explícito claro, toggleTheme pasa a oscuro y actualiza almacenamiento', async () => {
    localStorage.setItem('theme', 'light')
    localStorage.setItem('theme-mode', 'light')

    const { scope, api } = runUseTheme()

    expect(api.isDark.value).toBe(false)
    api.toggleTheme()
    await nextTick()
    expect(api.isDark.value).toBe(true)
    expect(localStorage.getItem('theme-mode')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    scope.stop()
  })

  it('setTheme(dark) fija isDark, theme-mode y clase en documentElement', async () => {
    const { scope, api } = runUseTheme()
    await api.setTheme('dark')
    await nextTick()
    expect(api.themeState.value.theme).toBe('dark')
    expect(api.isDark.value).toBe(true)
    expect(localStorage.getItem('theme-mode')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    scope.stop()
  })
})
