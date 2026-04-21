// Composable para Tipografía - Ritmo UI 2025
// Sistema unificado usando tokens centralizados

import { computed, readonly } from 'vue'
import {
  getComponentTypographyClasses,
  getTypographyClasses,
  typographyTokens,
} from '../tokens/typography'

export interface TypographyTokens {
  fontSizes: Record<string, string>
  fontWeights: Record<string, string>
  lineHeights: Record<string, string>
  letterSpacing: Record<string, string>
  fontFamilies: Record<string, string>
}

export interface TextStyles {
  heading: {
    h1: string
    h2: string
    h3: string
    h4: string
    h5: string
    h6: string
  }
  body: {
    large: string
    base: string
    small: string
    caption: string
  }
  display: {
    large: string
    medium: string
    small: string
  }
  button: Record<string, string>
  input: Record<string, string>
  label: Record<string, string>
}

export function useTypography() {
  // Usar tokens centralizados
  const tokens = readonly(typographyTokens)

  // Estilos de texto predefinidos usando tokens centralizados
  const textStyles = computed<TextStyles>(() => ({
    heading: {
      h1: getTypographyClasses('h1'),
      h2: getTypographyClasses('h2'),
      h3: getTypographyClasses('h3'),
      h4: getTypographyClasses('h4'),
      h5: getTypographyClasses('h5'),
      h6: getTypographyClasses('h6'),
    },
    body: {
      large: getTypographyClasses('body-large'),
      base: getTypographyClasses('body'),
      small: getTypographyClasses('body-small'),
      caption: getTypographyClasses('caption'),
    },
    display: {
      large: getTypographyClasses('display-large'),
      medium: getTypographyClasses('display'),
      small: getTypographyClasses('h1'),
    },
    button: {
      xs: getComponentTypographyClasses('button', 'xs'),
      sm: getComponentTypographyClasses('button', 'sm'),
      md: getComponentTypographyClasses('button', 'md'),
      lg: getComponentTypographyClasses('button', 'lg'),
      xl: getComponentTypographyClasses('button', 'xl'),
    },
    input: {
      xs: getComponentTypographyClasses('input', 'xs'),
      sm: getComponentTypographyClasses('input', 'sm'),
      md: getComponentTypographyClasses('input', 'md'),
      lg: getComponentTypographyClasses('input', 'lg'),
      xl: getComponentTypographyClasses('input', 'xl'),
    },
    label: {
      sm: getTypographyClasses('label-small'),
      md: getTypographyClasses('label'),
      lg: getTypographyClasses('label'),
    },
  }))

  // Función para obtener tokens de tipografía
  const getTypographyTokens = () => tokens

  // Función para obtener estilos de texto
  const getTextStyles = () => textStyles.value

  // Función para obtener clases de variante
  const getVariantClasses = (variant: string) => {
    return computed(() => {
      if (variant === 'heading') return textStyles.value.heading.h1
      if (variant === 'body') return textStyles.value.body.base
      if (variant === 'display') return textStyles.value.display.medium
      if (variant === 'button') return textStyles.value.button.md
      if (variant === 'input') return textStyles.value.input.md
      if (variant === 'label') return textStyles.value.label.md
      return textStyles.value.body.base
    })
  }

  // Función para obtener tipografía de botón
  const getButtonTypography = (size: string) => {
    return computed(() => {
      const buttonSize = size as keyof TextStyles['button']
      return textStyles.value.button[buttonSize] || textStyles.value.button.md
    })
  }

  // Función para obtener tipografía de input
  const getInputTypography = (size: string) => {
    return computed(() => {
      const inputSize = size as keyof TextStyles['input']
      return textStyles.value.input[inputSize] || textStyles.value.input.md
    })
  }

  // Función para obtener tipografía de label
  const getLabelTypography = (size: string) => {
    return computed(() => {
      const labelSize = size as keyof TextStyles['label']
      return textStyles.value.label[labelSize] || textStyles.value.label.md
    })
  }

  // Función para obtener tipografía de heading
  const getHeadingTypography = (level: keyof TextStyles['heading']) => {
    return computed(() => textStyles.value.heading[level])
  }

  // Función para obtener tipografía de body
  const getBodyTypography = (size: keyof TextStyles['body']) => {
    return computed(() => textStyles.value.body[size])
  }

  // Función para obtener tipografía de display
  const getDisplayTypography = (size: keyof TextStyles['display']) => {
    return computed(() => textStyles.value.display[size])
  }

  // Función para obtener tipografía de card
  const getCardTypography = (element: 'title' | 'subtitle' | 'body') => {
    return computed(() => {
      switch (element) {
        case 'title':
          return textStyles.value.heading.h4
        case 'subtitle':
          return textStyles.value.body.small
        case 'body':
          return textStyles.value.body.base
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de modal
  const getModalTypography = (element: 'title' | 'body') => {
    return computed(() => {
      switch (element) {
        case 'title':
          return textStyles.value.heading.h2
        case 'body':
          return textStyles.value.body.base
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de toast
  const getToastTypography = (element: 'title' | 'body') => {
    return computed(() => {
      switch (element) {
        case 'title':
          return textStyles.value.body.large
        case 'body':
          return textStyles.value.body.base
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de alert
  const getAlertTypography = (element: 'title' | 'body') => {
    return computed(() => {
      switch (element) {
        case 'title':
          return textStyles.value.body.large
        case 'body':
          return textStyles.value.body.base
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de badge
  const getBadgeTypography = (size: string) => {
    return computed(() => {
      const badgeSize = size as keyof TextStyles['button']
      return textStyles.value.button[badgeSize] || textStyles.value.button.sm
    })
  }

  // Función para obtener tipografía de tooltip
  const getTooltipTypography = () => {
    return computed(() => textStyles.value.body.small)
  }

  // Función para obtener tipografía de popover
  const getPopoverTypography = (element: 'title' | 'body') => {
    return computed(() => {
      switch (element) {
        case 'title':
          return textStyles.value.heading.h5
        case 'body':
          return textStyles.value.body.base
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de dropdown
  const getDropdownTypography = (element: 'trigger' | 'item') => {
    return computed(() => {
      switch (element) {
        case 'trigger':
          return textStyles.value.button.md
        case 'item':
          return textStyles.value.body.base
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de table
  const getTableTypography = (element: 'header' | 'body' | 'caption') => {
    return computed(() => {
      switch (element) {
        case 'header':
          return textStyles.value.heading.h6
        case 'body':
          return textStyles.value.body.base
        case 'caption':
          return textStyles.value.body.small
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de form
  const getFormTypography = (element: 'label' | 'input' | 'help' | 'error') => {
    return computed(() => {
      switch (element) {
        case 'label':
          return textStyles.value.label.md
        case 'input':
          return textStyles.value.input.md
        case 'help':
          return textStyles.value.body.small
        case 'error':
          return textStyles.value.body.small
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de navigation
  const getNavigationTypography = (element: 'brand' | 'item' | 'dropdown') => {
    return computed(() => {
      switch (element) {
        case 'brand':
          return textStyles.value.heading.h5
        case 'item':
          return textStyles.value.button.md
        case 'dropdown':
          return textStyles.value.body.base
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de breadcrumb
  const getBreadcrumbTypography = (element: 'item' | 'separator') => {
    return computed(() => {
      switch (element) {
        case 'item':
          return textStyles.value.body.small
        case 'separator':
          return textStyles.value.body.small
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de pagination
  const getPaginationTypography = (element: 'item' | 'ellipsis') => {
    return computed(() => {
      switch (element) {
        case 'item':
          return textStyles.value.button.md
        case 'ellipsis':
          return textStyles.value.body.small
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de tabs
  const getTabsTypography = (element: 'tab' | 'panel') => {
    return computed(() => {
      switch (element) {
        case 'tab':
          return textStyles.value.button.md
        case 'panel':
          return textStyles.value.body.base
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de accordion
  const getAccordionTypography = (element: 'trigger' | 'content') => {
    return computed(() => {
      switch (element) {
        case 'trigger':
          return textStyles.value.button.md
        case 'content':
          return textStyles.value.body.base
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de sidebar
  const getSidebarTypography = (element: 'header' | 'item' | 'footer') => {
    return computed(() => {
      switch (element) {
        case 'header':
          return textStyles.value.heading.h5
        case 'item':
          return textStyles.value.button.md
        case 'footer':
          return textStyles.value.body.small
        default:
          return textStyles.value.body.base
      }
    })
  }

  // Función para obtener tipografía de footer
  const getFooterTypography = (element: 'heading' | 'body' | 'link') => {
    return computed(() => {
      switch (element) {
        case 'heading':
          return textStyles.value.heading.h6
        case 'body':
          return textStyles.value.body.small
        case 'link':
          return textStyles.value.body.small
        default:
          return textStyles.value.body.base
      }
    })
  }

  return {
    // Tokens de tipografía centralizados
    typographyTokens: tokens,
    textStyles: readonly(textStyles),

    // Funciones de utilidad usando tokens centralizados
    getTypographyTokens,
    getTextStyles,
    getVariantClasses,
    getButtonTypography,
    getInputTypography,
    getLabelTypography,
    getHeadingTypography,
    getBodyTypography,
    getDisplayTypography,
    getCardTypography,
    getModalTypography,
    getToastTypography,
    getAlertTypography,
    getBadgeTypography,
    getTooltipTypography,
    getPopoverTypography,
    getDropdownTypography,
    getTableTypography,
    getFormTypography,
    getNavigationTypography,
    getBreadcrumbTypography,
    getPaginationTypography,
    getTabsTypography,
    getAccordionTypography,
    getSidebarTypography,
    getFooterTypography,
  }
}
