// Card component type definitions

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'simple'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface CardProps {
  variant?: CardVariant
  padding?: CardPadding
  hover?: boolean
  fullHeight?: boolean
  ariaLabel?: string
  clickable?: boolean
  title?: string
  subtitle?: string
  loading?: boolean
  element?: 'div' | 'article' | 'section' | 'aside'
  badge?: {
    text: string
    type?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
  }
}

export interface CardEmits {
  click?: [event: MouseEvent | KeyboardEvent]
}
