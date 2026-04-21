<template>
  <div>
    <div class="qi-inner border border-outline bg-white/75 dark:bg-gray-800/75">
      <input
        ref="inputRef"
        v-model="value"
        type="text"
        class="qi-field text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
        placeholder="¿Qué necesitas hacer hoy?"
        :disabled="isLoading"
        maxlength="200"
        autocomplete="off"
        @keydown.enter.prevent="submit"
      />
      <button
        v-if="value.trim() && !isLoading"
        class="qi-btn"
        type="button"
        aria-label="Crear tarea"
        @click="submit"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="8" x2="13" y2="8" />
          <polyline points="9,4 13,8 9,12" />
        </svg>
      </button>
      <div v-else-if="isLoading" class="qi-spinner border-outline"></div>
    </div>
    <p class="mt-2 pl-1 text-xs text-gray-300 dark:text-gray-700">
      25 min · prioridad media por defecto · Enter para crear
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), { isLoading: false })

const emit = defineEmits<{
  'create-task': [name: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const value = ref('')

const submit = () => {
  if (!value.value.trim()) return
  emit('create-task', value.value.trim())
  value.value = ''
}

defineExpose({
  clear: () => {
    value.value = ''
  },
  focus: () => inputRef.value?.focus(),
})
</script>

<style scoped>
.qi-inner {
  display: flex;
  align-items: center;
  border-radius: 14px;
  padding: 0 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.qi-inner:focus-within {
  border-color: var(--ph, #0ea5e9) !important;
  box-shadow: 0 0 0 3px rgba(var(--ph-r, 14), var(--ph-g, 165), var(--ph-b, 233), 0.13);
}

.qi-field {
  flex: 1;
  padding: 0.9375rem 0;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 400;
  background: transparent;
  border: none;
  outline: none;
  caret-color: var(--ph, #0ea5e9);
}

.qi-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ph, #0ea5e9);
  color: white;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.1s ease;
}

.qi-btn:hover {
  opacity: 0.85;
}

.qi-btn:active {
  transform: scale(0.92);
}

.qi-btn svg {
  width: 14px;
  height: 14px;
}

.qi-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border-width: 2px;
  border-style: solid;
  border-top-color: var(--ph, #0ea5e9);
  border-radius: 50%;
  animation: qi-spin 0.65s linear infinite;
  flex-shrink: 0;
}

@keyframes qi-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
