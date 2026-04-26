<script setup lang="ts">
  import BaseSkeleton from '../../atoms/layout/BaseSkeleton.vue'

  interface SessionSkeletonProps {
    count?: number
  }

  const props = withDefaults(defineProps<SessionSkeletonProps>(), {
    count: 3,
  })
</script>

<template>
  <div class="space-y-4">
    <!-- Session skeleton items -->
    <div
      v-for="n in count"
      :key="n"
      class="group relative bg-surface border border-outline rounded-xl p-4"
    >
      <div class="flex items-start justify-between">
        <!-- Device Info Skeleton -->
        <div class="flex items-start space-x-3 flex-1">
          <!-- Device Icon Skeleton -->
          <BaseSkeleton
            variant="circular"
            size="lg"
            :width="48"
            :height="48"
            rounded="lg"
            aria-label="Loading device icon"
          />

          <div class="flex-1 min-w-0">
            <!-- Device Name Skeleton -->
            <div class="flex items-center space-x-2 mb-1">
              <BaseSkeleton
                variant="text"
                size="md"
                :width="120"
                aria-label="Loading device name"
              />
              <!-- Status Dot Skeleton -->
              <BaseSkeleton
                variant="circular"
                size="xs"
                :width="8"
                :height="8"
                aria-label="Loading status"
              />
            </div>

            <!-- Browser Info Skeleton -->
            <BaseSkeleton
              variant="text"
              size="sm"
              :width="160"
              class="mb-2"
              aria-label="Loading browser info"
            />

            <!-- Session Details Grid Skeleton -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Location Skeleton -->
              <div class="flex items-center space-x-1">
                <BaseSkeleton
                  variant="circular"
                  size="xs"
                  :width="12"
                  :height="12"
                  aria-label="Loading location icon"
                />
                <BaseSkeleton
                  variant="text"
                  size="xs"
                  :width="80"
                  aria-label="Loading location"
                />
              </div>

              <!-- Time Skeleton -->
              <div class="flex items-center space-x-1">
                <BaseSkeleton
                  variant="circular"
                  size="xs"
                  :width="12"
                  :height="12"
                  aria-label="Loading time icon"
                />
                <BaseSkeleton
                  variant="text"
                  size="xs"
                  :width="60"
                  aria-label="Loading time"
                />
              </div>

              <!-- Status Badge Skeleton -->
              <div class="flex items-center space-x-1">
                <BaseSkeleton
                  variant="circular"
                  size="xs"
                  :width="12"
                  :height="12"
                  aria-label="Loading activity icon"
                />
                <BaseSkeleton
                  variant="rectangular"
                  size="xs"
                  :width="50"
                  :height="16"
                  rounded="full"
                  aria-label="Loading status badge"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button Skeleton -->
        <div class="flex items-center ml-4">
          <BaseSkeleton
            variant="circular"
            size="sm"
            :width="32"
            :height="32"
            aria-label="Loading action button"
          />
        </div>
      </div>
    </div>
  </div>
</template>
