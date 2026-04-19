export interface Breadcrumb {
  label: string
  to?: string
}

export interface PhaseData {
  label: string
  emoji: string
  image: string
  suggestion: string
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  actions?: boolean
  actionsLayout?: 'horizontal' | 'vertical'
  breadcrumbs?: Breadcrumb[]
  phaseData?: PhaseData
  darkMode?: boolean
}
