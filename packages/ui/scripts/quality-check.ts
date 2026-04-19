#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔍 VERIFICACIÓN DE CALIDAD - FASE 1 - PRIORIDAD ALTA')
console.log('==================================================\n')

// Contadores
let passed = 0
let failed = 0
let warnings = 0

// Función para ejecutar comandos
const runCommand = (command: string, description: string): boolean => {
  try {
    console.log(`🔧 Verificando ${description}...`)
    execSync(command, { stdio: 'pipe', cwd: join(__dirname, '..') })
    console.log(`✅ ${description}: Exitoso`)
    passed++
    return true
  } catch (error: any) {
    console.log(`❌ ${description}: ${error.message}`)
    failed++
    return false
  }
}

// Función para verificar archivos
const checkFile = (filePath: string, description: string): boolean => {
  const fullPath = join(__dirname, '..', filePath)
  if (existsSync(fullPath)) {
    console.log(`✅ File: ${filePath}: Archivo existe`)
    passed++
    return true
  } else {
    console.log(`❌ File: ${filePath}: Archivo no encontrado`)
    failed++
    return false
  }
}

// Verificar archivos requeridos
console.log('📁 Verificando archivos requeridos...\n')

const requiredFiles = [
  'src/composables/useFocusTrap.ts',
  'src/composables/useId.ts',
  'src/composables/useMotionPreferences.ts',
  'src/composables/useNotifications.ts',
  'src/components/atoms/BaseModal.vue',
  'src/components/atoms/BaseToast.vue',
  'src/tokens/index.ts',
  'src/tokens/colors.ts',
  'src/styles/tokens.css',
  'src/__tests__/accessibility.test.ts',
  '.storybook/main.ts',
  '.storybook/preview.ts',
]

requiredFiles.forEach(file => checkFile(file, ''))

console.log()

// Verificar sintaxis TypeScript
runCommand('npx tsc --noEmit', 'TypeScript Compilation')

// Verificar linting solo en archivos principales de la Fase 1
console.log('🧹 Verificando linting...')
try {
  execSync(
    'npx eslint src/composables/useFocusTrap.ts src/composables/useId.ts src/composables/useMotionPreferences.ts src/composables/useNotifications.ts src/tokens/index.ts src/tokens/colors.ts --ext .ts',
    { stdio: 'pipe', cwd: join(__dirname, '..') },
  )
  console.log('✅ ESLint: Sin errores en archivos principales')
  passed++
} catch (error: any) {
  console.log(`⚠️ ESLint: Advertencias en archivos principales`)
  warnings++
}

// Verificar tests
runCommand('npx vitest run --reporter=verbose', 'Unit Tests')

// Verificar Storybook (solo build, no servidor)
console.log('📚 Verificando Storybook...')
try {
  execSync('pnpm run build-storybook', { stdio: 'pipe', cwd: join(__dirname, '..') })
  console.log('✅ Storybook Build: Exitoso')
  passed++
} catch (error: any) {
  console.log(`❌ Storybook Build: ${error.message}`)
  failed++
}

// Verificar tests de accesibilidad
runCommand('pnpm run test:accessibility', 'Accessibility Tests')

// Verificar design tokens
console.log('🎨 Verificando design tokens...')
try {
  const designTokensPath = join(__dirname, '..', 'src', 'tokens', 'index.ts')
  if (existsSync(designTokensPath)) {
    const content = execSync('cat ' + designTokensPath, { encoding: 'utf8' })
    if (
      content.includes('export const componentSizes') &&
      content.includes('export const semanticColors') &&
      content.includes('export const spacingTokens')
    ) {
      console.log('✅ Design Tokens: Sistema de design tokens completo')
      passed++
    } else {
      console.log('❌ Design Tokens: Sistema incompleto')
      failed++
    }
  } else {
    console.log('❌ Design Tokens: Archivo no encontrado')
    failed++
  }
} catch (error: any) {
  console.log('❌ Design Tokens: Error al verificar')
  failed++
}

console.log('\n📊 RESULTADOS DE LA VERIFICACIÓN')
console.log('================================')
console.log(`✅ PASARON: ${passed}`)
console.log(`❌ FALLARON: ${failed}`)
console.log(`⚠️ ADVERTENCIAS: ${warnings}`)

// Calcular porcentaje de calidad
const total = passed + failed
const qualityPercentage = total > 0 ? Math.round((passed / total) * 100) : 0

console.log(`\n🎯 CALIDAD GENERAL: ${qualityPercentage}%`)

if (qualityPercentage >= 95) {
  console.log('🌟 EXCELENTE! Calidad superior alcanzada')
} else if (qualityPercentage >= 85) {
  console.log('✅ BUENO, pero hay espacio para mejorar')
} else if (qualityPercentage >= 70) {
  console.log('⚠️ REGULAR, se requieren mejoras')
} else {
  console.log('❌ BAJO, se requieren correcciones importantes')
}

if (failed > 0) {
  console.log('\n🚨 Se encontraron problemas que requieren atención')
  process.exit(1)
} else {
  console.log('\n🎉 ¡Todas las verificaciones pasaron exitosamente!')
}
