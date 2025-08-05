import { computed } from 'vue'
import { useTimerStore } from '../stores/timer'
import type { Task, TimerMode } from '../types/task'

export function useTaskTimer() {
  const timerStore = useTimerStore()

  const isTaskActive = (taskId: string) => {
    return timerStore.activeTask?.id === taskId
  }

  const isTaskPaused = (taskId: string) => {
    return isTaskActive(taskId) && timerStore.isPaused
  }

  const getTaskTimeLeft = (taskId: string) => {
    if (isTaskActive(taskId)) {
      return timerStore.getFormattedTimeLeft
    }
    return null
  }

  const startTask = (task: Task, mode: TimerMode) => {
    // Si la tarea ya está activa, pausar/reanudar
    if (isTaskActive(task.id)) {
      if (timerStore.isPaused) {
        timerStore.resumeTimer()
      } else {
        timerStore.pauseTimer()
      }
      return
    }
    
    // Iniciar nueva tarea o cambiar de tarea
    const timerMode = {
      minutes: mode.minutes || Math.floor(mode.time / 60),
      name: mode.name
    }
    timerStore.startTask(task, timerMode)
  }

  const pauseResumeTask = (task: Task) => {
    if (isTaskActive(task.id)) {
      if (timerStore.isPaused) {
        timerStore.resumeTimer()
      } else {
        timerStore.pauseTimer()
      }
    }
  }

  const stopTask = (task: Task) => {
    if (isTaskActive(task.id)) {
      timerStore.stopTimer()
    }
  }

  const convertToTaskItemFormat = (task: Task): Task => {
    const isActive = isTaskActive(task.id)
    const activeTask = timerStore.activeTask
    
    return {
      ...task,
      title: task.name,
      duration: '25m',
      priority: task.priority || 'media',
      completed: task.completed || false,
      isRunning: isActive,
      timeRemaining: isActive && activeTask ? activeTask.timeLeft : 0,
      totalTime: isActive && activeTask ? activeTask.totalTime : 0,
      totalTimeSpent: task.totalTimeSpent || 0,
      notes: task.notes,
      hasNotes: task.hasNotes,
      lastEdited: task.lastEdited
    }
  }

  return {
    isTaskActive,
    isTaskPaused,
    getTaskTimeLeft,
    startTask,
    pauseResumeTask,
    stopTask,
    convertToTaskItemFormat
  }
} 