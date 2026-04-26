/**
 * Export Configuration System
 *
 * This file defines how components are exported from the UI package.
 * It enables tree-shaking and provides different export strategies
 * for different use cases.
 */

import { componentCategories } from './component-categories'

export interface ExportConfig {
  level: string
  category: string
  components: string[]
  composables?: string[]
  types?: string[]
}

export interface ExportStrategy {
  name: string
  description: string
  config: ExportConfig[]
}

/**
 * Export strategies for different use cases
 */
export const exportStrategies: Record<string, ExportStrategy> = {
  // Full export - everything
  full: {
    name: 'Full Export',
    description: 'Export all components, composables, and types',
    config: [
      {
        level: 'atoms',
        category: 'forms',
        components: ['BaseInput', 'BaseCheckbox', 'BaseSelect', 'BaseTextarea'],
        composables: ['useFormValidation', 'useInputFocus'],
        types: ['InputProps', 'CheckboxProps', 'SelectProps'],
      },
      {
        level: 'atoms',
        category: 'feedback',
        components: ['BaseAlert', 'BaseToast', 'BaseBadge', 'BaseNotification'],
        composables: ['useToast', 'useNotifications', 'useBadge'],
        types: ['AlertProps', 'ToastProps', 'BadgeProps'],
      },
      {
        level: 'atoms',
        category: 'layout',
        components: ['BaseCard', 'BaseSkeleton', 'BaseDivider', 'BaseContainer'],
        composables: ['useLayout', 'useSkeleton'],
        types: ['CardProps', 'SkeletonProps', 'ContainerProps'],
      },
      {
        level: 'atoms',
        category: 'interactive',
        components: ['BaseButton', 'BaseModal', 'BaseTooltip', 'BaseDropdown'],
        composables: ['useFocusTrap', 'useTooltip', 'useModal'],
        types: ['ButtonProps', 'ModalProps', 'TooltipProps'],
      },
      {
        level: 'atoms',
        category: 'display',
        components: ['BaseIcon', 'BaseSpinner', 'BaseLoadingSpinner', 'BaseAvatar'],
        composables: ['useIcon', 'useSpinner', 'useAvatar'],
        types: ['IconProps', 'SpinnerProps', 'AvatarProps'],
      },
      {
        level: 'molecules',
        category: 'forms',
        components: ['LoginForm', 'RegisterForm', 'ContactForm', 'SearchForm'],
        composables: ['useForm', 'useFormValidation', 'useFormSubmission'],
        types: ['LoginFormProps', 'RegisterFormProps', 'ContactFormProps'],
      },
      {
        level: 'molecules',
        category: 'navigation',
        components: ['DarkModeToggle', 'Breadcrumb', 'Pagination', 'SearchBar'],
        composables: ['useDarkMode', 'useBreadcrumb', 'usePagination'],
        types: ['DarkModeToggleProps', 'BreadcrumbProps', 'PaginationProps'],
      },
      {
        level: 'molecules',
        category: 'feedback',
        components: ['EmptyState', 'LoadingState', 'ErrorState', 'SuccessState'],
        composables: ['useEmptyState', 'useLoadingState', 'useErrorState'],
        types: ['EmptyStateProps', 'LoadingStateProps', 'ErrorStateProps'],
      },
      {
        level: 'organisms',
        category: 'navigation',
        components: ['BaseNavbar', 'BaseNavItem', 'BaseNavDropdown', 'Sidebar'],
        composables: ['useNavigation', 'useSidebar', 'useMobileMenu'],
        types: ['NavbarProps', 'NavItemProps', 'SidebarProps'],
      },
      {
        level: 'organisms',
        category: 'forms',
        components: ['UserProfileForm', 'ProjectForm', 'SettingsForm', 'DataTable'],
        composables: ['useUserProfile', 'useProjectForm', 'useDataTable'],
        types: ['UserProfileFormProps', 'ProjectFormProps', 'DataTableProps'],
      },
      {
        level: 'organisms',
        category: 'layout',
        components: ['PageHeader', 'Sidebar', 'Footer', 'ContentArea'],
        composables: ['usePageLayout', 'useSidebar', 'useDashboard'],
        types: ['PageHeaderProps', 'SidebarProps', 'FooterProps'],
      },
      {
        level: 'templates',
        category: 'layouts',
        components: ['AuthLayout', 'DashboardLayout', 'LandingLayout', 'AdminLayout'],
        composables: ['useLayout', 'useAuthLayout', 'useDashboardLayout'],
        types: ['AuthLayoutProps', 'DashboardLayoutProps', 'LandingLayoutProps'],
      },
    ],
  },

  // Forms only - for form-heavy applications
  forms: {
    name: 'Forms Export',
    description: 'Export only form-related components',
    config: [
      {
        level: 'atoms',
        category: 'forms',
        components: ['BaseInput', 'BaseCheckbox', 'BaseSelect', 'BaseTextarea'],
        composables: ['useFormValidation', 'useInputFocus'],
        types: ['InputProps', 'CheckboxProps', 'SelectProps'],
      },
      {
        level: 'molecules',
        category: 'forms',
        components: ['LoginForm', 'RegisterForm', 'ContactForm', 'SearchForm'],
        composables: ['useForm', 'useFormValidation', 'useFormSubmission'],
        types: ['LoginFormProps', 'RegisterFormProps', 'ContactFormProps'],
      },
      {
        level: 'organisms',
        category: 'forms',
        components: ['UserProfileForm', 'ProjectForm', 'SettingsForm', 'DataTable'],
        composables: ['useUserProfile', 'useProjectForm', 'useDataTable'],
        types: ['UserProfileFormProps', 'ProjectFormProps', 'DataTableProps'],
      },
    ],
  },

  // Navigation only - for navigation components
  navigation: {
    name: 'Navigation Export',
    description: 'Export only navigation-related components',
    config: [
      {
        level: 'atoms',
        category: 'interactive',
        components: ['BaseButton', 'BaseModal', 'BaseTooltip'],
        composables: ['useFocusTrap', 'useTooltip', 'useModal'],
        types: ['ButtonProps', 'ModalProps', 'TooltipProps'],
      },
      {
        level: 'molecules',
        category: 'navigation',
        components: ['DarkModeToggle', 'Breadcrumb', 'Pagination', 'SearchBar'],
        composables: ['useDarkMode', 'useBreadcrumb', 'usePagination'],
        types: ['DarkModeToggleProps', 'BreadcrumbProps', 'PaginationProps'],
      },
      {
        level: 'organisms',
        category: 'navigation',
        components: ['BaseNavbar', 'BaseNavItem', 'BaseNavDropdown', 'Sidebar'],
        composables: ['useNavigation', 'useSidebar', 'useMobileMenu'],
        types: ['NavbarProps', 'NavItemProps', 'SidebarProps'],
      },
    ],
  },

  // Layout only - for layout components
  layout: {
    name: 'Layout Export',
    description: 'Export only layout-related components',
    config: [
      {
        level: 'atoms',
        category: 'layout',
        components: ['BaseCard', 'BaseSkeleton', 'BaseDivider', 'BaseContainer'],
        composables: ['useLayout', 'useSkeleton'],
        types: ['CardProps', 'SkeletonProps', 'ContainerProps'],
      },
      {
        level: 'molecules',
        category: 'feedback',
        components: ['EmptyState', 'LoadingState', 'ErrorState'],
        composables: ['useEmptyState', 'useLoadingState', 'useErrorState'],
        types: ['EmptyStateProps', 'LoadingStateProps', 'ErrorStateProps'],
      },
      {
        level: 'organisms',
        category: 'layout',
        components: ['PageHeader', 'Sidebar', 'Footer', 'ContentArea'],
        composables: ['usePageLayout', 'useSidebar', 'useDashboard'],
        types: ['PageHeaderProps', 'SidebarProps', 'FooterProps'],
      },
      {
        level: 'templates',
        category: 'layouts',
        components: ['AuthLayout', 'DashboardLayout', 'LandingLayout', 'AdminLayout'],
        composables: ['useLayout', 'useAuthLayout', 'useDashboardLayout'],
        types: ['AuthLayoutProps', 'DashboardLayoutProps', 'LandingLayoutProps'],
      },
    ],
  },

  // Minimal - only essential components
  minimal: {
    name: 'Minimal Export',
    description: 'Export only essential components for basic functionality',
    config: [
      {
        level: 'atoms',
        category: 'interactive',
        components: ['BaseButton'],
        composables: ['useFocusTrap'],
        types: ['ButtonProps'],
      },
      {
        level: 'atoms',
        category: 'forms',
        components: ['BaseInput'],
        composables: ['useFormValidation'],
        types: ['InputProps'],
      },
      {
        level: 'atoms',
        category: 'layout',
        components: ['BaseCard'],
        composables: ['useLayout'],
        types: ['CardProps'],
      },
      {
        level: 'atoms',
        category: 'display',
        components: ['BaseIcon'],
        composables: ['useIcon'],
        types: ['IconProps'],
      },
    ],
  },
}

/**
 * Generate export statements for a given strategy
 */
export function generateExports(strategy: string): string {
  const config = exportStrategies[strategy]
  if (!config) {
    throw new Error(`Unknown export strategy: ${strategy}`)
  }

  let exports = `// ${config.name} - ${config.description}\n\n`

  config.config.forEach(({ level, category, components, composables, types }) => {
    exports += `// ${level}/${category}\n`

    // Component exports
    components.forEach(component => {
      exports += `export { default as ${component} } from './components/${level}/${category}/${component}.vue'\n`
    })

    // Composable exports
    if (composables) {
      composables.forEach(composable => {
        exports += `export { ${composable} } from './composables/${composable}'\n`
      })
    }

    // Type exports
    if (types) {
      types.forEach(type => {
        exports += `export type { ${type} } from './types/${type.toLowerCase().replace('props', '')}'\n`
      })
    }

    exports += '\n'
  })

  return exports
}

/**
 * Generate index.ts content for a specific category
 */
export function generateCategoryIndex(level: string, category: string): string {
  const levelConfig = componentCategories[level]
  if (!levelConfig) {
    throw new Error(`Unknown level: ${level}`)
  }

  const categoryConfig = levelConfig.categories[category]
  if (!categoryConfig) {
    throw new Error(`Unknown category: ${category}`)
  }

  let content = `// ${level}/${category} - ${categoryConfig.description}\n\n`

  // Component exports
  categoryConfig.components.forEach(component => {
    content += `export { default as ${component} } from './${component}.vue'\n`
  })

  // Composable exports
  if (categoryConfig.composables) {
    content += '\n// Composables\n'
    categoryConfig.composables.forEach(composable => {
      content += `export { ${composable} } from '@/composables/${composable}'\n`
    })
  }

  // Type exports
  if (categoryConfig.types) {
    content += '\n// Types\n'
    categoryConfig.types.forEach(type => {
      content += `export type { ${type} } from '@/types/${type.toLowerCase().replace('props', '')}'\n`
    })
  }

  return content
}

/**
 * Get available export strategies
 */
export function getAvailableStrategies(): string[] {
  return Object.keys(exportStrategies)
}

/**
 * Validate export strategy
 */
export function validateExportStrategy(strategy: string): boolean {
  return strategy in exportStrategies
}

export default exportStrategies
