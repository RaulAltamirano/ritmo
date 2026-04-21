# Navigation Components

This directory contains reusable navigation components that can be used across different applications in the monorepo.

## Components

### BaseNavbar.vue

A flexible navbar component that provides the basic structure for navigation bars.

**Props:**

- `ariaLabel?: string` - Accessibility label for the navigation
- `showMobileMenu?: boolean` - Controls mobile menu visibility

**Slots:**

- `logo` - Logo/brand content
- `brand` - Brand text and description
- `nav-items` - Main navigation items
- `actions` - Right-side actions (user menu, dark mode, etc.)
- `mobile-menu` - Mobile menu content

**Usage:**

```vue
<BaseNavbar :show-mobile-menu="showMobileMenu">
  <template #logo>
    <img src="/logo.svg" alt="App" />
  </template>
  
  <template #brand>
    <h1>My App</h1>
    <p>App description</p>
  </template>
  
  <template #nav-items>
    <BaseNavItem
      path="/dashboard"
      label="Dashboard"
      :icon="Home"
      :is-active="currentPath === '/dashboard'"
    />
  </template>
  
  <template #actions>
    <!-- Your actions here -->
  </template>
</BaseNavbar>
```

### BaseNavItem.vue

A navigation item component for use within navbars.

**Props:**

- `path: string` - Navigation path
- `label: string` - Display label
- `icon: any` - Icon component
- `isActive?: boolean` - Whether this item is currently active

**Usage:**

```vue
<BaseNavItem
  path="/dashboard"
  label="Dashboard"
  :icon="Home"
  :is-active="currentPath === '/dashboard'"
/>
```

### BaseNavDropdown.vue

A dropdown menu component for navigation.

**Props:**

- `label: string` - Dropdown label
- `icon: any` - Icon component
- `isOpen: boolean` - Whether dropdown is open
- `ariaLabel?: string` - Accessibility label

**Events:**

- `toggle` - Emitted when dropdown should toggle

**Usage:**

```vue
<BaseNavDropdown
  label="More"
  :icon="MoreHorizontal"
  :is-open="showMoreMenu"
  @toggle="toggleMoreMenu"
>
  <!-- Dropdown content -->
  <NuxtLink to="/settings">Settings</NuxtLink>
</BaseNavDropdown>
```

## Migration Strategy

These components were created to refactor the original `MainNavbar.vue` from the web app into reusable pieces:

1. **BaseNavbar** - Contains the structure and styling
2. **BaseNavItem** - Individual navigation items
3. **BaseNavDropdown** - Dropdown menus
4. **MainNavbar** (web app) - Contains business logic and app-specific content

This approach allows:

- ✅ Reusability across applications
- ✅ Separation of concerns
- ✅ Easier testing and maintenance
- ✅ Consistent design system
