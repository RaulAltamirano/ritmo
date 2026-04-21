<template>
    <BaseModal :is-open="isOpen" title="Terminate Session" :close-on-backdrop-click="false" :close-on-escape="true"
        size="sm" @update:is-open="$emit('update:isOpen', $event)" @close="$emit('close')">
        <!-- Modal Content -->
        <div class="space-y-4">
            <!-- Warning Icon -->
            <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
                <ClientIcon name="alert-triangle" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>

            <!-- Session Info -->
            <div v-if="session" class="text-center space-y-2">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Terminate Session
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to terminate this session?
                </p>

                <!-- Session Details -->
                <div class="mt-4 p-3 bg-surface-raised/50 rounded-lg text-left">
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center space-x-2">
                            <ClientIcon name="monitor" class="w-4 h-4 text-gray-400" />
                            <span class="text-gray-600 dark:text-gray-300">
                                <strong>Device:</strong> {{ getDeviceName(session) }}
                            </span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <ClientIcon name="globe" class="w-4 h-4 text-gray-400" />
                            <span class="text-gray-600 dark:text-gray-300">
                                <strong>Browser:</strong> {{ getBrowserInfo(session) }}
                            </span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <ClientIcon name="clock" class="w-4 h-4 text-gray-400" />
                            <span class="text-gray-600 dark:text-gray-300">
                                <strong>Last Active:</strong> {{ formatLastAccess(session) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Warning Message -->
            <div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div class="flex items-start space-x-2">
                    <ClientIcon name="info" class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p class="text-sm text-amber-700 dark:text-amber-300">
                        This action will immediately log out the user from this device. Any unsaved work may be lost.
                    </p>
                </div>
            </div>
        </div>

        <!-- Modal Footer -->
        <template #footer>
            <div class="flex items-center justify-end space-x-3">
                <BaseButton variant="secondary" size="sm" @click="$emit('close')" :disabled="loading">
                    Cancel
                </BaseButton>
                <BaseButton variant="error" size="sm" :loading="loading" loading-variant="dots" @click="handleConfirm">
                    {{ loading ? 'Terminating...' : 'Terminate Session' }}
                </BaseButton>
            </div>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
import type { UserSession } from '@/types/session'

// UI Components
import ClientIcon from '@ritmo/ui/components/atoms/display/ClientIcon.vue'
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'

interface Props {
    isOpen: boolean
    session: UserSession | null
    loading?: boolean
}

interface Emits {
    (e: 'update:isOpen', value: boolean): void
    (e: 'close'): void
    (e: 'confirm', sessionId: string): void
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
})

const emit = defineEmits<Emits>()

// Helper functions (same as in sessions.vue)
const getDeviceName = (session: UserSession): string => {
    if (session.deviceName) return session.deviceName
    if (session.deviceType) return session.deviceType
    return 'Unknown Device'
}

const getBrowserInfo = (session: UserSession): string => {
    if (session.browser && session.os) {
        return `${session.browser} on ${session.os}`
    }
    if (session.browser) return session.browser
    if (session.os) return session.os
    return 'Unknown Browser'
}

const formatLastAccess = (session: UserSession): string => {
    if (session.lastActivity) {
        const date = new Date(session.lastActivity)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
        return date.toLocaleDateString()
    }
    return 'Unknown'
}

const handleConfirm = () => {
    if (props.session) {
        emit('confirm', props.session.id)
    }
}
</script>
