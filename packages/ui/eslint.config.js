/**
 * ESLint Configuration UI Package - Proyecto Ritmo
 * Configuración básica y compatible para componentes UI
 */

import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import storybook from 'eslint-plugin-storybook'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  js.configs.recommended,

  // Configuración base para archivos JS/TS
  {
    name: 'ui-base-2025',
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // === COMPLEJIDAD Y MANTENIBILIDAD PARA UI ===
      'complexity': ['warn', 8], // UI debe ser menos compleja
      'max-depth': ['warn', 3], // Menos anidamiento en UI
      'max-lines-per-function': ['warn', 40], // Funciones más cortas en UI
      'max-statements': ['warn', 15], // Menos declaraciones en UI
      'max-lines': ['warn', 250], // Archivos más cortos en UI
      'max-params': ['warn', 3], // Menos parámetros en UI
      'max-nested-callbacks': ['warn', 2], // Menos callbacks en UI
      
      // === CALIDAD DE CÓDIGO ===
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'object-shorthand': 'error',
      'prefer-destructuring': ['error', { object: true, array: false }],
      
      // === PERFORMANCE ===
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
      'no-alert': 'error',
      
      // === ESTILO ===
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
  
  // Configuración para archivos Vue
  {
    name: 'vue-ui-2025',
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2025,
        sourceType: 'module',
      },
    },
    plugins: {
      vue
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
      
      // === VUE ACCESIBILIDAD ===
      'vue/no-multiple-template-root': 'off', // Vue 3 permite múltiples roots
      'vue/no-v-model-argument': 'error',
      'vue/no-v-for-template-key': 'error',
      'vue/no-v-for-template-key-on-child': 'error',
      
      // === VUE ESTILO ===
      'vue/component-tags-order': ['error', {
        order: ['script', 'template', 'style']
      }],
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits', 'defineExpose']
      }],
      'vue/html-comment-content-spacing': 'error',
      'vue/html-comment-indent': 'error',
      'vue/html-indent': ['error', 2],
      'vue/html-quotes': ['error', 'double'],
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }],
    },
  },
  
  // Configuración Prettier
  prettier,
  
  // Configuración Storybook
  ...storybook.configs['flat/recommended'],
]