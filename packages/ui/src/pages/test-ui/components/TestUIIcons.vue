<script setup lang="ts">
  import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    Bell,
    CheckCircle,
    Info,
    Star,
  } from 'lucide-vue-next'
  import BaseAlert from '../../../components/atoms/BaseAlert.vue'
  import BaseBadge from '../../../components/atoms/BaseBadge.vue'
  import BaseIcon from '../../../components/atoms/BaseIcon.vue'
</script>

<template>
  <div id="icons" class="p-6 space-y-8">
    <h2 class="text-2xl font-bold mb-6">Test de Iconos - BaseAlert y BaseBadge</h2>

    <!-- Test BaseAlert con iconos -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">BaseAlert con Iconos</h3>

      <BaseAlert
        variant="info"
        title="Alerta Informativa"
        message="Esta alerta debe mostrar un icono de información"
        show-icon
        dismissible
      />

      <BaseAlert
        variant="success"
        title="Alerta de Éxito"
        message="Esta alerta debe mostrar un icono de check"
        show-icon
        dismissible
      />

      <BaseAlert
        variant="warning"
        title="Alerta de Advertencia"
        message="Esta alerta debe mostrar un icono de triángulo"
        show-icon
        dismissible
      />

      <BaseAlert
        variant="error"
        title="Alerta de Error"
        message="Esta alerta debe mostrar un icono de círculo"
        show-icon
        dismissible
      />
    </div>

    <!-- Test BaseBadge con iconos -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">BaseBadge con Iconos</h3>

      <div class="flex flex-wrap gap-4">
        <BaseBadge
          variant="primary"
          content="Primary"
          :icon="Star"
          icon-position="left"
        />

        <BaseBadge
          variant="success"
          content="Success"
          :icon="CheckCircle"
          icon-position="left"
        />

        <BaseBadge
          variant="warning"
          content="Warning"
          :icon="AlertTriangle"
          icon-position="left"
        />

        <BaseBadge
          variant="error"
          content="Error"
          :icon="AlertCircle"
          icon-position="left"
        />

        <BaseBadge variant="info" content="Info" :icon="Info" icon-position="left" />
      </div>

      <div class="flex flex-wrap gap-4">
        <BaseBadge
          variant="primary"
          content="Right Icon"
          :icon="ArrowRight"
          icon-position="right"
        />

        <BaseBadge variant="secondary" content="Loading" loading />

        <BaseBadge variant="neutral" content="With Count" :icon="Bell" :count="5" />
      </div>
    </div>

    <!-- Test BaseIcon standalone -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">BaseIcon Standalone</h3>

      <div class="flex flex-wrap gap-4 items-center">
        <BaseIcon :icon="Star" size="sm" color="primary" />
        <BaseIcon :icon="CheckCircle" size="md" color="success" />
        <BaseIcon :icon="AlertTriangle" size="lg" color="warning" />
        <BaseIcon :icon="AlertCircle" size="xl" color="error" />
        <BaseIcon :icon="Info" size="2xl" color="info" />
      </div>
    </div>
  </div>
</template>
