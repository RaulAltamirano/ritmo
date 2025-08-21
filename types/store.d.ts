import { defineStore, StoreDefinition } from 'pinia'
import type { User } from '../types/api'

export interface AuthState {
  user: User | null
  token: string | null
}

export type AuthStore = ReturnType<typeof useAuthStore>

export const useAuthStore: StoreDefinition<'auth', AuthState, any, any>
