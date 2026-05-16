import { defineStore } from 'pinia'

/** UX cuando el servidor marcó abandoned sin reflexión (job §8.4). */
export const useWorkSessionRecoveryStore = defineStore('workSessionRecovery', {
  state: () => ({
    showServerAbandonedBanner: false,
  }),
  actions: {
    openServerAbandonedBanner() {
      this.showServerAbandonedBanner = true
    },
    dismissServerAbandonedBanner() {
      this.showServerAbandonedBanner = false
    },
  },
})
