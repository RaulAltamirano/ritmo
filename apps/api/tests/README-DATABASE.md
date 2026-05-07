# 🧪 Test Setup with Real Database - RITMO API 2025

## 📋 Overview

Este setup de tests utiliza una **base de datos real de PostgreSQL** para proporcionar tests más valiosos y realistas. Los tests simulan interacciones reales con la base de datos, incluyendo:

- ✅ **Creación y eliminación de datos reales**
- ✅ **Validación de esquemas de base de datos**
- ✅ **Pruebas de integración completas**
- ✅ **Verificación de constraints y relaciones**
- ✅ **Tests de migraciones**

## 🚀 Quick Start

### Opción 1: Setup Automático (Recomendado)

```bash
# Configurar base de datos y ejecutar todos los tests
pnpm test:with-db
```

### Opción 2: Setup Manual

```bash
# 1. Configurar solo la base de datos
pnpm test:setup-db

# 2. Ejecutar tests
pnpm test:full
```

## 🔧 Requirements

### PostgreSQL

**Ubuntu/Debian:**

```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**Arch Linux:**

```bash
sudo pacman -S postgresql
sudo systemctl start postgresql
```

### Verificar Instalación

```bash
# Verificar que PostgreSQL está ejecutándose
pg_isready

# Verificar versión
psql --version
```

## 📊 Test Database Configuration

### Variables de Entorno

```bash
# Base de datos de test
TEST_DATABASE_URL="postgresql://test:test@localhost:5432/ritmo_test"

# Configuración de JWT para tests
JWT_ACCESS_SECRET="test-access-secret-key-2025"
JWT_REFRESH_SECRET="test-refresh-secret-key-2025"

# Configuración de seguridad
BCRYPT_SALT_ROUNDS="10"
MAX_FAILED_LOGIN_ATTEMPTS="5"
LOCKOUT_DURATION_MINUTES="15"
```

### Estructura de Base de Datos

El script automáticamente:

1. **Crea usuario de test** (`test` con password `test`)
2. **Crea base de datos** (`ritmo_test`)
3. **Ejecuta migraciones** de Prisma
4. **Configura permisos** necesarios

## 🧪 Running Tests

### Tests Básicos (Sin Base de Datos)

```bash
# Tests básicos con mocks
pnpm test:basic

# Tests de autenticación con mocks
pnpm test:auth:flow
```

### Tests Completos (Con Base de Datos)

```bash
# Todos los tests con base de datos real
pnpm test:with-db

# Tests específicos con base de datos
pnpm test:auth:flow    # Tests de autenticación
pnpm test:auth:security # Tests de seguridad
pnpm test:auth:sessions # Tests de sesiones
```

## 🔄 Database Lifecycle

### Setup (beforeAll)

- ✅ Verifica PostgreSQL
- ✅ Crea base de datos si no existe
- ✅ Ejecuta migraciones
- ✅ Configura conexión Prisma

### Per-Test (beforeEach)

- ✅ Limpia todas las tablas
- ✅ Resetea mocks
- ✅ Prepara contexto de test

### Cleanup (afterAll)

- ✅ Desconecta Prisma
- ✅ Cierra servidor de test

## 📈 Benefits of Real Database Tests

### vs Mocks

| Aspecto                    | Mocks       | Real Database |
| -------------------------- | ----------- | ------------- |
| **Realismo**               | ❌ Simulado | ✅ Real       |
| **Validación de Esquemas** | ❌ No       | ✅ Sí         |
| **Constraints**            | ❌ No       | ✅ Sí         |
| **Relaciones**             | ❌ No       | ✅ Sí         |
| **Migraciones**            | ❌ No       | ✅ Sí         |
| **Performance**            | ✅ Rápido   | ⚠️ Más lento  |
| **Setup**                  | ✅ Simple   | ⚠️ Complejo   |

### Casos de Uso Ideales

**Real Database Tests:**

- ✅ Validación de esquemas
- ✅ Tests de integración
- ✅ Verificación de constraints
- ✅ Tests de migraciones
- ✅ Tests de relaciones complejas

**Mock Tests:**

- ✅ Tests unitarios rápidos
- ✅ Tests de lógica de negocio
- ✅ Tests de validación
- ✅ Tests de mocks de servicios externos

## 🛠️ Troubleshooting

### Error: PostgreSQL no está ejecutándose

```bash
# Ubuntu/Debian
sudo systemctl start postgresql

# macOS
brew services start postgresql

# Arch
sudo systemctl start postgresql
```

### Error: Usuario no tiene permisos

```bash
# Conectar como postgres y crear usuario
sudo -u postgres psql
CREATE USER test WITH PASSWORD 'test';
GRANT ALL PRIVILEGES ON DATABASE ritmo_test TO test;
\q
```

### Error: Base de datos no existe

```bash
# Crear base de datos manualmente
sudo -u postgres createdb ritmo_test
```

### Error: Migraciones fallan

```bash
# Regenerar migraciones
npx prisma migrate reset --force
npx prisma migrate dev
```

## 📝 Test Examples

### Test con Base de Datos Real

```typescript
describe('User Registration with Real Database', () => {
  it('should create user in database', async () => {
    // Given: User registration data
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      username: 'testuser',
    }

    // When: User registers
    const response = await request(testContext.app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201)

    // Then: User exists in database
    const user = await testContext.prisma.user.findUnique({
      where: { email: userData.email },
    })

    expect(user).toBeTruthy()
    expect(user.email).toBe(userData.email)
  })
})
```

### Test de Relaciones

```typescript
describe('User Sessions with Real Database', () => {
  it('should create session for user', async () => {
    // Given: User exists
    const user = await testContext.prisma.user.create({
      data: testFixtures.users[0],
    })

    // When: User logs in
    const response = await request(testContext.app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'SecurePass123!',
      })
      .expect(200)

    // Then: Session exists in database
    const session = await testContext.prisma.userSession.findFirst({
      where: { userId: user.id },
    })

    expect(session).toBeTruthy()
    expect(session.userId).toBe(user.id)
  })
})
```

## 🎯 Best Practices

### 1. Usar Transacciones

```typescript
beforeEach(async () => {
  await testContext.prisma.$transaction(async tx => {
    // Setup test data
    await tx.user.create({ data: testUser })
  })
})
```

### 2. Limpiar Datos

```typescript
afterEach(async () => {
  await testContext.prisma.user.deleteMany()
  await testContext.prisma.userSession.deleteMany()
})
```

### 3. Usar Fixtures

```typescript
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'SecurePass123!',
}
```

### 4. Verificar Constraints

```typescript
it('should enforce unique email constraint', async () => {
  // Create first user
  await testContext.prisma.user.create({ data: testUser })

  // Attempt to create duplicate
  await expect(testContext.prisma.user.create({ data: testUser })).rejects.toThrow()
})
```

## 📊 Performance Considerations

### Optimizaciones

1. **Usar transacciones** para rollback automático
2. **Limpiar datos** después de cada test
3. **Usar índices** en campos de búsqueda frecuente
4. **Configurar connection pool** apropiadamente

### Monitoreo

```bash
# Verificar performance de tests
pnpm test:with-db --reporter=verbose

# Generar reporte de coverage
pnpm test:coverage:auth
```

## 🔗 Related Files

- `scripts/setup-test-db.sh` - Script de configuración automática
- `env.test` - Variables de entorno para tests
- `tests/setup/test-setup.ts` - Setup principal de tests
- `prisma/schema.prisma` - Esquema de base de datos

---

**¡Con este setup tienes tests más valiosos y realistas! 🚀**
