<script setup lang="ts">
  import type { Component } from 'vue'
  import ClientIcon from '../../atoms/display/ClientIcon.vue'

  export interface BottomNavItem {
    key: string
    label: string
    icon: Component
    path?: string
    isMore?: boolean
    isPrincipal?: boolean
  }

  interface BaseBottomNavProps {
    items: BottomNavItem[]
    activeKey?: string
    moreExpanded?: boolean
    moreControlsId?: string
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<BaseBottomNavProps>(), {
    activeKey: undefined,
    moreExpanded: false,
    moreControlsId: undefined,
    ariaLabel: 'Primary',
  })

  const emit = defineEmits<{
    navigate: [path: string]
    moreToggle: []
  }>()

  function isItemActive(item: BottomNavItem): boolean {
    if (item.isMore) {
      return props.moreExpanded || props.activeKey === item.key
    }
    return props.activeKey === item.key
  }

  function onItemClick(item: BottomNavItem) {
    if (item.isMore) {
      emit('moreToggle')
      return
    }
    if (item.path) {
      emit('navigate', item.path)
    }
  }

  function itemButtonClass(item: BottomNavItem): string {
    if (item.isPrincipal) {
      return isItemActive(item)
        ? 'text-white'
        : 'text-white/90 hover:text-white'
    }
    return isItemActive(item)
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/35 dark:text-primary-300'
      : 'text-secondary-500 hover:bg-secondary-100/70 hover:text-secondary-800 dark:text-secondary-400 dark:hover:bg-white/5 dark:hover:text-secondary-200'
  }
</script>

<template>
  <nav
    class="ritmo-bottom-nav fixed bottom-0 left-0 right-0 z-[9998]"
    role="navigation"
    :aria-label="ariaLabel"
  >
    <div
      class="ritmo-bottom-nav__bar mx-auto max-w-lg px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div
        class="relative flex items-end justify-between gap-1 rounded-2xl border border-outline/40 bg-surface/95 px-1.5 pb-1.5 pt-1.5 shadow-[0_-1px_0_rgb(0_0_0/0.03),0_8px_24px_-12px_rgb(0_0_0/0.18)] dark:border-white/10 dark:bg-secondary-900/90 dark:shadow-[0_-1px_0_rgb(255_255_255/0.04),0_12px_28px_-14px_rgb(0_0_0/0.55)]"
      >
        <button
          v-for="item in items"
          :key="item.key"
          type="button"
          class="group relative flex min-h-11 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-all duration-200 ease-out motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.97]"
          :class="[
            itemButtonClass(item),
            item.isPrincipal ? 'z-10 -mt-4 py-0' : 'py-1.5',
          ]"
          :aria-label="item.label"
          :aria-current="isItemActive(item) && !item.isMore ? 'page' : undefined"
          :aria-expanded="
            item.isMore ? (moreExpanded ? 'true' : 'false') : undefined
          "
          :aria-controls="item.isMore ? moreControlsId : undefined"
          @click="onItemClick(item)"
        >
          <span
            v-if="item.isPrincipal"
            class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 shadow-[0_8px_20px_-6px_rgb(13_148_136/0.65)] ring-4 ring-canvas transition-transform duration-200 ease-out dark:bg-primary-500 dark:shadow-[0_8px_22px_-6px_rgb(45_212_191/0.45)]"
            :class="
              isItemActive(item) ? 'scale-105 ring-primary-100/80 dark:ring-primary-900/50' : ''
            "
          >
            <ClientIcon :icon="item.icon" :size="22" />
          </span>
          <template v-else>
            <ClientIcon :icon="item.icon" :size="20" />
          </template>

          <span
            class="max-w-full truncate text-[10px] leading-tight tracking-wide"
            :class="[
              item.isPrincipal
                ? isItemActive(item)
                  ? 'mt-1 font-semibold text-primary-700 dark:text-primary-300'
                  : 'mt-1 font-medium text-secondary-600 dark:text-secondary-300'
                : isItemActive(item)
                  ? 'font-semibold'
                  : 'font-medium',
            ]"
          >
            {{ item.label }}
          </span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
  .ritmo-bottom-nav {
    background: linear-gradient(to top, var(--color-canvas) 55%, transparent);
    pointer-events: none;
  }

  .ritmo-bottom-nav__bar {
    pointer-events: auto;
  }
</style>
