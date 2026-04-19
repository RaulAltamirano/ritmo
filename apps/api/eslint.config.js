/**
 * ESLint Configuration API - Proyecto Ritmo
 * Configuración específica para el backend/API con mejores prácticas 2025
 */

import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,

  // Configuración específica para APIs/Backend
  {
    name: 'api-backend-2025',
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2025,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // === COMPLEJIDAD Y MANTENIBILIDAD ===
      'complexity': ['warn', 12], // API puede ser más compleja
      'max-depth': ['warn', 5], // APIs pueden tener más anidamiento
      'max-lines-per-function': ['warn', 60], // Funciones de API más largas
      'max-statements': ['warn', 25], // Más declaraciones en APIs
      'max-lines': ['warn', 400], // Archivos de API más largos
      'max-params': ['warn', 5], // APIs pueden tener más parámetros
      'max-nested-callbacks': ['warn', 4], // Más callbacks en APIs
      
      // === TYPESCRIPT ESPECÍFICO PARA API ===
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
      
      // === REGLAS ESPECÍFICAS PARA API ===
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
      
      // === CALIDAD DE CÓDIGO ===
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn', // APIs pueden necesitar logging
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-unused-vars': 'off', // Usamos la versión de TypeScript
      'no-undef': 'off', // TypeScript maneja esto mejor
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

  // Configuración de archivos a ignorar (específico para API)
  {
    name: 'ignore-files',
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/build/**',
      '**/.turbo/**',
      '**/logs/**',
      '**/prisma/migrations/**',
      '**/docker/**',
      '**/test-specs/**',
      '**/generated/**',
      '**/.env*',
    ],
  },

  // Configuración Prettier (debe ir al final para desactivar reglas conflictivas)
  prettier,
]
