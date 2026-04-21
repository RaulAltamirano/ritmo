#!/bin/bash

# 🔧 RITMO API TEST DB FIX - 2025
# 
# Script para arreglar la configuración de la base de datos de test
# Soluciona problemas de migraciones y setup

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEST_DB_URL="postgresql://test:test@localhost:5434/ritmo_test"

log "🔧 Iniciando arreglo de base de datos de test..."

# 1. Verificar Docker
if ! docker info > /dev/null 2>&1; then
    error "Docker no está corriendo. Por favor inicia Docker."
    exit 1
fi

# 2. Detener contenedores existentes
log "🛑 Deteniendo contenedores existentes..."
docker-compose -f "$PROJECT_ROOT/docker-compose.test.yml" down -v 2>/dev/null || true

# 3. Iniciar base de datos de test
log "🚀 Iniciando base de datos de test..."
docker-compose -f "$PROJECT_ROOT/docker-compose.test.yml" up -d postgres-test

# 4. Esperar a que la BD esté lista
log "⏳ Esperando a que la base de datos esté lista..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker exec ritmo-test-db pg_isready -U test -d ritmo_test > /dev/null 2>&1; then
        success "Base de datos lista en intento $attempt"
        break
    fi
    
    log "Intento $attempt/$max_attempts - Base de datos aún no está lista..."
    sleep 2
    attempt=$((attempt + 1))
    
    if [ $attempt -gt $max_attempts ]; then
        error "La base de datos no se pudo conectar después de $max_attempts intentos"
        exit 1
    fi
done

# 5. Ejecutar migraciones
log "🔄 Ejecutando migraciones..."
cd "$PROJECT_ROOT"

# Exportar variables de entorno para test
export DATABASE_URL="$TEST_DB_URL"
export NODE_ENV="test"

# Ejecutar migraciones
npx prisma migrate deploy --schema=./prisma/schema.prisma

# 6. Verificar tablas
log "🔍 Verificando tablas..."
tables=$(docker exec ritmo-test-db psql -U test -d ritmo_test -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';")

if echo "$tables" | grep -q "users"; then
    success "Tabla 'users' encontrada"
else
    error "Tabla 'users' no encontrada"
    exit 1
fi

if echo "$tables" | grep -q "user_sessions"; then
    success "Tabla 'user_sessions' encontrada"
else
    error "Tabla 'user_sessions' no encontrada"
    exit 1
fi

# 7. Generar cliente Prisma
log "🔧 Generando cliente Prisma..."
npx prisma generate --schema=./prisma/schema.prisma

# 8. Verificar conexión
log "🔍 Verificando conexión..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: '$TEST_DB_URL'
    }
  }
});

async function testConnection() {
  try {
    await prisma.\$connect();
    console.log('✅ Conexión exitosa a la base de datos de test');
    
    const userCount = await prisma.user.count();
    console.log(\`📊 Usuarios en BD: \${userCount}\`);
    
    await prisma.\$disconnect();
  } catch (error) {
    console.error('❌ Error conectando a la BD:', error.message);
    process.exit(1);
  }
}

testConnection();
"

success "✅ Base de datos de test configurada correctamente"
log "🎯 Ahora puedes ejecutar los tests con: npm test"

# Mostrar información útil
echo ""
echo "📋 Información de la BD de test:"
echo "   URL: $TEST_DB_URL"
echo "   Puerto: 5434"
echo "   Usuario: test"
echo "   Contraseña: test"
echo "   Base de datos: ritmo_test"
echo ""
echo "🔧 Para limpiar: docker-compose -f docker-compose.test.yml down -v"
