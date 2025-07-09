import { defineStore } from 'pinia'
import { useFetch } from '#app'
import { useRouter } from 'vue-router'
import type { ApiResponse } from '~/types/api'

interface LoginResponse {
  token: string
}

interface User {
  id: string
  email: string
  name: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getCurrentUser: (state) => state.user
  },

  actions: {
    async login(email: string, password: string): Promise<ApiResponse<LoginResponse | null>> {
      try {
        const { data } = await useFetch<LoginResponse>('/auth/login', {
          method: 'POST',
          body: { email, password }
        })

        if (data.value) {
          this.token = data.value.token
          const router = useRouter()
          router.push('/profile')
          return { success: true, data: data.value }
        }

        return { success: false, data: null }
      } catch (error) {
        return { success: false, data: null }
      }
    },

    logout() {
      this.token = null
      this.user = null
      const router = useRouter()
      router.push('/login')
    },

    async fetchUser(): Promise<ApiResponse<User | null>> {
      if (!this.token) return {
        data: null,
        error: new Error('No token available'),
        pending: false
      }

      try {
        const { data } = await useFetch<User>('/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        if (!data.value) {
          this.logout()
          return {
            data: null,
            error: new Error('No user data returned'),
            pending: false
          }
        }

        this.user = data.value
        return {
          data: data.value,
          error: null,
          pending: false
        }
      } catch (error) {
        console.error('Fetch user error:', error)
        this.logout()
        return {
          data: null,
          error: error as Error,
          pending: false
        }
      }
    }
  }
})