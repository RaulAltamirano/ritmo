/**
 * 🎨 THEME PLUGIN - RITMO 2025
 *
 * Plugin centralizado para gestión de tema
 * Evita múltiples inicializaciones y conflictos
 */

import { useTheme } from '@/composables/shared'

export default defineNuxtPlugin(() => {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') {
    return {
      provide: {
        theme: {
          isDark: { value: false },
          themeState: {
            value: {
              theme: 'system',
              isDark: false,
              isSystemDark: false,
              hasUserPreference: false,
            },
          },
          themeInfo: {
            value: {
              current: 'system',
              effective: 'light',
              system: 'light',
              storage: 'system',
              timestamp: new Date().toISOString(),
            },
          },
          setTheme: () => {},
          toggleTheme: () => {},
          resetToSystem: () => {},
          loadThemeFromBackend: () => Promise.resolve(false),
          syncWithBackend: () => Promise.resolve(false),
          isSystemDark: { value: false },
          hasUserPreference: { value: false },
          isApiSyncEnabled: false,
          isAuthenticated: { value: false },
        },
      },
    }
  }

  // Inicializar tema una sola vez a nivel global
  const theme = useTheme({
    storageKey: 'theme',
    respectSystemPreference: true,
    enableTransitions: true,
    respectReducedMotion: true,
    enableApiSync: false, // Desactivar sincronización automática
    autoSyncOnChange: false,
  })

  // Proporcionar el tema globalmente
  return {
    provide: {
      theme: {
        isDark: theme.isDark,
        themeState: theme.themeState,
        themeInfo: theme.themeInfo,
        setTheme: theme.setTheme,
        toggleTheme: theme.toggleTheme,
        resetToSystem: theme.resetToSystem,
        loadThemeFromBackend: theme.loadThemeFromBackend,
        syncWithBackend: theme.syncWithBackend,
        isSystemDark: theme.isSystemDark,
        hasUserPreference: theme.hasUserPreference,
        isApiSyncEnabled: theme.isApiSyncEnabled,
        isAuthenticated: theme.isAuthenticated,
      },
    },
  }
})
