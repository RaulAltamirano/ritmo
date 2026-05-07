# 🐳 Docker Test Setup - RITMO API 2025

## 📋 Overview

Este setup utiliza **Docker** para proporcionar un entorno de test completamente aislado y reproducible. Incluye:

- ✅ **PostgreSQL 15** para base de datos de test
- ✅ **Redis 7** para cache de test
- ✅ **Aislamiento completo** del entorno
- ✅ **Configuración reproducible** en cualquier sistema
- ✅ **Fácil limpieza** y reset

## 🚀 Quick Start

### Setup Automático con Docker

```bash
# Configurar servicios Docker y ejecutar todos los tests
pnpm test:with-docker
```

### Setup Manual

```bash
# 1. Solo configurar servicios Docker
pnpm test:setup-db-docker

# 2. Ejecutar tests
pnpm test:full
```

## 🔧 Requirements

### Docker

**Arch Linux:**

```bash
sudo pacman -S docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

**Ubuntu/Debian:**

```bash
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

**macOS:**

```bash
brew install docker docker-compose
open -a Docker
```

### Verificar Instalación

```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar que Docker está ejecutándose
docker info
```

## 📊 Services Configuration

### Docker Compose Services

```yaml
# PostgreSQL Test Database
postgres-test:
  image: postgres:15-alpine
  port: 5433:5432
  database: ritmo_test
  user: test
  password: test

# Redis Test Cache
redis-test:
  image: redis:7-alpine
  port: 6380:6379
```

### Variables de Entorno

```bash
# Base de datos de test (Docker)
TEST_DATABASE_URL="postgresql://test:test@localhost:5433/ritmo_test"

# Redis de test (Docker)
REDIS_URL="redis://localhost:6380"

# Configuración de JWT para tests
JWT_ACCESS_SECRET="test-access-secret-key-2025"
JWT_REFRESH_SECRET="test-refresh-secret-key-2025"
```

## 🧪 Running Tests

### Tests con Docker

```bash
# Setup completo con Docker
pnpm test:with-docker

# Solo servicios Docker
pnpm test:setup-db-docker

# Tests específicos (requiere servicios corriendo)
pnpm test:auth:flow
pnpm test:auth:security
pnpm test:auth:sessions
```

### Comandos Docker Útiles

```bash
# Ver servicios corriendo
docker-compose -f docker-compose.test.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.test.yml logs -f

# Parar servicios
docker-compose -f docker-compose.test.yml down

# Parar y limpiar volúmenes
docker-compose -f docker-compose.test.yml down --volumes

# Reiniciar servicios
docker-compose -f docker-compose.test.yml restart
```

## 🔄 Docker Lifecycle

### Setup (beforeAll)

- ✅ Verifica Docker
- ✅ Inicia servicios con docker-compose
- ✅ Espera a que servicios estén listos
- ✅ Ejecuta migraciones
- ✅ Configura conexión Prisma

### Per-Test (beforeEach)

- ✅ Limpia tablas de base de datos
- ✅ Resetea mocks
- ✅ Prepara contexto de test

### Cleanup (afterAll)

- ✅ Desconecta Prisma
- ✅ Cierra servidor de test
- ✅ Opcional: para servicios Docker

## 📈 Benefits of Docker Setup

### vs Local Installation

| Aspecto           | Local PostgreSQL      | Docker             |
| ----------------- | --------------------- | ------------------ |
| **Instalación**   | ❌ Compleja           | ✅ Simple          |
| **Aislamiento**   | ❌ Compartido         | ✅ Completo        |
| **Portabilidad**  | ❌ Sistema específico | ✅ Universal       |
| **Limpieza**      | ❌ Manual             | ✅ Automática      |
| **Configuración** | ❌ Manual             | ✅ Automática      |
| **Conflictos**    | ⚠️ Posibles           | ✅ Ninguno         |
| **Performance**   | ✅ Nativo             | ⚠️ Ligero overhead |

### Casos de Uso Ideales

**Docker Setup:**

- ✅ Desarrollo en equipo
- ✅ CI/CD pipelines
- ✅ Entornos de test aislados
- ✅ Configuración reproducible
- ✅ Fácil onboarding

**Local Setup:**

- ✅ Desarrollo individual
- ✅ Performance crítica
- ✅ Acceso directo a base de datos
- ✅ Debugging avanzado

## 🛠️ Troubleshooting

### Error: Docker no está ejecutándose

```bash
# Arch Linux
sudo systemctl start docker
sudo systemctl enable docker

# Ubuntu/Debian
sudo systemctl start docker
sudo systemctl enable docker

# macOS
open -a Docker
```

### Error: Puerto ya en uso

```bash
# Verificar qué usa el puerto
sudo lsof -i :5433
sudo lsof -i :6380

# Parar servicios existentes
docker-compose -f docker-compose.test.yml down
```

### Error: Permisos de Docker

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar
newgrp docker
```

### Error: Volúmenes corruptos

```bash
# Limpiar volúmenes
docker-compose -f docker-compose.test.yml down --volumes
docker volume prune
```

### Error: Migraciones fallan

```bash
# Resetear base de datos
docker-compose -f docker-compose.test.yml down --volumes
pnpm test:setup-db-docker
```

## 📝 Test Examples

### Test con Docker Database

```typescript
describe('User Registration with Docker Database', () => {
  it('should create user in Docker database', async () => {
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

    // Then: User exists in Docker database
    const user = await testContext.prisma.user.findUnique({
      where: { email: userData.email },
    })

    expect(user).toBeTruthy()
    expect(user.email).toBe(userData.email)
  })
})
```

### Test de Redis Cache

```typescript
describe('Cache with Docker Redis', () => {
  it('should cache user data in Redis', async () => {
    // Given: User exists
    const user = await testContext.prisma.user.create({
      data: testFixtures.users[0],
    })

    // When: User data is cached
    await redis.set(`user:${user.id}`, JSON.stringify(user), 'EX', 3600)

    // Then: Data exists in Redis
    const cachedUser = await redis.get(`user:${user.id}`)
    expect(cachedUser).toBeTruthy()
    expect(JSON.parse(cachedUser).id).toBe(user.id)
  })
})
```

## 🎯 Best Practices

### 1. Usar Health Checks

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U test -d ritmo_test']
  interval: 10s
  timeout: 5s
  retries: 5
```

### 2. Limpiar Volúmenes

```bash
# Limpiar después de tests
docker-compose -f docker-compose.test.yml down --volumes
```

### 3. Usar Puertos Únicos

```yaml
ports:
  - '5433:5432' # PostgreSQL test
  - '6380:6379' # Redis test
```

### 4. Configurar Timeouts

```typescript
beforeAll(async () => {
  // Esperar a que servicios estén listos
  await waitForServices()
}, 120000) // 2 minutos
```

## 📊 Performance Considerations

### Optimizaciones Docker

1. **Usar imágenes Alpine** (más ligeras)
2. **Configurar health checks** apropiados
3. **Usar volúmenes nombrados** para persistencia
4. **Limitar recursos** si es necesario

### Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs de servicios
docker-compose -f docker-compose.test.yml logs -f postgres-test
docker-compose -f docker-compose.test.yml logs -f redis-test
```

## 🔗 Related Files

- `docker-compose.test.yml` - Configuración de servicios Docker
- `scripts/setup-test-db-docker.sh` - Script de setup con Docker
- `env.test` - Variables de entorno para tests
- `tests/setup/test-setup.ts` - Setup principal de tests

## 🚀 Advanced Usage

### Desarrollo con Docker

```bash
# Iniciar servicios para desarrollo
docker-compose -f docker-compose.test.yml up -d

# Conectar a base de datos
psql -h localhost -p 5433 -U test -d ritmo_test

# Conectar a Redis
redis-cli -h localhost -p 6380
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Setup test database
  run: |
    docker-compose -f docker-compose.test.yml up -d
    ./scripts/setup-test-db-docker.sh

- name: Run tests
  run: pnpm test:full

- name: Cleanup
  run: docker-compose -f docker-compose.test.yml down --volumes
```

---

**¡Con Docker tienes un entorno de test completamente aislado y reproducible! 🐳**
