// Badge design tokens — soft tint is the product default

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'subtle'

export type BadgeAppearance = 'soft' | 'solid'
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'
export type BadgeTag = 'span' | 'button' | 'div'
export type BadgeIconPosition = 'left' | 'right'

export interface BaseBadgeProps {
  variant?: BadgeVariant
  appearance?: BadgeAppearance
  size?: BadgeSize
  content?: string
  count?: number
  maxCount?: number
  leftIcon?: string | object
  rightIcon?: string | object
  loading?: boolean
  clickable?: boolean
  disabled?: boolean
  tag?: BadgeTag
  ariaLabel?: string
}

export type BadgeProps = BaseBadgeProps

export interface BaseBadgeEmits {
  click: [event: MouseEvent | KeyboardEvent]
}

export interface BaseBadgeExpose {
  focus: () => void
}

export const badgeSizeMap: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-xs h-5 min-w-[1.25rem]',
  sm: 'px-2.5 py-1 text-xs h-6 min-w-[1.5rem]',
  md: 'px-3 py-1 text-sm h-7 min-w-[1.75rem]',
  lg: 'px-3.5 py-1.5 text-sm h-8 min-w-[2rem]',
}

/** Soft tint — default status/metadata chrome */
export const badgeSoftVariantMap: Record<BadgeVariant, string[]> = {
  primary: [
    'bg-blue-100 text-blue-700 border border-blue-200',
    'dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    'hover:bg-blue-200/80 dark:hover:bg-blue-900',
    'focus:ring-blue-500 dark:focus:ring-blue-400',
  ],
  secondary: [
    'bg-gray-100 text-gray-700 border border-gray-200',
    'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    'hover:bg-gray-200 dark:hover:bg-gray-700',
    'focus:ring-gray-500 dark:focus:ring-gray-400',
  ],
  success: [
    'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    'hover:bg-emerald-200/80 dark:hover:bg-emerald-900',
    'focus:ring-emerald-500 dark:focus:ring-emerald-400',
  ],
  warning: [
    'bg-amber-100 text-amber-800 border border-amber-200',
    'dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    'hover:bg-amber-200/80 dark:hover:bg-amber-900',
    'focus:ring-amber-500 dark:focus:ring-amber-400',
  ],
  error: [
    'bg-red-100 text-red-700 border border-red-200',
    'dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    'hover:bg-red-200/80 dark:hover:bg-red-900',
    'focus:ring-red-500 dark:focus:ring-red-400',
  ],
  info: [
    'bg-cyan-100 text-cyan-700 border border-cyan-200',
    'dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
    'hover:bg-cyan-200/80 dark:hover:bg-cyan-900',
    'focus:ring-cyan-500 dark:focus:ring-cyan-400',
  ],
  neutral: [
    'bg-slate-100 text-slate-700 border border-slate-200',
    'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
    'hover:bg-slate-200 dark:hover:bg-slate-700',
    'focus:ring-slate-500 dark:focus:ring-slate-400',
  ],
  subtle: [
    'bg-gray-50 text-gray-600 border border-gray-200',
    'dark:bg-gray-800/80 dark:text-gray-400 dark:border-gray-700',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    'focus:ring-gray-400 dark:focus:ring-gray-500',
  ],
}

/** Solid fill — high-emphasis only */
export const badgeSolidVariantMap: Record<BadgeVariant, string[]> = {
  primary: [
    'bg-blue-600 text-white dark:bg-blue-500',
    'hover:bg-blue-700 dark:hover:bg-blue-600',
    'focus:ring-blue-500 dark:focus:ring-blue-400',
  ],
  secondary: [
    'bg-gray-100 text-gray-700 border border-gray-200',
    'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    'hover:bg-gray-200 dark:hover:bg-gray-700',
    'focus:ring-gray-500',
  ],
  success: [
    'bg-emerald-600 text-white dark:bg-emerald-500',
    'hover:bg-emerald-700 dark:hover:bg-emerald-600',
    'focus:ring-emerald-500',
  ],
  warning: [
    'bg-amber-500 text-white',
    'hover:bg-amber-600',
    'focus:ring-amber-400',
  ],
  error: [
    'bg-red-600 text-white dark:bg-red-500',
    'hover:bg-red-700 dark:hover:bg-red-600',
    'focus:ring-red-500',
  ],
  info: [
    'bg-cyan-600 text-white dark:bg-cyan-500',
    'hover:bg-cyan-700 dark:hover:bg-cyan-600',
    'focus:ring-cyan-500',
  ],
  neutral: [
    'bg-gray-600 text-white dark:bg-gray-500',
    'hover:bg-gray-700 dark:hover:bg-gray-600',
    'focus:ring-gray-500',
  ],
  subtle: [
    'bg-gray-50 text-gray-600 border border-gray-200',
    'dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
    'hover:bg-gray-100 dark:hover:bg-gray-700',
    'focus:ring-gray-400',
  ],
}

export const badgeSoftCountMap: Record<BadgeVariant, string> = {
  primary: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  secondary: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
  success: 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  warning: 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200',
  error: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  neutral: 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200',
  subtle: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
}

export const badgeSolidCountMap: Record<BadgeVariant, string> = {
  primary: 'bg-blue-700 text-white dark:bg-blue-600',
  secondary: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
  success: 'bg-emerald-700 text-white dark:bg-emerald-600',
  warning: 'bg-amber-600 text-white',
  error: 'bg-red-700 text-white dark:bg-red-600',
  info: 'bg-cyan-700 text-white dark:bg-cyan-600',
  neutral: 'bg-gray-700 text-white dark:bg-gray-600',
  subtle: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
}

const COUNT_THOUSAND = 1000
const COUNT_MILLION = 1_000_000

export function formatBadgeCount(count: number, maxCount = 99): string {
  if (count > maxCount) return `${maxCount}+`
  if (count >= COUNT_MILLION) return `${(count / COUNT_MILLION).toFixed(1)}M`
  if (count >= COUNT_THOUSAND) return `${(count / COUNT_THOUSAND).toFixed(1)}K`
  return count.toString()
}

export function getBadgeVariantClasses(
  variant: BadgeVariant,
  appearance: BadgeAppearance = 'soft',
): string[] {
  const map = appearance === 'solid' ? badgeSolidVariantMap : badgeSoftVariantMap
  return map[variant]
}

export function getBadgeCountClasses(
  variant: BadgeVariant,
  appearance: BadgeAppearance = 'soft',
): string {
  const map = appearance === 'solid' ? badgeSolidCountMap : badgeSoftCountMap
  return map[variant]
}

/** @deprecated use badgeSoftVariantMap / getBadgeVariantClasses */
export const badgeColorMap = badgeSoftVariantMap

export function validateBadgeProps(props: Partial<BaseBadgeProps>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const variants = Object.keys(badgeSoftVariantMap)
  const sizes = Object.keys(badgeSizeMap)

  if (props.variant && !variants.includes(props.variant)) {
    errors.push(`Invalid variant: ${props.variant}`)
  }
  if (props.size && !sizes.includes(props.size)) {
    errors.push(`Invalid size: ${props.size}`)
  }
  pushCountErrors(props, errors)

  return { isValid: errors.length === 0, errors }
}

function pushCountErrors(
  props: Partial<BaseBadgeProps>,
  errors: string[],
): void {
  if (props.count !== undefined && (typeof props.count !== 'number' || props.count < 0)) {
    errors.push('Count must be a non-negative number')
  }
  if (
    props.maxCount !== undefined &&
    (typeof props.maxCount !== 'number' || props.maxCount < 1)
  ) {
    errors.push('MaxCount must be a positive number')
  }
}

export function getBadgeClasses(
  variant: BadgeVariant,
  size: BadgeSize,
  options: {
    appearance?: BadgeAppearance
    clickable?: boolean
    disabled?: boolean
  } = {},
): string[] {
  const appearance = options.appearance ?? 'soft'
  const classes = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-1',
    'font-medium',
    'rounded-full',
    'transition-all',
    'duration-200',
    'ease-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
    badgeSizeMap[size],
    ...getBadgeVariantClasses(variant, appearance),
  ]

  if (options.clickable && !options.disabled) {
    classes.push('cursor-pointer', 'active:scale-95')
  }
  if (options.disabled) {
    classes.push('opacity-50', 'cursor-not-allowed')
  }

  return classes
}
