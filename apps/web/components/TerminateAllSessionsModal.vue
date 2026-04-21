<template>
    <BaseModal :is-open="isOpen" title="Terminate All Other Sessions" :close-on-backdrop-click="false"
        :close-on-escape="true" size="md" @update:is-open="$emit('update:isOpen', $event)" @close="$emit('close')">
        <!-- Modal Content -->
        <div class="space-y-6">
            <!-- Warning Icon -->
            <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
                <ClientIcon name="alert-triangle" class="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <!-- Main Message -->
            <div class="text-center space-y-3">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Terminate All Other Sessions
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    This will log out all other devices and browsers except your current session.
                </p>
            </div>

            <!-- Session Count -->
            <div v-if="sessionCount > 0" class="text-center">
                <div class="inline-flex items-center px-4 py-2 bg-surface-raised rounded-lg">
                    <ClientIcon name="users" class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ sessionCount }} active session{{ sessionCount !== 1 ? 's' : '' }} will be terminated
                    </span>
                </div>
            </div>

            <!-- Current Session Info -->
            <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div class="flex items-start space-x-3">
                    <ClientIcon name="check-circle"
                        class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 class="text-sm font-medium text-green-800 dark:text-green-200">
                            Your Current Session Will Remain Active
                        </h4>
                        <p class="text-sm text-green-700 dark:text-green-300 mt-1">
                            You will stay logged in on this device. All other sessions will be terminated immediately.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Warning Messages -->
            <div class="space-y-3">
                <div
                    class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div class="flex items-start space-x-2">
                        <ClientIcon name="info"
                            class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <p class="text-sm text-amber-700 dark:text-amber-300">
                            <strong>Warning:</strong> This action cannot be undone. Users will need to log in again on
                            their devices.
                        </p>
                    </div>
                </div>

                <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div class="flex items-start space-x-2">
                        <ClientIcon name="alert-circle"
                            class="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p class="text-sm text-red-700 dark:text-red-300">
                            <strong>Data Loss:</strong> Any unsaved work on other devices may be lost. Make sure to save
                            your work before proceeding.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Confirmation Checkbox -->
            <div class="flex items-start space-x-3 p-3 bg-surface-raised/50 rounded-lg">
                <input id="confirm-terminate" v-model="confirmed" type="checkbox"
                    class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-outline-strong rounded"
                    :disabled="loading" />
                <label for="confirm-terminate" class="text-sm text-gray-700 dark:text-gray-300">
                    I understand that this will terminate all other sessions and cannot be undone.
                </label>
            </div>
        </div>

        <!-- Modal Footer -->
        <template #footer>
            <div class="flex items-center justify-end space-x-3">
                <BaseButton variant="secondary" size="sm" @click="$emit('close')" :disabled="loading">
                    Cancel
                </BaseButton>
                <BaseButton variant="error" size="sm" :loading="loading" loading-variant="dots" :disabled="!confirmed"
                    @click="handleConfirm">
                    {{ loading ? 'Terminating...' : 'Terminate All Sessions' }}
                </BaseButton>
            </div>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// UI Components
import ClientIcon from '@ritmo/ui/components/atoms/display/ClientIcon.vue'
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'

interface Props {
    isOpen: boolean
    sessionCount: number
    loading?: boolean
}

interface Emits {
    (e: 'update:isOpen', value: boolean): void
    (e: 'close'): void
    (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
})

const emit = defineEmits<Emits>()

// Local state
const confirmed = ref(false)

// Reset confirmation when modal closes
watch(() => props.isOpen, (isOpen) => {
    if (!isOpen) {
        confirmed.value = false
    }
})

const handleConfirm = () => {
    if (confirmed.value) {
        emit('confirm')
    }
}
</script>
