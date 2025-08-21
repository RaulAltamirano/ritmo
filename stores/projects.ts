import { defineStore } from 'pinia'
import type { Project } from '../types/project'
import type { Task } from '../types/task'

// Función para generar IDs únicos
const generateId = (prefix: string = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Función para validar y normalizar IDs
const normalizeProjectId = (id: string): string => {
  // Si el ID es un número simple, convertirlo al formato estándar
  if (/^\d+$/.test(id)) {
    return `project_${id}`
  }
  // Si ya tiene el formato correcto, devolverlo tal como está
  if (id.startsWith('project_')) {
    return id
  }
  // Si no tiene formato, agregar el prefijo
  return `project_${id}`
}

export const useProjectsStore = defineStore('projects', () => {
  // Estado
  const projects = ref<Project[]>([])
  const tasks = ref<Task[]>([])

  // Inicializar datos solo en el cliente para evitar problemas de hidratación
  const initializeData = () => {
    if (process.client && projects.value.length === 0) {
      projects.value = [
        {
          id: 'project_1',
          name: 'Proyecto Web',
          description: 'Desarrollo de una aplicación web moderna con Vue.js y Tailwind CSS',
          status: 'activo',
          progress: 75,
          pendingTasks: 3,
          totalTasks: 12,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          color: 'blue',
          icon: 'FolderOpen'
        },
        {
          id: 'project_2',
          name: 'App Móvil',
          description: 'Aplicación móvil para gestión de tareas con React Native',
          status: 'en_progreso',
          progress: 45,
          pendingTasks: 8,
          totalTasks: 15,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          color: 'purple',
          icon: 'FolderOpen'
        },
        {
          id: 'project_3',
          name: 'API Backend',
          description: 'API REST con Node.js y Express para el sistema de gestión',
          status: 'planificado',
          progress: 0,
          pendingTasks: 12,
          totalTasks: 12,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05'),
          color: 'green',
          icon: 'FolderOpen'
        }
      ]

      tasks.value = [
        {
          id: 'task_1',
          name: 'Diseñar interfaz de usuario',
          description: 'Crear mockups y wireframes para la aplicación',
          status: 'completado',
          priority: 'alta',
          progress: 100,
          completed: true,
          createdAt: new Date('2024-01-15'),
          projectId: 'project_1'
        },
        {
          id: 'task_2',
          name: 'Configurar base de datos',
          description: 'Instalar y configurar PostgreSQL',
          status: 'en_progreso',
          priority: 'alta',
          progress: 60,
          completed: false,
          createdAt: new Date('2024-01-16'),
          projectId: 'project_1'
        },
        {
          id: 'task_3',
          name: 'Implementar autenticación',
          description: 'Sistema de login y registro de usuarios',
          status: 'pendiente',
          priority: 'media',
          progress: 0,
          completed: false,
          createdAt: new Date('2024-01-17'),
          projectId: 'project_1'
        },
        {
          id: 'task_4',
          name: 'Crear API endpoints',
          description: 'Desarrollar endpoints REST para el backend',
          status: 'pendiente',
          priority: 'alta',
          progress: 0,
          completed: false,
          createdAt: new Date('2024-01-18'),
          projectId: 'project_1'
        },
        {
          id: 'task_5',
          name: 'Diseñar UI móvil',
          description: 'Crear diseños para la aplicación móvil',
          status: 'en_progreso',
          priority: 'media',
          progress: 30,
          completed: false,
          createdAt: new Date('2024-01-12'),
          projectId: 'project_2'
        },
        {
          id: 'task_6',
          name: 'Configurar entorno de desarrollo',
          description: 'Preparar el entorno para el desarrollo del backend',
          status: 'pendiente',
          priority: 'baja',
          progress: 0,
          completed: false,
          createdAt: new Date('2024-01-06'),
          projectId: 'project_3'
        }
      ]
    }
  }

  // Getters
  const getProjectById = (id: string) => {
    // Normalizar el ID para buscar
    const normalizedId = normalizeProjectId(id)
    console.log('Buscando proyecto:', { originalId: id, normalizedId })
    
    const project = projects.value.find((project: Project) => project.id === normalizedId)
    
    if (!project) {
      console.warn('Proyecto no encontrado:', { 
        searchedId: normalizedId, 
        availableIds: projects.value.map(p => p.id) 
      })
    }
    
    return project
  }

  const getTasksByProjectId = (projectId: string) => {
    return tasks.value.filter((task: Task) => task.projectId === projectId)
  }

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.value.filter((task: Task) => task.projectId === projectId)
    const totalTasks = projectTasks.length
    const completedTasks = projectTasks.filter((task: Task) => task.completed).length
    const pendingTasks = totalTasks - completedTasks
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      progress
    }
  }

  // Actions
  const addProject = (project: Project) => {
    // Asegurar que el proyecto tenga un ID único
    if (!project.id || project.id.startsWith('project_')) {
      project.id = generateId('project')
    }
    projects.value.unshift(project)
  }

  const updateProject = (project: Project) => {
    const index = projects.value.findIndex((p: Project) => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = { ...project, updatedAt: new Date() }
    }
  }

  const deleteProject = (projectId: string) => {
    projects.value = projects.value.filter((p: Project) => p.id !== projectId)
    // También eliminar las tareas asociadas
    tasks.value = tasks.value.filter((t: Task) => t.projectId !== projectId)
  }

  const addTask = (task: Task) => {
    // Asegurar que la tarea tenga un ID único
    if (!task.id || task.id.startsWith('task_')) {
      task.id = generateId('task')
    }
    tasks.value.push(task)
    updateProjectStats(task.projectId!)
  }

  const updateTask = (task: Task) => {
    const index = tasks.value.findIndex((t: Task) => t.id === task.id)
    if (index !== -1) {
      tasks.value[index] = { ...task, lastEdited: new Date() }
      updateProjectStats(task.projectId!)
    }
  }

  const deleteTask = (taskId: string) => {
    const task = tasks.value.find((t: Task) => t.id === taskId)
    if (task) {
      tasks.value = tasks.value.filter((t: Task) => t.id !== taskId)
      updateProjectStats(task.projectId!)
    }
  }

  const updateProjectStats = (projectId: string) => {
    const stats = getProjectStats(projectId)
    const project = projects.value.find((p: Project) => p.id === projectId)
    if (project) {
      project.totalTasks = stats.totalTasks
      project.pendingTasks = stats.pendingTasks
      project.progress = stats.progress
      project.updatedAt = new Date()
    }
  }

  return {
    // State
    projects,
    tasks,
    
    // Getters
    getProjectById,
    getTasksByProjectId,
    getProjectStats,
    
    // Actions
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    updateProjectStats,
    initializeData,
    generateId,
    normalizeProjectId
  }
}) 