<template>
    <span :class="[
        'px-2 py-1 rounded-full text-xs font-medium',
        badgeClasses
    ]">
        <component :is="icon" class="h-3 w-3 mr-1 inline" />
        {{ label }}
    </span>
</template>

<script setup lang="ts">
import {
    FileText,
    Image,
    Lightbulb,
    Music,
    Star,
    Trophy
} from 'lucide-vue-next';

interface Props {
    type: string
}

const props = defineProps<Props>()

const typeConfig = {
    technique: {
        label: 'Técnica',
        icon: Lightbulb,
        classes: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
    },
    music: {
        label: 'Música',
        icon: Music,
        classes: 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300'
    },
    image: {
        label: 'Imagen',
        icon: Image,
        classes: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
    },
    trophy: {
        label: 'Trofeo',
        icon: Trophy,
        classes: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
    },
    review: {
        label: 'Reseña',
        icon: Star,
        classes: 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
    },
    article: {
        label: 'Artículo',
        icon: FileText,
        classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }
}

const config = typeConfig[props.type as keyof typeof typeConfig] || typeConfig.article

const { label, icon, classes: badgeClasses } = config
</script>
