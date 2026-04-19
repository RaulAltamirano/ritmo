// Types for Ritmo Logo Components

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

export type LogoVariant = 'default' | 'primary' | 'monochrome' | 'white'

export interface LogoProps {
  size?: LogoSize
  variant?: LogoVariant
  ariaLabel?: string
}

export interface BrandProps {
  size?: LogoSize
  variant?: LogoVariant
  showText?: boolean
  showTagline?: boolean
  brandName?: string
  tagline?: string
}
