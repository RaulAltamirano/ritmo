<script setup lang="ts">
import { MoreVertical } from 'lucide-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';
import BaseButton from '../../atoms/interactive/BaseButton.vue';

interface BaseActionMenuProps {
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<BaseActionMenuProps>(), {
  defaultOpen: false,
})

const emit = defineEmits<{
  'menu-toggle': [isOpen: boolean]
}>()

const isOpen = ref(props.defaultOpen)
const rootRef = ref(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  emit('menu-toggle', isOpen.value)
}

const closeMenu = () => {
  isOpen.value = false
  emit('menu-toggle', false)
}

// Cerrar menú con Escape
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeMenu()
  }
}

// Cerrar menú al hacer click fuera
const handleClickOutside = (event) => {
  const target = event.target
  if (!target || !rootRef.value) return
  if (
    isOpen.value &&
    target instanceof globalThis.Element &&
    !rootRef.value.contains(target)
  ) {
    closeMenu()
  }
}

onMounted(() => {
  globalThis.document.addEventListener('keydown', handleKeyDown)
  globalThis.document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  globalThis.document.removeEventListener('keydown', handleKeyDown)
  globalThis.document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="rootRef" class="relative">
    <!-- Botón de menú (3 puntos) -->
    <BaseButton variant="ghost" size="sm" :icon="MoreVertical" @click="toggleMenu" class="sm:hidden"
      aria-label="Menú de acciones" :aria-expanded="isOpen" aria-haspopup="menu" />

    <!-- Menú desplegable -->
    <div v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-lg border border-outline z-50 sm:hidden"
      role="menu" aria-orientation="vertical">
      <div class="py-1">
        <slot name="actions" />
      </div>
    </div>

    <!-- Overlay para cerrar el menú -->
    <div v-if="isOpen" class="fixed inset-0 z-40 sm:hidden" @click="closeMenu" aria-hidden="true" />
  </div>
</template>
