<script setup lang="ts">
  import BaseButton from '@/components/atoms/interactive/BaseButton.vue'
  import { Check } from 'lucide-vue-next'
  import { ref } from 'vue'

  const clickVisible = ref(false)
  const pointerVisible = ref(false)

  function showClick() {
    clickVisible.value = true
  }

  function showPointer() {
    pointerVisible.value = true
  }

  const loading = ref(false)
  function toggleLoading() {
    loading.value = true
    window.setTimeout(() => {
      loading.value = false
    }, 500)
  }
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-10 pb-24">
    <h1 class="text-lg font-semibold">BaseButton — e2e</h1>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Loading</h2>
      <BaseButton
        data-testid="loading-button"
        :loading="loading"
        @click="toggleLoading"
      >
        Load
      </BaseButton>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Accessible (busy)</h2>
      <BaseButton
        data-testid="accessible-button"
        loading
        aria-label="Submit form button"
      >
        Saving
      </BaseButton>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Keyboard</h2>
      <BaseButton data-testid="keyboard-button" @click="showClick">Keyboard</BaseButton>
      <div v-if="clickVisible" data-testid="click-event" class="text-sm text-green-600">
        click handled
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Pointer</h2>
      <BaseButton
        data-testid="pointer-button"
        @pointer-down="showPointer"
        @pointer-up="showPointer"
      >
        Pointer
      </BaseButton>
      <div
        v-if="pointerVisible"
        data-testid="pointer-event"
        class="text-sm text-green-600"
      >
        pointer handled
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Toggle</h2>
      <BaseButton data-testid="toggle-button" :pressed="false" class="toggle-proxy">
        Toggle
      </BaseButton>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Expand</h2>
      <BaseButton data-testid="expand-button" :expanded="false">Expand</BaseButton>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Focus styles</h2>
      <BaseButton data-testid="focus-button">Focus me</BaseButton>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Disabled</h2>
      <BaseButton data-testid="disabled-button" disabled @click="showClick"
        >Disabled</BaseButton
      >
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Icon</h2>
      <BaseButton data-testid="icon-button" :icon="Check" icon-only aria-label="Save" />
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Full width</h2>
      <BaseButton data-testid="full-width-button" full-width>Wide</BaseButton>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Variants</h2>
      <div class="flex flex-wrap gap-2">
        <BaseButton data-testid="primary-button" variant="primary">Primary</BaseButton>
        <BaseButton data-testid="secondary-button" variant="secondary"
          >Secondary</BaseButton
        >
        <BaseButton data-testid="success-button" variant="success">Success</BaseButton>
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Sizes</h2>
      <div class="flex flex-wrap items-center gap-2">
        <BaseButton data-testid="small-button" size="sm">Small</BaseButton>
        <BaseButton data-testid="medium-button" size="md">Medium</BaseButton>
        <BaseButton data-testid="large-button" size="lg">Large</BaseButton>
      </div>
    </section>

    <section class="space-y-2">
      <p id="wcag-button-desc" class="sr-only">Extra instructions for this control.</p>
      <h2 class="text-sm font-medium text-gray-500">WCAG</h2>
      <BaseButton
        data-testid="wcag-button"
        disabled
        loading
        aria-label="WCAG sample"
        aria-describedby="wcag-button-desc"
      >
        WCAG
      </BaseButton>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Contrast</h2>
      <BaseButton data-testid="contrast-button" variant="outline">Contrast</BaseButton>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-medium text-gray-500">Motion</h2>
      <BaseButton data-testid="motion-button" variant="primary">Motion</BaseButton>
    </section>
  </div>
</template>
