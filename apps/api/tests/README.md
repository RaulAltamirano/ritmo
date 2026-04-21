# 🧪 RITMO API TEST SUITE - 2025

Test suite completo para la API de RITMO implementando las mejores prácticas de testing moderno.

## 📋 Especificaciones Implementadas

Este test suite está basado en las especificaciones del reporte `auth-module-test-specification.json` e incluye:

### ✅ Tests Implementados

#### 🔐 Authentication Flow Tests

- **AUTH-001**: User Registration - New User
- **AUTH-002**: User Login - Returning User
- **AUTH-003**: User Login - Suspicious Activity

#### 🔐 Session Management Tests

- **SESS-001**: Get User Sessions
- **SESS-002**: Session Consolidation
- **Session Security**: Ownership validation, expiration handling
- **Session Analytics**: Statistics and metadata

#### 🔒 Security Tests

- **SEC-001**: Brute Force Attack Prevention
- **SEC-002**: Session Hijacking Prevention
- **SEC-003**: Input Validation Security (SQL Injection, XSS)
- **SEC-004**: Rate Limiting
- **SEC-005**: Token Security

#### ⚠️ Error Handling Tests

- **ERR-001**: Invalid Credentials
- **ERR-002**: Validation Errors
- **ERR-003**: Server Errors
- **ERR-004**: Network and Timeout Errors
- **ERR-005**: API Response Structure

#### ⚡ Performance Tests

- **PERF-001**: Concurrent User Login
- **PERF-002**: Session Management Performance
- **PERF-003**: Database Connection Pool
- **PERF-004**: Memory Usage
- **PERF-005**: Throughput Testing

## 🚀 Comandos de Ejecución

### Setup Inicial

```bash
# Configurar base de datos de test con Docker
pnpm test:setup-db-docker

# O ejecutar tests completos con Docker
pnpm test:with-docker
```

### Ejecución de Tests

#### Tests Específicos

```bash
# Todos los tests
pnpm test

# Tests de autenticación básicos
pnpm test:auth:basic

# Tests de manejo de sesiones
pnpm test:auth:sessions

# Tests de seguridad
pnpm test:auth:security

# Tests de manejo de errores
pnpm test:auth:errors

# Tests de rendimiento
pnpm test:auth:performance

# Tests básicos de API
pnpm test:basic
```

#### Tests con Coverage

```bash
# Coverage completo
pnpm test:coverage

# Coverage solo de auth
pnpm test:coverage:auth

# Reporte JSON para CI
pnpm test:report

# Ejecución para CI
pnpm test:ci
```

#### Modo Watch

```bash
# Ejecutar tests en modo watch
pnpm test:watch
```

## 🏗️ Estructura de Tests

```
tests/
├── setup/
│   └── test-setup.ts          # Setup global de tests
├── auth/
│   ├── authentication.test.ts  # Tests básicos de auth
│   ├── session-management.test.ts  # Tests de sesiones
│   ├── security.test.ts       # Tests de seguridad
│   ├── error-handling.test.ts  # Tests de manejo de errores
│   └── performance.test.ts    # Tests de rendimiento
├── basic.test.ts              # Tests básicos de API
└── README.md                  # Este archivo
```

## 🔧 Configuración

### Variables de Entorno

```bash
# Base de datos de test
TEST_DATABASE_URL=postgresql://test:test@localhost:5434/ritmo_test

# Configuración de test
NODE_ENV=test
```

### Docker Setup

El script `setup-test-db-docker.sh` configura automáticamente:

- PostgreSQL 15 en puerto 5434
- Base de datos `ritmo_test`
- Usuario `test` con password `test`
- Migraciones de Prisma aplicadas

## 📊 Métricas de Coverage

Objetivo: **95%** de coverage en:

- Branches
- Functions
- Lines
- Statements

### Reportes Generados

- **HTML**: `coverage/`
- **JSON**: `coverage/test-results.json`
- **JUnit**: `coverage/junit.xml`

## 🛡️ Context-Aware Testing

Los tests implementan **Behavior-Driven Development (BDD)** con contextos específicos:

### User Journey Contexts

- **newUser**: Primer registro y onboarding
- **returningUser**: Usuario existente con sesiones previas
- **suspiciousUser**: Usuario con comportamiento inusual

### Security Contexts

- **normalFlow**: Flujo estándar de autenticación
- **highRiskFlow**: Medidas de seguridad mejoradas
- **attackFlow**: Bloqueo y alertas

### Device Contexts

- **desktop-chrome-windows**: Dispositivo conocido
- **known-device**: Dispositivo confiable
- **unknown-device**: Dispositivo desconocido

## 🔍 Assertions Implementadas

### Seguridad

- ✅ Validación de contraseñas
- ✅ Verificación de formato de email
- ✅ Verificación de unicidad de username
- ✅ Cumplimiento de rate limiting
- ✅ Verificación de autenticación
- ✅ Reset de intentos fallidos
- ✅ Consolidación de sesiones
- ✅ Nivel de confianza del dispositivo
- ✅ Actualización de timestamp de último login

### Validación

- ✅ Mensajes de error genéricos
- ✅ Sin revelación de información sensible
- ✅ Logging de intentos fallidos
- ✅ Rate limiting aplicado

## ⚡ Performance Benchmarks

### Objetivos de Rendimiento

- **Response Time**: < 500ms para login individual
- **Concurrent Users**: 100 usuarios concurrentes
- **Throughput**: > 200 req/sec
- **Error Rate**: < 5% bajo carga
- **Memory Usage**: < 50MB de incremento

### Métricas Monitoreadas

- Tiempo de respuesta promedio
- Tiempo de respuesta máximo
- Throughput (requests/segundo)
- Uso de memoria
- Tasa de errores

## 🚨 Alertas y Monitoreo

### Métricas Clave

- Tasa de éxito de autenticación
- Intentos de login fallidos
- Tasa de creación de sesiones
- Frecuencia de eventos de seguridad
- Percentiles de tiempo de respuesta

### Alertas Configuradas

- **High Failed Login Rate**: > 10 por minuto
- **Account Lockout**: Cuenta bloqueada
- **Security Event**: Evento de seguridad detectado

## 🔄 CI/CD Integration

### Pre-Deployment Checklist

- ✅ Todos los tests pasando
- ✅ Code coverage > 95%
- ✅ Security scan limpio
- ✅ Performance benchmarks cumplidos

### Post-Deployment Checklist

- ✅ Health checks pasando
- ✅ Alertas de monitoreo configuradas
- ✅ Procedimientos de backup verificados
- ✅ Plan de rollback probado

## 🐛 Troubleshooting

### Problemas Comunes

#### Base de datos no conecta

```bash
# Verificar que Docker esté corriendo
docker ps

# Reiniciar servicios de test
pnpm test:setup-db-docker
```

#### Tests fallan por timeout

```bash
# Aumentar timeout en vitest.config.ts
testTimeout: 60000
```

#### Coverage bajo

```bash
# Ejecutar tests específicos
pnpm test:coverage:auth

# Verificar archivos excluidos en vitest.config.ts
```

### Logs Útiles

```bash
# Ver logs de Docker
docker-compose -f docker-compose.test.yml logs -f

# Ver logs de tests
pnpm test --reporter=verbose
```

## 📈 Mejoras Futuras

### Próximas Implementaciones

- [ ] Tests de integración con servicios externos
- [ ] Tests de carga con Artillery/K6
- [ ] Tests de accesibilidad
- [ ] Tests de compatibilidad de navegadores
- [ ] Tests de migración de base de datos

### Optimizaciones

- [ ] Paralelización de tests
- [ ] Caching de fixtures
- [ ] Tests incrementales
- [ ] Reportes de performance automáticos

---

**🎯 Objetivo**: Mantener un test suite robusto que garantice la calidad, seguridad y rendimiento de la API de RITMO.
