/**
 * 🎨 THEME API COMPOSABLE - RITMO 2025
 *
 * Composable para sincronizar preferencias de tema con el backend
 * Integra useTheme con useHttpClient para persistencia en servidor
 */

import { useAuth } from '../auth/useAuth'
import { useHttpClient } from './useHttpClient'

export interface TimerPresetsWire {
  defaultPresetKey?: string
  presets: Array<{
    key: string
    workSec: number
    breakSec: number
    label?: string
  }>
}

export interface ThemePreferences {
  theme: 'light' | 'dark' | 'system'
  timezone?: string
  language?: string
  timerPresets?: TimerPresetsWire
}

export interface UserPreferencesResponse {
  preferences: {
    theme: 'light' | 'dark' | 'system'
    timezone: string
    language: string
    timerPresets?: TimerPresetsWire
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends'
      showEmail: boolean
      showLastSeen: boolean
    }
  }
}

export function useThemeApi() {
  const httpClient = useHttpClient()
  const { isAuthenticated } = useAuth()

  /**
   * Obtiene las preferencias del usuario desde el backend
   */
  const getUserPreferences = async (): Promise<UserPreferencesResponse | null> => {
    if (!isAuthenticated.value) {
      return null
    }

    try {
      const response =
        await httpClient.get<UserPreferencesResponse>('/users/preferences')
      return await httpClient.extractData(response)
    } catch (error) {
      console.warn('Failed to fetch user preferences:', error)
      return null
    }
  }

  /**
   * Actualiza las preferencias del usuario en el backend
   */
  const updateUserPreferences = async (
    preferences: Partial<ThemePreferences>,
  ): Promise<UserPreferencesResponse | null> => {
    if (!isAuthenticated.value) {
      return null
    }

    try {
      const response = await httpClient.put<UserPreferencesResponse>(
        '/users/preferences',
        preferences,
      )
      return await httpClient.extractData(response)
    } catch (error) {
      console.error('Failed to update user preferences:', error)
      throw error
    }
  }

  /**
   * Actualiza específicamente el tema del usuario
   */
  const updateTheme = async (
    theme: 'light' | 'dark' | 'system',
  ): Promise<UserPreferencesResponse | null> => {
    if (!isAuthenticated.value) {
      return null
    }

    try {
      const response = await httpClient.put<UserPreferencesResponse>(
        '/users/preferences/theme',
        { theme },
      )
      return await httpClient.extractData(response)
    } catch (error) {
      console.error('Failed to update theme:', error)
      throw error
    }
  }

  /**
   * Sincroniza el tema local con el backend
   */
  const syncThemeWithBackend = async (
    localTheme: 'light' | 'dark' | 'system',
  ): Promise<'light' | 'dark' | 'system' | null> => {
    if (!isAuthenticated.value) {
      return null
    }

    try {
      // El tema ya está en el formato correcto para el backend
      const backendTheme = localTheme

      const response = await updateTheme(backendTheme)
      return response?.preferences.theme ?? null
    } catch (error) {
      console.warn('Failed to sync theme with backend:', error)
      return null
    }
  }

  /**
   * Obtiene el tema desde el backend y lo mapea al formato local
   */
  const getThemeFromBackend = async (): Promise<'light' | 'dark' | 'system' | null> => {
    if (!isAuthenticated.value) {
      return null
    }

    try {
      const response = await getUserPreferences()
      if (!response?.preferences.theme) {
        return null
      }

      // El tema del backend ya está en el formato correcto
      return response.preferences.theme
    } catch (error) {
      console.warn('Failed to get theme from backend:', error)
      return null
    }
  }

  return {
    getUserPreferences,
    updateUserPreferences,
    updateTheme,
    syncThemeWithBackend,
    getThemeFromBackend,
    isAuthenticated,
  }
}
