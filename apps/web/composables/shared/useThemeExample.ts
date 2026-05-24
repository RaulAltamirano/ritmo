/**
 * 🎨 THEME INTEGRATION EXAMPLE - RITMO 2025
 *
 * Ejemplo de cómo usar useTheme con sincronización de API
 * Este archivo muestra las mejores prácticas de integración
 */

import { useTheme } from '@/composables/shared'

// Ejemplo 1: Uso básico con sincronización automática
export function useBasicThemeWithSync() {
  const {
    isDark,
    setTheme,
    toggleTheme,
    loadThemeFromBackend,
    syncWithBackend,
    isAuthenticated,
    isApiSyncEnabled,
  } = useTheme({
    enableApiSync: true, // Habilitar sincronización con API
    autoSyncOnChange: true, // Auto-sincronizar al cambiar tema
    respectSystemPreference: true,
    enableTransitions: true,
  })

  return {
    isDark,
    setTheme,
    toggleTheme,
    loadThemeFromBackend,
    syncWithBackend,
    isAuthenticated,
    isApiSyncEnabled,
  }
}

// Ejemplo 2: Uso avanzado con control manual
export function useAdvancedThemeWithSync() {
  const theme = useTheme({
    enableApiSync: true,
    autoSyncOnChange: false, // Control manual de sincronización
    respectSystemPreference: true,
    enableTransitions: true,
  })

  // Función para cambiar tema y sincronizar manualmente
  const changeThemeAndSync = async (newTheme: 'light' | 'dark' | 'system') => {
    await theme.setTheme(newTheme)

    if (theme.isAuthenticated.value) {
      const synced = await theme.syncWithBackend()
      if (!synced) {
        console.warn('Failed to sync theme with backend')
      }
    }
  }

  // Función para inicializar tema desde backend
  const initializeTheme = async () => {
    if (theme.isAuthenticated.value) {
      const loaded = await theme.loadThemeFromBackend()
      if (loaded) {
        console.log('Theme loaded from backend')
      }
    }
  }

  return {
    ...theme,
    changeThemeAndSync,
    initializeTheme,
  }
}

// Ejemplo 3: Uso solo local (sin API)
export function useLocalThemeOnly() {
  return useTheme({
    enableApiSync: false, // Deshabilitar sincronización con API
    respectSystemPreference: true,
    enableTransitions: true,
  })
}

// Ejemplo 4: Hook para componentes que necesitan sincronización
export function useThemeWithAutoSync() {
  const theme = useTheme({
    enableApiSync: true,
    autoSyncOnChange: true,
  })

  // Auto-cargar tema desde backend al montar
  onMounted(async () => {
    if (theme.isAuthenticated.value) {
      await theme.loadThemeFromBackend()
    }
  })

  return theme
}
