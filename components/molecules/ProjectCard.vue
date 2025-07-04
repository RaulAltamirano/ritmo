<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
    @click="handleProjectClick"
  >
    <div class="flex items-start justify-between mb-4">
      <div 
        class="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        :class="colorClasses[project.color] || colorClasses.blue"
      >
        <FolderOpen class="text-white" :size="20" />
      </div>
      <span 
        class="px-2 py-1 text-xs font-medium rounded-full transition-colors duration-200"
        :class="statusClasses[project.status]"
      >
        {{ statusLabels[project.status] }}
      </span>
    </div>
    
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
      {{ project.name }}
    </h3>
    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
      {{ project.description }}
    </p>
    
    <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
      <span>{{ project.progress }}% completado</span>
      <span>{{ project.pendingTasks }} tareas pendientes</span>
    </div>
    
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
      <div 
        class="h-2 rounded-full transition-all duration-300"
        :class="progressColorClasses[project.color] || progressColorClasses.blue"
        :style="{ width: `${project.progress}%` }"
      ></div>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
      <span>Creado {{ formatDate(project.createdAt) }}</span>
      <div class="flex items-center space-x-1">
        <ArrowRight :size="12" class="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Ver proyecto</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderOpen, ArrowRight } from 'lucide-vue-next'
import type { ProjectCardProps } from '../../types/project'

const props = defineProps<ProjectCardProps>()

const colorClasses: Record<string, string> = {
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  green: 'bg-gradient-to-br from-green-500 to-green-600',
  red: 'bg-gradient-to-br from-red-500 to-red-600',
  yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
  pink: 'bg-gradient-to-br from-pink-500 to-pink-600',
  indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
  teal: 'bg-gradient-to-br from-teal-500 to-teal-600',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
  cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
  emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  rose: 'bg-gradient-to-br from-rose-500 to-rose-600'
}

const progressColorClasses: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500'
}

const statusClasses: Record<string, string> = {
  activo: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
  en_progreso: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
  planificado: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400',
  pausado: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400',
  completado: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
}

const statusLabels: Record<string, string> = {
  activo: 'Activo',
  en_progreso: 'En Progreso',
  planificado: 'Planificado',
  pausado: 'Pausado',
  completado: 'Completado'
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'hoy'
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`
  return `hace ${Math.floor(diffDays / 30)} meses`
}

const handleProjectClick = async () => {
  console.log('ProjectCard: Click en proyecto:', {
    id: props.project.id,
    name: props.project.name
  })
  
  try {
    const url = `/proyectos/${props.project.id}`
    console.log('ProjectCard: Navegando a:', url)
    
    // Usar navegación directa del navegador
    if (process.client) {
      window.location.href = url
    }
  } catch (error) {
    console.error('ProjectCard: Error al navegar:', error)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 