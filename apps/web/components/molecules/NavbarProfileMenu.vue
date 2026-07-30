<template>
  <div class="relative">
    <button
      type="button"
      class="flex min-h-11 cursor-pointer items-center gap-2 rounded-full p-1.5 pr-2.5 text-secondary-600 transition-colors duration-200 hover:bg-secondary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 focus-visible:ring-offset-2 dark:text-secondary-300 dark:hover:bg-white/10 sm:pr-3"
      aria-label="Profile menu"
      :aria-expanded="open ? 'true' : 'false'"
      @click="emit('toggle')"
    >
      <div
        class="relative size-8 shrink-0 overflow-hidden rounded-full"
      >
        <img
          v-if="ready"
          :src="avatar"
          :alt="displayName"
          class="absolute inset-0 block size-full object-cover"
          @error="emit('avatar-error', $event)"
        />
        <div
          v-else
          class="absolute inset-0 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600"
        />
      </div>
      <span class="hidden text-sm font-medium sm:block">
        <span v-if="ready">{{ navbarName }}</span>
        <span
          v-else
          class="inline-block h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600"
        />
      </span>
      <ChevronDown
        :size="12"
        class="transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-outline/50 bg-surface py-1.5 shadow-[0_12px_40px_-16px_rgb(0_0_0/0.35)] dark:border-white/10 dark:bg-secondary-900"
    >
      <div class="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="relative size-10 shrink-0 overflow-hidden rounded-full">
            <img
              v-if="ready"
              :src="avatar"
              :alt="displayName"
              class="absolute inset-0 block size-full object-cover"
              @error="emit('avatar-error', $event)"
            />
            <div
              v-else
              class="absolute inset-0 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              <span v-if="ready">{{ displayName }}</span>
              <span
                v-else
                class="inline-block h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-600"
              />
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              <span v-if="ready">{{ email }}</span>
              <span
                v-else
                class="inline-block h-3 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-600"
              />
            </p>
          </div>
        </div>
      </div>

      <div class="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Moon :size="14" class="text-gray-500 dark:text-gray-400" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Tema</span>
          </div>
          <button
            type="button"
            class="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            :class="isDark ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="emit('toggle-theme')"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="isDark ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>

      <div class="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Clock :size="14" class="text-gray-500 dark:text-gray-400" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Floating Timer</span>
          </div>
          <button
            type="button"
            class="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            :class="
              floatingTimer ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            "
            :aria-label="
              floatingTimer ? 'Hide floating timer' : 'Show floating timer'
            "
            @click="emit('toggle-timer')"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="floatingTimer ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>

      <NuxtLink
        :to="profilePath"
        class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
        @click="emit('close')"
      >
        <User :size="16" />
        <span>My Profile</span>
      </NuxtLink>

      <NuxtLink
        :to="settingsPath"
        class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
        @click="emit('close')"
      >
        <Settings :size="16" />
        <span>Settings</span>
      </NuxtLink>

      <div class="my-1 border-t border-gray-100 dark:border-gray-700" />

      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-sm text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-300"
        @click="emit('end-day')"
      >
        <Flag :size="16" />
        <span>End Day</span>
      </button>

      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        @click="emit('logout')"
      >
        <LogOut :size="16" />
        <span>Sign Out</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    ChevronDown,
    Clock,
    Flag,
    LogOut,
    Moon,
    Settings,
    User,
  } from 'lucide-vue-next'

  defineProps<{
    open: boolean
    ready: boolean
    avatar: string
    displayName: string
    navbarName: string
    email: string
    isDark: boolean
    floatingTimer: boolean
    profilePath: string
    settingsPath: string
  }>()

  const emit = defineEmits<{
    toggle: []
    close: []
    'toggle-theme': []
    'toggle-timer': []
    'end-day': []
    logout: []
    'avatar-error': [event: Event]
  }>()
</script>
