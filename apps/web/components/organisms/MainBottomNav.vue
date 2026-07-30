<template>
  <div>
    <BaseBottomNav
      :items="PRIMARY_BOTTOM_TABS"
      :active-key="activeKey"
      :more-expanded="showMore"
      :more-controls-id="MORE_SHEET_ID"
      aria-label="Primary"
      @navigate="onNavigate"
      @more-toggle="toggleMore"
    />

    <BaseBottomSheet
      v-model:open="showMore"
      :id="MORE_SHEET_ID"
      title="More"
    >
      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in MORE_NAV_ITEMS"
          :key="item.key"
          :to="item.path"
          class="group flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 active:scale-[0.99]"
          :class="
            currentPath === item.path
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              : 'text-secondary-700 hover:bg-secondary-100/80 dark:text-secondary-200 dark:hover:bg-white/5'
          "
          :aria-current="currentPath === item.path ? 'page' : undefined"
          @click="closeMore"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200"
            :class="
              currentPath === item.path
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-800/50 dark:text-primary-200'
                : 'bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200/80 dark:bg-white/5 dark:text-secondary-300'
            "
          >
            <component :is="item.icon" :size="18" aria-hidden="true" />
          </span>
          <span class="font-medium tracking-tight">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </BaseBottomSheet>

    <div
      class="h-[calc(4.75rem+env(safe-area-inset-bottom,0px))]"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
  import {
    MORE_NAV_ITEMS,
    MORE_SHEET_ID,
    PRIMARY_BOTTOM_TABS,
    resolveBottomActiveKey,
  } from '@/utils/navItems'
  import BaseBottomNav from '@ritmo/ui/components/organisms/navigation/BaseBottomNav.vue'
  import BaseBottomSheet from '@ritmo/ui/components/organisms/navigation/BaseBottomSheet.vue'
  import { navigateTo, useRoute } from 'nuxt/app'
  import { computed, ref, watch } from 'vue'

  const route = useRoute()
  const showMore = ref(false)

  const currentPath = computed(() => route?.path ?? '/')
  const activeKey = computed(() => resolveBottomActiveKey(currentPath.value))

  const closeMore = () => {
    showMore.value = false
  }

  const toggleMore = () => {
    showMore.value = !showMore.value
  }

  const onNavigate = async (path: string) => {
    closeMore()
    if (path !== currentPath.value) {
      await navigateTo(path)
    }
  }

  watch(
    () => route?.path,
    () => {
      closeMore()
    },
  )
</script>
