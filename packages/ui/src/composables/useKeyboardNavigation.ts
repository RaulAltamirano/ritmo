// Advanced Keyboard Navigation Composable
// Implements WCAG 2.1 AA keyboard navigation requirements
// Provides comprehensive keyboard support for all components

import { onUnmounted, ref } from 'vue'

export interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
  preventDefault?: boolean
  shiftKey?: boolean
  ctrlKey?: boolean
  altKey?: boolean
  metaKey?: boolean
}

export interface KeyboardNavigationOptions {
  // Navigation options
  enableArrowKeys?: boolean
  enableTabNavigation?: boolean
  enableEscapeKey?: boolean
  enableEnterKey?: boolean
  enableSpaceKey?: boolean

  // Custom shortcuts
  shortcuts?: KeyboardShortcut[]

  // Focus management
  autoFocus?: boolean
  focusOnMount?: boolean
  focusOnUpdate?: boolean

  // Accessibility
  announceToScreenReader?: boolean
  screenReaderText?: string
}

export interface NavigationState {
  currentIndex: number
  totalItems: number
  isNavigating: boolean
  lastKeyPressed: string
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    enableArrowKeys = true,
    enableTabNavigation = true,
    enableEscapeKey = true,
    enableEnterKey = true,
    enableSpaceKey = true,
    shortcuts = [],
    autoFocus = false,
    focusOnMount = false,
    focusOnUpdate = false,
    announceToScreenReader = false,
    screenReaderText = '',
  } = options

  // State management
  const navigationState = ref<NavigationState>({
    currentIndex: 0,
    totalItems: 0,
    isNavigating: false,
    lastKeyPressed: '',
  })

  const isActive = ref(false)
  const focusableElements = ref<HTMLElement[]>([])
  const containerRef = ref<HTMLElement | null>(null)

  // Navigation methods
  const navigateToIndex = (index: number) => {
    if (index < 0 || index >= focusableElements.value.length) return

    navigationState.value.currentIndex = index
    const element = focusableElements.value[index]

    if (element) {
      element.focus()
      announceKeyboardNavigation(
        `Navigated to item ${index + 1} of ${focusableElements.value.length}`,
      )
    }
  }

  const navigateNext = () => {
    const nextIndex =
      (navigationState.value.currentIndex + 1) % focusableElements.value.length
    navigateToIndex(nextIndex)
  }

  const navigatePrevious = () => {
    const prevIndex =
      navigationState.value.currentIndex > 0
        ? navigationState.value.currentIndex - 1
        : focusableElements.value.length - 1
    navigateToIndex(prevIndex)
  }

  const navigateFirst = () => {
    navigateToIndex(0)
  }

  const navigateLast = () => {
    navigateToIndex(focusableElements.value.length - 1)
  }

  // Arrow key navigation
  const handleArrowKeys = (event: KeyboardEvent) => {
    if (!enableArrowKeys) return

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        navigateNext()
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        navigatePrevious()
        break
      case 'Home':
        event.preventDefault()
        navigateFirst()
        break
      case 'End':
        event.preventDefault()
        navigateLast()
        break
    }
  }

  // Tab navigation
  const handleTabNavigation = (event: KeyboardEvent) => {
    if (!enableTabNavigation) return

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab: Move to previous element
        event.preventDefault()
        navigatePrevious()
      } else {
        // Tab: Move to next element
        event.preventDefault()
        navigateNext()
      }
    }
  }

  // Action keys
  const handleActionKeys = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && enableEnterKey) {
      event.preventDefault()
      const currentElement = focusableElements.value[navigationState.value.currentIndex]
      if (currentElement) {
        currentElement.click()
      }
    } else if (event.key === ' ' && enableSpaceKey) {
      event.preventDefault()
      const currentElement = focusableElements.value[navigationState.value.currentIndex]
      if (currentElement) {
        currentElement.click()
      }
    } else if (event.key === 'Escape' && enableEscapeKey) {
      event.preventDefault()
      handleEscapeKey()
    }
  }

  // Custom shortcuts
  const handleCustomShortcuts = (event: KeyboardEvent) => {
    const shortcut = shortcuts.find(
      s =>
        s.key === event.key &&
        s.shiftKey === event.shiftKey &&
        s.ctrlKey === event.ctrlKey &&
        s.altKey === event.altKey &&
        s.metaKey === event.metaKey,
    )

    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault()
      }
      shortcut.action()

      if (announceToScreenReader) {
        announceKeyboardNavigation(`Shortcut activated: ${shortcut.description}`)
      }
    }
  }

  // Escape key handler
  const handleEscapeKey = () => {
    // Default escape behavior - can be overridden
    if (containerRef.value) {
      containerRef.value.blur()
    }

    if (announceToScreenReader) {
      announceKeyboardNavigation('Navigation cancelled')
    }
  }

  // Screen reader announcements
  const announceKeyboardNavigation = (text: string) => {
    // Enable announcements by default for keyboard navigation
    const enableAnnouncements = true

    if (!enableAnnouncements) return

    // Create live region for announcements
    let liveRegion = document.getElementById('keyboard-navigation-live-region')

    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'keyboard-navigation-live-region'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
    }

    liveRegion.textContent = text

    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = ''
      }
    }, 1000)
  }

  // Main keyboard handler
  const handleKeydown = (event: KeyboardEvent) => {
    if (!isActive.value) return

    // Update last key pressed
    navigationState.value.lastKeyPressed = event.key
    navigationState.value.isNavigating = true

    // Handle different types of navigation
    handleArrowKeys(event)
    handleTabNavigation(event)
    handleActionKeys(event)
    handleCustomShortcuts(event)

    // Reset navigation state after a delay
    setTimeout(() => {
      navigationState.value.isNavigating = false
    }, 100)
  }

  // Focus management
  const focusCurrentElement = () => {
    if (focusableElements.value.length > 0) {
      const element = focusableElements.value[navigationState.value.currentIndex]
      if (element) {
        element.focus()
      }
    }
  }

  const focusElementAtIndex = (index: number) => {
    navigateToIndex(index)
  }

  // Element management
  const updateFocusableElements = (elements: HTMLElement[]) => {
    focusableElements.value = elements.filter(el => {
      // Check if element is actually focusable
      const tagName = el.tagName.toLowerCase()
      const type = (el as HTMLInputElement).type

      if (el.hasAttribute('disabled')) return false
      if (el.style.display === 'none' || el.style.visibility === 'hidden') return false
      if (el.tabIndex < 0) return false

      if (
        tagName === 'button' ||
        tagName === 'input' ||
        tagName === 'select' ||
        tagName === 'textarea'
      ) {
        return true
      }

      if (tagName === 'a' && el.hasAttribute('href')) {
        return true
      }

      if (el.hasAttribute('contenteditable')) {
        return true
      }

      return false
    })

    navigationState.value.totalItems = focusableElements.value.length

    // Reset current index if it's out of bounds
    if (navigationState.value.currentIndex >= focusableElements.value.length) {
      navigationState.value.currentIndex = 0
    }
  }

  // Lifecycle management
  const activate = (container: HTMLElement) => {
    if (isActive.value) return

    containerRef.value = container
    container.addEventListener('keydown', handleKeydown)

    // Get focusable elements
    const elements = Array.from(
      container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
      ),
    ) as HTMLElement[]

    updateFocusableElements(elements)

    isActive.value = true

    // Auto-focus if enabled
    if (autoFocus && focusableElements.value.length > 0) {
      focusCurrentElement()
    }
  }

  const deactivate = () => {
    if (!isActive.value) return

    if (containerRef.value) {
      containerRef.value.removeEventListener('keydown', handleKeydown)
    }

    isActive.value = false
    focusableElements.value = []
    navigationState.value = {
      currentIndex: 0,
      totalItems: 0,
      isNavigating: false,
      lastKeyPressed: '',
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    deactivate()
  })

  return {
    // State
    navigationState: navigationState,
    isActive: isActive,
    focusableElements: focusableElements,
    containerRef,

    // Navigation methods
    navigateToIndex,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    focusCurrentElement,
    focusElementAtIndex,

    // Element management
    updateFocusableElements,

    // Lifecycle
    activate,
    deactivate,

    // Utilities
    handleKeydown,
    announceKeyboardNavigation,
  }
}

// Utility functions for keyboard navigation
export const createKeyboardShortcut = (
  key: string,
  description: string,
  action: () => void,
  options: Partial<Omit<KeyboardShortcut, 'key' | 'description' | 'action'>> = {},
): KeyboardShortcut => {
  return {
    key,
    description,
    action,
    preventDefault: true,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    ...options,
  }
}

export const isKeyboardNavigationKey = (key: string): boolean => {
  const navigationKeys = [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'PageUp',
    'PageDown',
    'Tab',
    'Enter',
    ' ',
    'Escape',
  ]

  return navigationKeys.includes(key)
}

export const getKeyboardNavigationDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    ArrowUp: 'Navigate up',
    ArrowDown: 'Navigate down',
    ArrowLeft: 'Navigate left',
    ArrowRight: 'Navigate right',
    Home: 'Go to first item',
    End: 'Go to last item',
    PageUp: 'Go to previous page',
    PageDown: 'Go to next page',
    Tab: 'Navigate to next item',
    Enter: 'Activate item',
    ' ': 'Activate item',
    Escape: 'Cancel navigation',
  }

  return descriptions[key] || `Key: ${key}`
}
