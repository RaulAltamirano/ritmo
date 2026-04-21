<script setup lang="ts">
import BaseSkeleton from '../../atoms/layout/BaseSkeleton.vue'

interface ListSkeletonProps {
    count?: number
    variant?: 'default' | 'minimal'
    showIcon?: boolean
    showStatus?: boolean
    showSubtitle?: boolean
    showDetails?: boolean
    showAction?: boolean
    iconSize?: number
    iconRounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
    titleWidth?: number
    subtitleWidth?: number
    detailsColumns?: 1 | 2 | 3
    detailWidth?: number
}

const props = withDefaults(defineProps<ListSkeletonProps>(), {
    count: 3,
    variant: 'default',
    showIcon: true,
    showStatus: false,
    showSubtitle: true,
    showDetails: false,
    showAction: true,
    iconSize: 48,
    iconRounded: 'lg',
    titleWidth: 120,
    subtitleWidth: 160,
    detailsColumns: 3,
    detailWidth: 80,
})
</script>

<template>
    <div class="space-y-4">
        <!-- List skeleton items -->
        <div v-for="n in count" :key="n" class="group relative bg-surface border border-outline rounded-xl p-4" :class="[
            variant === 'minimal' ? 'border-0 bg-transparent p-0' : '',
        ]">

            <div class="flex items-start justify-between">
                <!-- Content Skeleton -->
                <div class="flex items-start space-x-3 flex-1">
                    <!-- Icon Skeleton (optional) -->
                    <BaseSkeleton v-if="showIcon" variant="circular" size="lg" :width="iconSize" :height="iconSize"
                        :rounded="iconRounded" aria-label="Loading icon" />

                    <div class="flex-1 min-w-0">
                        <!-- Title Skeleton -->
                        <div class="flex items-center space-x-2 mb-1">
                            <BaseSkeleton variant="text" size="md" :width="titleWidth" aria-label="Loading title" />
                            <!-- Optional status dot -->
                            <BaseSkeleton v-if="showStatus" variant="circular" size="xs" :width="8" :height="8"
                                aria-label="Loading status" />
                        </div>

                        <!-- Subtitle Skeleton -->
                        <BaseSkeleton v-if="showSubtitle" variant="text" size="sm" :width="subtitleWidth" class="mb-2"
                            aria-label="Loading subtitle" />

                        <!-- Details Grid Skeleton -->
                        <div v-if="showDetails" class="grid gap-3" :class="[
                            detailsColumns === 1 ? 'grid-cols-1' : '',
                            detailsColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' : '',
                            detailsColumns === 3 ? 'grid-cols-1 sm:grid-cols-3' : '',
                        ]">
                            <div v-for="detail in detailsColumns" :key="detail" class="flex items-center space-x-1">
                                <BaseSkeleton variant="circular" size="xs" :width="12" :height="12"
                                    aria-label="Loading detail icon" />
                                <BaseSkeleton variant="text" size="xs" :width="detailWidth"
                                    aria-label="Loading detail" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Button Skeleton -->
                <div v-if="showAction" class="flex items-center ml-4">
                    <BaseSkeleton variant="circular" size="sm" :width="32" :height="32"
                        aria-label="Loading action button" />
                </div>
            </div>
        </div>
    </div>
</template>
