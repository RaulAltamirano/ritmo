/**
 * Component Categories Configuration
 *
 * This file defines the categorization system for all components
 * in the Ritmo UI design system. It serves as the single source
 * of truth for component organization and enables automatic
 * documentation generation.
 */

export interface ComponentCategory {
  name: string
  description: string
  components: string[]
  composables?: string[]
  types?: string[]
  stories?: string[]
  tests?: string[]
}

export interface ComponentLevel {
  name: string
  description: string
  categories: Record<string, ComponentCategory>
}

export const componentCategories: Record<string, ComponentLevel> = {
  atoms: {
    name: 'Atoms',
    description:
      'Basic building blocks of the design system. The smallest functional units.',
    categories: {
      forms: {
        name: 'Forms',
        description: 'Form input components and controls',
        components: [
          'BaseInput',
          'BaseCheckbox',
          'BaseSelect',
          'BaseTextarea',
          'BaseRadio',
          'BaseSwitch',
        ],
        composables: ['useFormValidation', 'useInputFocus'],
        types: ['InputProps', 'CheckboxProps', 'SelectProps'],
        stories: ['BaseInput.stories.ts', 'BaseCheckbox.stories.ts'],
        tests: ['BaseInput.test.ts', 'BaseCheckbox.test.ts'],
      },
      feedback: {
        name: 'Feedback',
        description: 'Components that provide user feedback and status information',
        components: [
          'BaseAlert',
          'BaseToast',
          'BaseBadge',
          'BaseNotification',
          'BaseProgress',
          'BaseStatus',
        ],
        composables: ['useToast', 'useNotifications', 'useBadge'],
        types: ['AlertProps', 'ToastProps', 'BadgeProps'],
        stories: [
          'BaseAlert.stories.ts',
          'BaseToast.stories.ts',
          'BaseBadge.stories.ts',
        ],
        tests: ['BaseAlert.test.ts', 'BaseToast.test.ts', 'BaseBadge.test.ts'],
      },
      layout: {
        name: 'Layout',
        description: 'Layout and structural components',
        components: [
          'BaseCard',
          'BaseSkeleton',
          'BaseDivider',
          'BaseContainer',
          'BaseGrid',
          'BaseFlex',
        ],
        composables: ['useLayout', 'useSkeleton'],
        types: ['CardProps', 'SkeletonProps', 'ContainerProps'],
        stories: ['BaseCard.stories.ts', 'BaseSkeleton.stories.ts'],
        tests: ['BaseCard.test.ts', 'BaseSkeleton.test.ts'],
      },
      interactive: {
        name: 'Interactive',
        description: 'Interactive elements and controls',
        components: [
          'BaseButton',
          'BaseModal',
          'BaseTooltip',
          'BaseDropdown',
          'BaseTabs',
          'BaseAccordion',
        ],
        composables: ['useFocusTrap', 'useTooltip', 'useModal'],
        types: ['ButtonProps', 'ModalProps', 'TooltipProps'],
        stories: ['BaseButton.stories.ts', 'BaseModal.stories.ts'],
        tests: ['BaseButton.test.ts', 'BaseModal.test.ts'],
      },
      display: {
        name: 'Display',
        description: 'Visual and display components',
        components: [
          'BaseIcon',
          'BaseSpinner',
          'BaseLoadingSpinner',
          'BaseAvatar',
          'BaseImage',
          'BaseLogo',
        ],
        composables: ['useIcon', 'useSpinner', 'useAvatar'],
        types: ['IconProps', 'SpinnerProps', 'AvatarProps'],
        stories: ['BaseIcon.stories.ts', 'BaseSpinner.stories.ts'],
        tests: ['BaseIcon.test.ts', 'BaseSpinner.test.ts'],
      },
    },
  },
  molecules: {
    name: 'Molecules',
    description: 'Simple combinations of atoms that form functional groups.',
    categories: {
      forms: {
        name: 'Forms',
        description: 'Complete form components combining multiple atoms',
        components: [
          'LoginForm',
          'RegisterForm',
          'ContactForm',
          'SearchForm',
          'FilterForm',
          'SettingsForm',
        ],
        composables: ['useForm', 'useFormValidation', 'useFormSubmission'],
        types: ['LoginFormProps', 'RegisterFormProps', 'ContactFormProps'],
        stories: ['LoginForm.stories.ts', 'RegisterForm.stories.ts'],
        tests: ['LoginForm.test.ts', 'RegisterForm.test.ts'],
      },
      navigation: {
        name: 'Navigation',
        description: 'Navigation-related molecule components',
        components: [
          'DarkModeToggle',
          'Breadcrumb',
          'Pagination',
          'SearchBar',
          'FilterBar',
          'SortControls',
        ],
        composables: ['useDarkMode', 'useBreadcrumb', 'usePagination'],
        types: ['DarkModeToggleProps', 'BreadcrumbProps', 'PaginationProps'],
        stories: ['DarkModeToggle.stories.ts', 'Breadcrumb.stories.ts'],
        tests: ['DarkModeToggle.test.ts', 'Breadcrumb.test.ts'],
      },
      feedback: {
        name: 'Feedback',
        description: 'Complex feedback and state components',
        components: [
          'EmptyState',
          'LoadingState',
          'ErrorState',
          'SuccessState',
          'ConfirmationDialog',
          'StatusIndicator',
        ],
        composables: ['useEmptyState', 'useLoadingState', 'useErrorState'],
        types: ['EmptyStateProps', 'LoadingStateProps', 'ErrorStateProps'],
        stories: ['EmptyState.stories.ts', 'LoadingState.stories.ts'],
        tests: ['EmptyState.test.ts', 'LoadingState.test.ts'],
      },
    },
  },
  organisms: {
    name: 'Organisms',
    description: 'Complex components made of groups of molecules and atoms.',
    categories: {
      navigation: {
        name: 'Navigation',
        description: 'Complete navigation systems and menus',
        components: [
          'BaseNavbar',
          'BaseNavItem',
          'BaseNavDropdown',
          'Sidebar',
          'TopBar',
          'MobileMenu',
        ],
        composables: ['useNavigation', 'useSidebar', 'useMobileMenu'],
        types: ['NavbarProps', 'NavItemProps', 'SidebarProps'],
        stories: ['BaseNavbar.stories.ts', 'BaseNavItem.stories.ts'],
        tests: ['BaseNavbar.test.ts', 'BaseNavItem.test.ts'],
      },
      forms: {
        name: 'Forms',
        description: 'Complex form organisms with multiple sections',
        components: [
          'UserProfileForm',
          'ProjectForm',
          'SettingsForm',
          'DataTable',
          'FilterPanel',
          'SearchResults',
        ],
        composables: ['useUserProfile', 'useProjectForm', 'useDataTable'],
        types: ['UserProfileFormProps', 'ProjectFormProps', 'DataTableProps'],
        stories: ['UserProfileForm.stories.ts', 'ProjectForm.stories.ts'],
        tests: ['UserProfileForm.test.ts', 'ProjectForm.test.ts'],
      },
      layout: {
        name: 'Layout',
        description: 'Layout organisms and page sections',
        components: [
          'PageHeader',
          'Sidebar',
          'Footer',
          'ContentArea',
          'Dashboard',
          'PageLayout',
        ],
        composables: ['usePageLayout', 'useSidebar', 'useDashboard'],
        types: ['PageHeaderProps', 'SidebarProps', 'FooterProps'],
        stories: ['PageHeader.stories.ts', 'Sidebar.stories.ts'],
        tests: ['PageHeader.test.ts', 'Sidebar.test.ts'],
      },
    },
  },
  templates: {
    name: 'Templates',
    description: 'Page-level layouts that define the overall structure.',
    categories: {
      layouts: {
        name: 'Layouts',
        description: 'Complete page templates and layouts',
        components: [
          'AuthLayout',
          'DashboardLayout',
          'LandingLayout',
          'AdminLayout',
          'ErrorLayout',
          'MainLayout',
        ],
        composables: ['useLayout', 'useAuthLayout', 'useDashboardLayout'],
        types: ['AuthLayoutProps', 'DashboardLayoutProps', 'LandingLayoutProps'],
        stories: ['AuthLayout.stories.ts', 'DashboardLayout.stories.ts'],
        tests: ['AuthLayout.test.ts', 'DashboardLayout.test.ts'],
      },
    },
  },
}

/**
 * Helper functions for working with component categories
 */
export function getComponentsByCategory(level: string, category: string): string[] {
  return componentCategories[level]?.categories[category]?.components || []
}

export function getCategoriesByLevel(level: string): string[] {
  return Object.keys(componentCategories[level]?.categories || {})
}

export function getAllLevels(): string[] {
  return Object.keys(componentCategories)
}

export function getComponentInfo(level: string, category: string, component: string) {
  const categoryInfo = componentCategories[level]?.categories[category]
  if (!categoryInfo) return null

  return {
    level,
    category,
    component,
    composables: categoryInfo.composables ?? [],
    types: categoryInfo.types ?? [],
    stories: categoryInfo.stories ?? [],
    tests: categoryInfo.tests ?? [],
  }
}

export function validateComponentExists(
  level: string,
  category: string,
  component: string,
): boolean {
  const components = getComponentsByCategory(level, category)
  return components.includes(component)
}

export function getComponentPath(
  level: string,
  category: string,
  component: string,
): string {
  return `src/components/${level}/${category}/${component}.vue`
}

export function getStoryPath(
  level: string,
  category: string,
  component: string,
): string {
  return `src/components/${level}/${category}/${component}.stories.ts`
}

export function getTestPath(
  level: string,
  category: string,
  component: string,
): string {
  return `src/components/${level}/${category}/${component}.test.ts`
}

/**
 * Export configuration for different build targets
 */
export const exportConfig = {
  main: {
    atoms: ['forms', 'feedback', 'layout', 'interactive', 'display'],
    molecules: ['forms', 'navigation', 'feedback'],
    organisms: ['navigation', 'forms', 'layout'],
    templates: ['layouts'],
  },
  forms: {
    atoms: ['forms'],
    molecules: ['forms'],
    organisms: ['forms'],
  },
  navigation: {
    atoms: ['interactive'],
    molecules: ['navigation'],
    organisms: ['navigation'],
  },
  layout: {
    atoms: ['layout'],
    molecules: ['feedback'],
    organisms: ['layout'],
    templates: ['layouts'],
  },
}

export default componentCategories
