import { StoreDefinition } from 'pinia'
import type { AuthUser } from './auth'

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// This file is now deprecated - use the actual store directly
// export type AuthStore = ReturnType<typeof useAuthStore>
// export const useAuthStore: StoreDefinition<'auth', AuthState, any, any>
