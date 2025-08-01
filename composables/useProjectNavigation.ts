export const useProjectNavigation = () => {
  console.log('useProjectNavigation: Composable inicializado')
  
  const navigateToProject = async (projectId: string) => {
    console.log('useProjectNavigation: Navegando a proyecto:', projectId)
    
    if (!projectId || projectId.trim() === '') {
      console.error('useProjectNavigation: ID de proyecto inválido')
      return false
    }
    
    try {
      const url = `/proyectos/${projectId}`
      console.log('useProjectNavigation: URL de navegación:', url)
      
      const result = await navigateTo(url)
      console.log('useProjectNavigation: Resultado de navegación:', result)
      
      return true
    } catch (error) {
      console.error('useProjectNavigation: Error al navegar:', error)
      return false
    }
  }
  
  const navigateToProjects = async () => {
    console.log('useProjectNavigation: Navegando a lista de proyectos')
    
    try {
      const result = await navigateTo('/proyectos')
      console.log('useProjectNavigation: Resultado de navegación a proyectos:', result)
      return true
    } catch (error) {
      console.error('useProjectNavigation: Error al navegar a proyectos:', error)
      return false
    }
  }
  
  return {
    navigateToProject,
    navigateToProjects
  }
} 