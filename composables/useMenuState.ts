import { ref, provide, inject } from 'vue'

const MENU_STATE_KEY = Symbol('menu-state')

export function useMenuState() {
  const openMenuId = ref<string | null>(null)

  const openMenu = (id: string) => {
    openMenuId.value = id
  }

  const closeMenu = () => {
    openMenuId.value = null
  }

  const toggleMenu = (id: string) => {
    if (openMenuId.value === id) {
      closeMenu()
    } else {
      openMenu(id)
    }
  }

  const isMenuOpen = (id: string) => {
    return openMenuId.value === id
  }

  return {
    openMenuId,
    openMenu,
    closeMenu,
    toggleMenu,
    isMenuOpen
  }
}

export function provideMenuState() {
  const menuState = useMenuState()
  provide(MENU_STATE_KEY, menuState)
  return menuState
}

export function injectMenuState() {
  const menuState = inject(MENU_STATE_KEY)
  if (!menuState) {
    throw new Error('useMenuState must be provided by a parent component')
  }
  return menuState
} 