'use strict'

/**
 * Extensión de tema Tailwind compartida por apps/web y apps/landing (producto Ritmo).
 * El preset (`tailwind-preset.js`) sigue orientado a @ritmo/ui / Storybook (primario azul); esta capa sobrescribe `primary` y demás tokens de marca para la app.
 *
 * Extensión `.cjs` porque `@ritmo/config` define `"type": "module"` y los `.js` se interpretan como ESM.
 *
 * @type {import('tailwindcss').Config['theme']['extend']}
 */
module.exports = {
  colors: {
    // ─── Semantic tokens (CSS-variable-backed) ──────────────────────────────
    // These automatically switch between light and dark via the CSS variables
    // defined in tailwind.css. Use them in new components instead of dark: variants.
    //   bg-surface         → card / panel background
    //   bg-surface-raised  → dropdown / tooltip background
    //   bg-canvas          → page background
    //   text-content       → primary text
    //   text-content-secondary → secondary/help text
    //   text-content-muted → placeholder / disabled text
    //   border-default     → standard border
    //   border-strong      → focused / emphasized border
    canvas: 'var(--color-canvas)',
    surface: {
      DEFAULT: 'var(--color-surface)',
      raised: 'var(--color-surface-raised)',
      overlay: 'var(--color-surface-overlay)',
    },
    content: {
      DEFAULT: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      muted: 'var(--color-text-muted)',
      disabled: 'var(--color-text-disabled)',
    },
    outline: {
      DEFAULT: 'var(--color-border)',
      strong: 'var(--color-border-strong)',
    },
    brand: {
      DEFAULT: 'var(--color-brand)',
      subtle: 'var(--color-brand-subtle)',
      text: 'var(--color-brand-text)',
    },
    // ─── Primitive palette ──────────────────────────────────────────────────
    primary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      950: '#042f2e',
    },
    accent: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
  },
  fontFamily: {
    sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
    display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  boxShadow: {
    // Token-backed: opacity deepens automatically in dark mode via CSS variables
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    // Legacy aliases kept for backward compatibility
    soft: 'var(--shadow-sm)',
    medium: 'var(--shadow-md)',
    large: 'var(--shadow-lg)',
  },
  animation: {
    'fade-in': 'fadeIn 0.3s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-out',
    'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    'bounce-soft': 'bounce 1s infinite',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
  },
}
