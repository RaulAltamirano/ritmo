// Composable moderno para gestión de temas - Ritmo 2025
// Implementa las mejores prácticas de dark mode usando VueUse
// Basado en: VueUse useDark y estándares modernos
// Integrado con API para sincronización entre dispositivos

import {
  useDark,
  useLocalStorage,
  usePreferredColorScheme,
  useToggle,
} from '@vueuse/core'
import { computed, readonly, watch } from 'vue'
import { useThemeApi } from './useThemeApi'

export interface ThemeOptions {
  // Almacenamiento
  storageKey?: string
  // Comportamiento
  respectSystemPreference?: boolean
  // Transiciones
  enableTransitions?: boolean
  // Accesibilidad
  respectReducedMotion?: boolean
  // Sincronización con API
  enableApiSync?: boolean
  // Auto-sync al cambiar tema
  autoSyncOnChange?: boolean
}

export interface ThemeState {
  isDark: boolean
  isSystemDark: boolean
  hasUserPreference: boolean
  theme: 'light' | 'dark' | 'system'
}

export function useTheme(options: ThemeOptions = {}) {
  const {
    storageKey = 'theme', // Cambiar a 'theme' para consistencia
    respectSystemPreference = true,
    enableTransitions = true,
    respectReducedMotion = true,
    enableApiSync = true,
    autoSyncOnChange = true,
  } = options

  // VueUse composables - estado de la fuente de verdad
  const isDark = useDark({
    storageKey,
    initialValue: 'light', // Siempre usar 'light' como fallback
  })

  const toggleDark = useToggle(isDark)
  const preferredColorScheme = usePreferredColorScheme()

  // API integration para sincronización con backend
  const themeApi = useThemeApi()

  // Estado del tema del usuario - usar el mismo storageKey
  const userTheme = useLocalStorage<'light' | 'dark' | 'system'>(
    `${storageKey}-mode`,
    'system',
  )

  // Inicialización robusta del tema
  const initializeTheme = () => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    const savedMode = localStorage.getItem(`${storageKey}-mode`)
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedMode === 'system' || !savedMode) {
      // Usar preferencia del sistema
      if (respectSystemPreference) {
        isDark.value = systemPrefersDark
      } else {
        isDark.value = false // Fallback a light
      }
    } else if (savedMode === 'dark') {
      isDark.value = true
    } else {
      isDark.value = false
    }
  }

  // Ejecutar inicialización inmediatamente
  initializeTheme()

  // Estados computados
  const isSystemDark = computed(() => preferredColorScheme.value === 'dark')
  const hasUserPreference = computed(() => userTheme.value !== 'system')

  // Estado completo del tema
  const themeState = computed<ThemeState>(() => ({
    isDark: isDark.value,
    isSystemDark: isSystemDark.value,
    hasUserPreference: hasUserPreference.value,
    theme: userTheme.value,
  }))

  // Funciones de control
  const setTheme = async (theme: 'light' | 'dark' | 'system') => {
    userTheme.value = theme

    if (theme === 'system') {
      // Usar preferencia del sistema
      isDark.value = isSystemDark.value
    } else {
      // Usar preferencia del usuario
      isDark.value = theme === 'dark'
    }

    // Sincronizar con backend si está habilitado y el usuario está autenticado
    if (enableApiSync && autoSyncOnChange && themeApi.isAuthenticated.value) {
      try {
        await themeApi.syncThemeWithBackend(theme)
      } catch (error) {
        console.warn('Failed to sync theme with backend:', error)
        // No lanzar error para no interrumpir el cambio de tema local
      }
    }
  }

  const toggleTheme = () => {
    if (hasUserPreference.value) {
      // Si ya tiene preferencia, alternar entre light/dark
      setTheme(isDark.value ? 'light' : 'dark')
    } else {
      // Si no tiene preferencia, alternar basado en sistema
      toggleDark()
      userTheme.value = isDark.value ? 'dark' : 'light'
    }
  }

  const resetToSystem = async () => {
    userTheme.value = 'system'
    isDark.value = isSystemDark.value

    // Sincronizar con backend
    if (enableApiSync && themeApi.isAuthenticated.value) {
      try {
        await themeApi.syncThemeWithBackend('system')
      } catch (error) {
        console.warn('Failed to sync reset to system with backend:', error)
      }
    }
  }

  // Función para cargar tema desde el backend
  const loadThemeFromBackend = async (): Promise<boolean> => {
    if (!enableApiSync || !themeApi.isAuthenticated.value) {
      return false
    }

    try {
      const backendTheme = await themeApi.getThemeFromBackend()
      if (backendTheme && backendTheme !== userTheme.value) {
        userTheme.value = backendTheme

        if (backendTheme === 'system') {
          isDark.value = isSystemDark.value
        } else {
          isDark.value = backendTheme === 'dark'
        }

        return true
      }
    } catch (error) {
      console.warn('Failed to load theme from backend:', error)
    }

    return false
  }

  // Función para sincronizar manualmente con el backend
  const syncWithBackend = async (): Promise<boolean> => {
    if (!enableApiSync || !themeApi.isAuthenticated.value) {
      return false
    }

    try {
      const syncedTheme = await themeApi.syncThemeWithBackend(userTheme.value)
      return syncedTheme !== null
    } catch (error) {
      console.warn('Failed to sync with backend:', error)
      return false
    }
  }

  // Sincronización automática con preferencias del sistema
  watch(
    () => preferredColorScheme.value,
    newScheme => {
      if (userTheme.value === 'system') {
        isDark.value = newScheme === 'dark'
      }
    },
  )

  // Smooth theme transition + browser-chrome sync on every theme change
  if (typeof document !== 'undefined') {
    watch(
      isDark,
      newIsDark => {
        // Sync color-scheme so native browser controls (scrollbars, selects)
        // immediately render in the correct mode.
        document.documentElement.style.colorScheme = newIsDark ? 'dark' : 'light'

        // Sync theme-color meta for mobile browser chrome / PWA title bar.
        const themeColorMeta = document.querySelector('meta[name="theme-color"]')
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', newIsDark ? '#0f172a' : '#14b8a6')
        }

        if (!enableTransitions) return

        // Scoped transition: add class → paint → remove after 200 ms.
        // Avoids the global `* { transition }` anti-pattern which causes
        // expensive style recalculations on every hover/focus event.
        if (respectReducedMotion) {
          const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches
          if (prefersReducedMotion) return
        }

        document.documentElement.classList.add('is-switching-theme')
        setTimeout(() => {
          document.documentElement.classList.remove('is-switching-theme')
        }, 200)
      },
      { immediate: false },
    )
  }

  // Información del tema para debugging y desarrollo
  const themeInfo = computed(() => ({
    current: themeState.value.theme,
    effective: isDark.value ? 'dark' : 'light',
    system: isSystemDark.value ? 'dark' : 'light',
    storage: userTheme.value,
    timestamp: new Date().toISOString(),
  }))

  return {
    // Estado reactivo (readonly para prevenir mutaciones directas)
    isDark: readonly(isDark),
    themeState: readonly(themeState),
    themeInfo: readonly(themeInfo),

    // Funciones de control
    setTheme,
    toggleTheme,
    resetToSystem,

    // Funciones de sincronización con API
    loadThemeFromBackend,
    syncWithBackend,

    // Acceso directo a VueUse (para casos avanzados)
    toggleDark,
    preferredColorScheme,

    // Utilidades
    isSystemDark: readonly(isSystemDark),
    hasUserPreference: readonly(hasUserPreference),

    // Estado de API
    isApiSyncEnabled: enableApiSync,
    isAuthenticated: themeApi.isAuthenticated,
  }
}

// Composable simplificado para casos básicos
export function useSimpleTheme() {
  const { isDark, toggleTheme, themeState } = useTheme()

  return {
    isDark,
    toggleTheme,
    isDarkMode: isDark, // Alias para compatibilidad
    theme: computed(() => themeState.value.theme),
  }
}

// Hook para componentes que necesitan información del tema
export function useThemeAware() {
  const { isDark, themeState } = useTheme()

  return {
    isDark,
    isLight: computed(() => !isDark.value),
    theme: computed(() => themeState.value.theme),
    isSystemTheme: computed(() => themeState.value.theme === 'system'),
  }
}
