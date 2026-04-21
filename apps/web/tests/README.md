# 🧪 Frontend Testing Guide

Este directorio contiene todos los tests del frontend para el sistema de autenticación de Ritmo.

## 📁 Estructura de Tests

```
tests/
├── setup.ts                    # Configuración global de tests
├── composables/
│   └── useAuth.test.ts         # Tests para el composable de autenticación
├── stores/
│   └── auth.test.ts            # Tests para el store de autenticación
├── pages/
│   ├── login.test.ts           # Tests para la página de login
│   └── register.test.ts        # Tests para la página de registro
└── utils/
    └── validation.test.ts      # Tests para esquemas de validación
```

## 🚀 Comandos de Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests una vez
npm run test:run

# Ejecutar tests con UI
npm run test:ui

# Ejecutar tests con coverage
npm run test:coverage
```

## 📊 Cobertura de Tests

### Composable Tests (`useAuth.test.ts`)

- ✅ Estado inicial de autenticación
- ✅ Funcionalidad de login (éxito y fallo)
- ✅ Funcionalidad de registro (éxito y fallo)
- ✅ Funcionalidad de logout
- ✅ Inicialización de autenticación
- ✅ Gestión de perfil

### Store Tests (`auth.test.ts`)

- ✅ Estado inicial del store
- ✅ Gestión de estado (setUser, clearAuth, etc.)
- ✅ Funcionalidad de login con API
- ✅ Funcionalidad de registro con API
- ✅ Funcionalidad de logout con API
- ✅ Actualización de datos de usuario
- ✅ Gestión de errores

### Page Tests (`login.test.ts`, `register.test.ts`)

- ✅ Renderizado de estructura de página
- ✅ Validación de formularios
- ✅ Envío de formularios (éxito y fallo)
- ✅ Estados de carga
- ✅ Manejo de errores
- ✅ Navegación
- ✅ Accesibilidad

### Validation Tests (`validation.test.ts`)

- ✅ Esquemas de login
- ✅ Esquemas de registro
- ✅ Esquemas de actualización de perfil
- ✅ Esquemas de cambio de contraseña
- ✅ Casos extremos y edge cases

## 🛠️ Configuración

### Vitest Config (`vitest.config.ts`)

- Entorno: jsdom para testing de DOM
- Plugins: Vue 3 support
- Coverage: v8 provider con reportes HTML, JSON y texto
- Aliases: Configurados para imports de @ritmo/ui y @ritmo/shared

### Setup Global (`tests/setup.ts`)

- Mocks de composables de Nuxt
- Mocks de Pinia
- Mocks de APIs del navegador (localStorage, sessionStorage, fetch)
- Mocks de observadores (IntersectionObserver, ResizeObserver)

## 🎯 Mejores Prácticas

### Estructura de Tests

```typescript
describe('🔐 Component Name', () => {
  describe('Feature', () => {
    it('should do something', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Mocks

- Usar `vi.mock()` para mocks de módulos
- Usar `vi.spyOn()` para mocks de métodos específicos
- Usar `vi.fn()` para funciones mock

### Assertions

- Usar `expect().toBe()` para valores primitivos
- Usar `expect().toEqual()` para objetos
- Usar `expect().toHaveBeenCalled()` para mocks
- Usar `expect().toContain()` para strings

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de importación de módulos**
   - Verificar que los aliases estén configurados en `vitest.config.ts`
   - Usar imports relativos si es necesario

2. **Error de mocks de Nuxt**
   - Verificar que los mocks estén en `tests/setup.ts`
   - Usar `vi.mocked()` para tipos TypeScript

3. **Error de DOM**
   - Verificar que jsdom esté configurado
   - Usar stubs para componentes de Nuxt

### Debugging

```bash
# Ejecutar tests con debug
npm run test -- --reporter=verbose

# Ejecutar test específico
npm run test -- useAuth.test.ts
```

## 📈 Métricas de Calidad

- **Cobertura de Código**: >90%
- **Tests Unitarios**: 100% de funciones críticas
- **Tests de Integración**: Flujos completos de autenticación
- **Tests de Accesibilidad**: Formularios y navegación

## 🔄 Mantenimiento

### Agregar Nuevos Tests

1. Crear archivo en la estructura apropiada
2. Seguir el patrón de naming: `*.test.ts`
3. Usar describe blocks organizados
4. Agregar mocks necesarios en setup.ts

### Actualizar Tests Existentes

1. Mantener compatibilidad con cambios de API
2. Actualizar mocks cuando sea necesario
3. Verificar que todos los tests pasen
4. Actualizar documentación si es necesario
