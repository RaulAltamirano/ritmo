<template>
  <BaseBadge :variant="badgeVariant" size="xs" :left-icon="icon">
    {{ label }}
  </BaseBadge>
</template>

<script setup lang="ts">
  import BaseBadge from '@ritmo/ui/components/atoms/feedback/BaseBadge.vue'
  import { FileText, Image, Lightbulb, Music, Star, Trophy } from 'lucide-vue-next'
  import { computed } from 'vue'

  interface Props {
    type: string
  }

  const props = defineProps<Props>()

  type SoftVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral'
    | 'subtle'

  const typeConfig: Record<
    string,
    { label: string; icon: typeof FileText; variant: SoftVariant }
  > = {
    technique: { label: 'Técnica', icon: Lightbulb, variant: 'info' },
    music: { label: 'Música', icon: Music, variant: 'primary' },
    image: { label: 'Imagen', icon: Image, variant: 'success' },
    trophy: { label: 'Trofeo', icon: Trophy, variant: 'warning' },
    review: { label: 'Reseña', icon: Star, variant: 'warning' },
    article: { label: 'Artículo', icon: FileText, variant: 'subtle' },
  }

  const config = computed(() => typeConfig[props.type] ?? typeConfig.article)
  const label = computed(() => config.value.label)
  const icon = computed(() => config.value.icon)
  const badgeVariant = computed(() => config.value.variant)
</script>
