<template>
  <PageHeader
    title="Today"
    subtitle="Focus on what really matters"
    :actions="true"
    size="lg"
    :phase-data="phaseData"
    :phase-loading="phaseLoading"
  >
    <template #actions>
      <!-- Desktop: Botón normal -->
      <BaseButton
        variant="outline"
        @click="$emit('toggle-filters')"
        class="hidden sm:flex items-center space-x-2"
      >
        <Filter :size="16" />
        <span>Filters</span>
      </BaseButton>

      <!-- Mobile: Item del menú -->
      <BaseMenuItem
        :icon="Filter"
        label="Filtros"
        @click="$emit('toggle-filters')"
        class="sm:hidden"
      />
    </template>
  </PageHeader>
</template>

<script setup lang="ts">
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseMenuItem from '@ritmo/ui/components/molecules/navigation/BaseMenuItem.vue'
  import PageHeader from '@ritmo/ui/components/molecules/layout/PageHeader.vue'
  import { Filter } from 'lucide-vue-next'

  interface Props {
    phaseData?: any
    phaseLoading?: boolean
  }

  defineProps<Props>()

  interface Emits {
    (e: 'toggle-filters'): void
  }

  defineEmits<Emits>()
</script>
