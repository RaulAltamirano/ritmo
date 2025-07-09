import { ref, readonly } from 'vue'

interface DaySummary {
  date: string
  totalStudyTime: number
  completedTasks: number
  totalTasks: number
  productivity: number
  tasks: Array<{
    id: string
    name: string
    completed: boolean
    timeSpent: number
    type: string
    category?: string
  }>
}

export const useDaySummaryModal = () => {
  const isVisible = ref(false)
  const modalRef = ref()
  const daySummaryData = ref<DaySummary | null>(null)

  const showModal = (data?: DaySummary) => {
    if (data) {
      daySummaryData.value = data
    }
    isVisible.value = true
    if (modalRef.value) {
      modalRef.value.show()
    }
  }

  const hideModal = () => {
    isVisible.value = false
    daySummaryData.value = null
    if (modalRef.value) {
      modalRef.value.hide()
    }
  }

  const setModalRef = (ref: any) => {
    modalRef.value = ref
  }

  return {
    isVisible,
    modalRef,
    daySummaryData: readonly(daySummaryData),
    showModal,
    hideModal,
    setModalRef
  }
} 