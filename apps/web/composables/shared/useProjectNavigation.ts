export const useProjectNavigation = () => {
  const navigateToProject = async (projectId: string | undefined) => {
    if (!projectId) {
      throw new Error('Project ID is required')
    }

    const url = `/planes/${projectId}`
    const result = await navigateTo(url)
    return result
  }

  const navigateToProjectList = async () => {
    const result = await navigateTo('/planes')
    return result
  }

  return {
    navigateToProject,
    navigateToProjectList,
  }
}
