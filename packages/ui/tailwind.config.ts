import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    // Include parent project components for development
    '../../apps/web/components/**/*.{vue,js,ts,jsx,tsx}',
    '../../apps/landing/src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  presets: [
    require('../../packages/config/tailwind-preset.js')
  ],
  theme: {
    extend: {
      // UI-specific theme extensions
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bar-pulse': 'barPulse 1.5s ease-in-out infinite',
        'content-float': 'contentFloat 4s ease-in-out infinite',
        'button-pulse': 'buttonPulse 2s ease-in-out infinite',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        barPulse: {
          '0%, 100%': { 
            opacity: '0.4',
            transform: 'scaleY(0.8)'
          },
          '50%': { 
            opacity: '1',
            transform: 'scaleY(1.3)'
          },
        },
        contentFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        buttonPulse: {
          '0%, 100%': { 
            opacity: '0.9',
            transform: 'scale(1)'
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.02)'
          },
        },
      },
      // Component-specific shadows
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      // Component-specific transitions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Typography tokens integration
      fontSize: {
        'theme-xs': 'var(--font-size-xs)',
        'theme-sm': 'var(--font-size-sm)',
        'theme-base': 'var(--font-size-base)',
        'theme-lg': 'var(--font-size-lg)',
        'theme-xl': 'var(--font-size-xl)',
        'theme-2xl': 'var(--font-size-2xl)',
        'theme-3xl': 'var(--font-size-3xl)',
        'theme-4xl': 'var(--font-size-4xl)',
        'theme-5xl': 'var(--font-size-5xl)',
        'theme-6xl': 'var(--font-size-6xl)',
      },
      fontWeight: {
        'theme-thin': 'var(--font-weight-thin)',
        'theme-light': 'var(--font-weight-light)',
        'theme-normal': 'var(--font-weight-normal)',
        'theme-medium': 'var(--font-weight-medium)',
        'theme-semibold': 'var(--font-weight-semibold)',
        'theme-bold': 'var(--font-weight-bold)',
        'theme-extrabold': 'var(--font-weight-extrabold)',
        'theme-black': 'var(--font-weight-black)',
      },
      lineHeight: {
        'theme-none': 'var(--line-height-none)',
        'theme-tight': 'var(--line-height-tight)',
        'theme-snug': 'var(--line-height-snug)',
        'theme-normal': 'var(--line-height-normal)',
        'theme-relaxed': 'var(--line-height-relaxed)',
        'theme-loose': 'var(--line-height-loose)',
      },
      letterSpacing: {
        'theme-tighter': 'var(--letter-spacing-tighter)',
        'theme-tight': 'var(--letter-spacing-tight)',
        'theme-normal': 'var(--letter-spacing-normal)',
        'theme-wide': 'var(--letter-spacing-wide)',
        'theme-wider': 'var(--letter-spacing-wider)',
        'theme-widest': 'var(--letter-spacing-widest)',
      },
    },
  },
  plugins: [
    // UI-specific plugins can be added here
  ],
}

export default config
