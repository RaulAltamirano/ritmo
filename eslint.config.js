/**
 * ESLint Configuration Moderna 2025 - Proyecto Ritmo
 * Usando las mejores prácticas y configuraciones más modernas
 */

import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  // Configuración base recomendada de JavaScript
  js.configs.recommended,

  // Configuración base moderna 2025
  {
    name: 'base-modern-2025',
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
      },
    },
    rules: {
      // === COMPLEJIDAD Y MANTENIBILIDAD ===
      'complexity': ['warn', 10], // Complejidad ciclomática máxima
      'max-depth': ['warn', 4], // Profundidad máxima de anidamiento
      'max-lines-per-function': ['warn', 50], // Líneas máximas por función
      'max-statements': ['warn', 20], // Declaraciones máximas por función
      'max-lines': ['warn', 300], // Líneas máximas por archivo
      'max-params': ['warn', 4], // Parámetros máximos por función
      'max-nested-callbacks': ['warn', 3], // Callbacks anidados máximos
      
      // === CALIDAD DE CÓDIGO MODERNA ===
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-unused-vars': 'off', // Usamos la versión de TypeScript
      'no-undef': 'off', // TypeScript maneja esto mejor
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'object-shorthand': 'error',
      'prefer-destructuring': ['error', { object: true, array: false }],
      
      // === PERFORMANCE Y OPTIMIZACIÓN ===
      'no-loop-func': 'error',
      'no-new-object': 'error',
      'no-new-wrappers': 'error',
      'no-array-constructor': 'error',
      'prefer-spread': 'error',
      'prefer-rest-params': 'error',
      
      // === SEGURIDAD ===
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-alert': 'warn',
      
      // === ESTILO Y LEGIBILIDAD ===
      'camelcase': ['error', { properties: 'never' }],
      'consistent-return': 'error',
      'curly': ['error', 'all'],
      'eqeqeq': ['error', 'always'],
      'no-else-return': 'error',
      'no-empty': 'warn',
      'no-magic-numbers': ['warn', { 
        ignore: [0, 1, -1], 
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true 
      }],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'no-trailing-spaces': 'error',
      'no-unneeded-ternary': 'error',
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'space-before-blocks': 'error',
      'space-before-function-paren': ['error', 'never'],
      'space-in-parens': 'error',
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
    },
  },

  // Configuración para archivos TypeScript y JavaScript
  {
    name: 'ts-js-files',
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2025,
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // === TYPESCRIPT ESPECÍFICO 2025 ===
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
          'ts-check': false,
          minimumDescriptionLength: 3,
        },
      ],
      
      // === TYPESCRIPT MODERNO 2025 ===
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
    },
  },

  // Configuración específica para APIs/Backend
  {
    name: 'api-specific',
    files: ['apps/api/**/*.{ts,js}'],
    rules: {
      'no-process-exit': 'error', // Evitar process.exit() en APIs
      'no-sync': 'warn', // Preferir métodos async
      'no-useless-catch': 'error',
      'handle-callback-err': 'error',
      'no-path-concat': 'error',
      'no-new-require': 'error',
      'no-mixed-requires': 'error',
      'no-process-env': 'warn', // Usar configuraciones centralizadas
      'no-buffer-constructor': 'error',
      'no-caller': 'error',
      'no-iterator': 'error',
      'no-proto': 'error',
      'no-with': 'error',
      'radix': 'error', // Siempre especificar radix en parseInt
    },
  },

  // Configuración específica para Frontend/UI
  {
    name: 'frontend-specific',
    files: ['apps/web/**/*.{ts,js,vue}', 'packages/ui/**/*.{ts,js,vue}'],
    rules: {
      'no-alert': 'error', // No usar alert en producción
      'no-warning-comments': 'warn',
    },
  },

  // Configuración para archivos Vue
  {
    name: 'vue-files',
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 2025,
        sourceType: 'module',
      },
    },
    plugins: {
      vue,
    },
    rules: {
      // === VUE 3 ESPECÍFICO ===
      'vue/no-unused-vars': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-explicit-emits': 'error',
      'vue/require-prop-types': 'error',
      'vue/require-valid-default-prop': 'error',
      'vue/no-mutating-props': 'error',
      'vue/no-ref-as-operand': 'error',
      'vue/no-unused-refs': 'error',
      'vue/prefer-define-options': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/require-toggle-inside-transition': 'error',
      'vue/valid-define-emits': 'error',
      'vue/valid-define-props': 'error',
      
      // === VUE PERFORMANCE ===
      'vue/no-template-key': 'error',
      'vue/no-v-text-v-html-on-component': 'error',
      'vue/prefer-import-from-vue': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-useless-mustaches': 'error',
      
      // === VUE COMPOSITION API ===
      'vue/no-dupe-keys': 'error',
      'vue/no-duplicate-attributes': 'error',
      'vue/no-reserved-component-names': 'error',
      'vue/no-reserved-props': 'error',
      'vue/no-template-shadow': 'error',
      'vue/no-unused-components': 'warn',
      'vue/no-use-v-if-with-v-for': 'error',
    },
  },

  // Configuración de archivos a ignorar
  {
    name: 'ignore-files',
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/coverage/**',
      '**/build/**',
      '**/.turbo/**',
      '**/public/**',
      '**/prisma/migrations/**',
      '**/logs/**',
      '**/storybook-static/**',
      '**/.storybook/**',
      '**/packages/ui/storybook-static/**',
      '**/packages/ui/public/**',
      '**/apps/api/coverage/**',
      '**/yarn.lock',
      '**/pnpm-lock.yaml',
      '**/package-lock.json',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/vite-inject-mocker-entry.js',
      '**/generated/**',
      '**/.env*',
      '**/docker/**',
      '**/test-specs/**',
    ],
  },

  // Configuración Prettier (debe ir al final para desactivar reglas conflictivas)
  prettier,
]