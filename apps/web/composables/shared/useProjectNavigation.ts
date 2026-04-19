export const useProjectNavigation = () => {
  const navigateToProject = async (projectId: string | undefined) => {
    if (!projectId) {
      throw new Error('Project ID is required')
    }

    const url = `/dashboard/projects/${projectId}`
    const result = await navigateTo(url)
    return result
  }

  const navigateToProjectList = async () => {
    const result = await navigateTo('/dashboard/projects')
    return result
  }

  return {
    navigateToProject,
    navigateToProjectList,
  }
}
