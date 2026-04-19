<template>
    <div class="space-y-4">
        <!-- Card skeleton items -->
        <div v-for="n in count" :key="n" :class="[
            'group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6',
            variant === 'minimal' ? 'border-0 bg-transparent p-0' : '',
        ]">

            <!-- Header Skeleton -->
            <div v-if="showHeader" class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <!-- Header Icon Skeleton -->
                    <BaseSkeleton v-if="showHeaderIcon" variant="circular" size="lg" :width="40" :height="40"
                        rounded="lg" aria-label="Loading header icon" />
                    <div>
                        <!-- Header Title Skeleton -->
                        <BaseSkeleton variant="text" size="lg" :width="headerTitleWidth" class="mb-1"
                            aria-label="Loading header title" />
                        <!-- Header Subtitle Skeleton -->
                        <BaseSkeleton v-if="showHeaderSubtitle" variant="text" size="sm" :width="headerSubtitleWidth"
                            aria-label="Loading header subtitle" />
                    </div>
                </div>
                <!-- Header Action Skeleton -->
                <BaseSkeleton v-if="showHeaderAction" variant="rectangular" size="sm" :width="80" :height="32"
                    rounded="md" aria-label="Loading header action" />
            </div>

            <!-- Content Skeleton -->
            <div v-if="showContent" class="space-y-4">
                <!-- Main Content Skeleton -->
                <div v-if="contentType === 'text'" class="space-y-2">
                    <BaseSkeleton variant="text" size="md" :width="contentWidth" aria-label="Loading content" />
                    <BaseSkeleton variant="text" size="md" :width="contentWidth * 0.8" aria-label="Loading content" />
                    <BaseSkeleton variant="text" size="md" :width="contentWidth * 0.6" aria-label="Loading content" />
                </div>

                <!-- Grid Content Skeleton -->
                <div v-else-if="contentType === 'grid'" :class="[
                    'grid gap-4',
                    gridColumns === 1 ? 'grid-cols-1' : '',
                    gridColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' : '',
                    gridColumns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : '',
                    gridColumns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : '',
                ]">
                    <div v-for="item in gridColumns" :key="item" class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <BaseSkeleton variant="circular" size="sm" :width="16" :height="16" class="mb-2"
                            aria-label="Loading grid item icon" />
                        <BaseSkeleton variant="text" size="xs" :width="60" class="mb-1"
                            aria-label="Loading grid item label" />
                        <BaseSkeleton variant="text" size="sm" :width="80" aria-label="Loading grid item value" />
                    </div>
                </div>

                <!-- List Content Skeleton -->
                <div v-else-if="contentType === 'list'" class="space-y-3">
                    <div v-for="item in listItems" :key="item" class="flex items-center space-x-3">
                        <BaseSkeleton variant="circular" size="sm" :width="16" :height="16"
                            aria-label="Loading list item icon" />
                        <BaseSkeleton variant="text" size="sm" :width="listItemWidth" aria-label="Loading list item" />
                    </div>
                </div>
            </div>

            <!-- Footer Skeleton -->
            <div v-if="showFooter"
                class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-2">
                    <BaseSkeleton variant="circular" size="xs" :width="16" :height="16"
                        aria-label="Loading footer icon" />
                    <BaseSkeleton variant="text" size="sm" :width="footerTextWidth" aria-label="Loading footer text" />
                </div>
                <BaseSkeleton v-if="showFooterAction" variant="rectangular" size="sm" :width="100" :height="32"
                    rounded="md" aria-label="Loading footer action" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BaseSkeleton from '../../atoms/layout/BaseSkeleton.vue'

interface CardSkeletonProps {
    count?: number
    variant?: 'default' | 'minimal'
    showHeader?: boolean
    showHeaderIcon?: boolean
    showHeaderSubtitle?: boolean
    showHeaderAction?: boolean
    headerTitleWidth?: number
    headerSubtitleWidth?: number
    showContent?: boolean
    contentType?: 'text' | 'grid' | 'list'
    contentWidth?: number
    gridColumns?: 1 | 2 | 3 | 4
    listItems?: number
    listItemWidth?: number
    showFooter?: boolean
    showFooterAction?: boolean
    footerTextWidth?: number
}

const props = withDefaults(defineProps<CardSkeletonProps>(), {
    count: 1,
    variant: 'default',
    showHeader: true,
    showHeaderIcon: true,
    showHeaderSubtitle: true,
    showHeaderAction: false,
    headerTitleWidth: 150,
    headerSubtitleWidth: 200,
    showContent: true,
    contentType: 'text',
    contentWidth: 300,
    gridColumns: 4,
    listItems: 3,
    listItemWidth: 120,
    showFooter: false,
    showFooterAction: false,
    footerTextWidth: 100,
})
</script>
