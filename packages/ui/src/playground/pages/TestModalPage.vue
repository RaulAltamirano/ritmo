<script setup lang="ts">
  import BaseModal from '@/components/atoms/interactive/BaseModal.vue'
  import { ref, watch } from 'vue'

  const isOpen = ref(false)
  const liveMessage = ref('')
  const descriptionId = 'e2e-modal-description'

  watch(isOpen, open => {
    liveMessage.value = open ? 'Modal opened' : 'Modal closed'
  })
</script>

<template>
  <div class="mx-auto max-w-xl space-y-4">
    <h1 class="text-lg font-semibold">BaseModal — e2e</h1>

    <p :id="descriptionId" class="sr-only">
      Supporting description for the modal dialog used in automated accessibility tests.
    </p>

    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
      data-testid="modal-announcements"
    >
      {{ liveMessage }}
    </div>

    <button type="button" data-testid="open-modal" @click="isOpen = true">
      Open modal
    </button>

    <BaseModal
      v-model:is-open="isOpen"
      title="Test modal"
      :aria-describedby="descriptionId"
      close-button-label="Close dialog"
      @close="isOpen = false"
    >
      <div class="flex flex-col gap-3">
        <button type="button" data-testid="modal-first-focus">First action</button>
        <button type="button" data-testid="modal-second-focus">Second action</button>
      </div>
    </BaseModal>
  </div>
</template>
