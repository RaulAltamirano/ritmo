#!/bin/bash

# ========================================
# TEST DATABASE DOCKER SETUP SCRIPT
# ========================================

set -e

echo "🐳 Setting up test database with Docker..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Detener contenedores existentes si están corriendo
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.test.yml down --volumes --remove-orphans

# Iniciar contenedores
echo "🚀 Starting test database containers..."
docker-compose -f docker-compose.test.yml up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec ritmo-test-db pg_isready -U test -d ritmo_test; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Esperar un poco más para asegurar que esté completamente inicializado
sleep 5

# Verificar que los contenedores están corriendo
echo "🔍 Checking container status..."
docker-compose -f docker-compose.test.yml ps

echo "✅ Test database setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Run 'pnpm test:db:setup' to setup the database schema"
echo "  2. Run 'pnpm test' to run the tests"
echo "  3. Run 'pnpm test:db:stop' to stop the containers"
echo ""
echo "🔗 Database URL: postgresql://test:test@localhost:5434/ritmo_test"
