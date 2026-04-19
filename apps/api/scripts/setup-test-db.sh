#!/bin/bash

# 🧪 TEST DATABASE SETUP SCRIPT - RITMO API 2025
# 
# Script para configurar la base de datos de test automáticamente

set -e

echo "🚀 Setting up test database for RITMO API..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si PostgreSQL está instalado
check_postgres() {
    log_info "Checking PostgreSQL installation..."
    
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL is not installed. Please install it first."
        log_info "On Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        log_info "On macOS: brew install postgresql"
        log_info "On Arch: sudo pacman -S postgresql"
        exit 1
    fi
    
    log_success "PostgreSQL is installed"
}

# Verificar si PostgreSQL está ejecutándose
check_postgres_running() {
    log_info "Checking if PostgreSQL is running..."
    
    if ! pg_isready -q; then
        log_error "PostgreSQL is not running. Please start it first."
        log_info "On Ubuntu/Debian: sudo systemctl start postgresql"
        log_info "On macOS: brew services start postgresql"
        log_info "On Arch: sudo systemctl start postgresql"
        exit 1
    fi
    
    log_success "PostgreSQL is running"
}

# Crear usuario de test
create_test_user() {
    log_info "Creating test user..."
    
    # Verificar si el usuario ya existe
    if psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='test'" | grep -q 1; then
        log_warning "Test user already exists"
    else
        # Crear usuario de test
        psql -U postgres -c "CREATE USER test WITH PASSWORD 'test';"
        log_success "Test user created"
    fi
}

# Crear base de datos de test
create_test_database() {
    log_info "Creating test database..."
    
    # Verificar si la base de datos ya existe
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw ritmo_test; then
        log_warning "Test database already exists"
    else
        # Crear base de datos de test
        createdb -U postgres ritmo_test
        log_success "Test database created"
    fi
    
    # Dar permisos al usuario de test
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ritmo_test TO test;"
    log_success "Permissions granted to test user"
}

# Ejecutar migraciones
run_migrations() {
    log_info "Running database migrations..."
    
    # Cambiar al directorio de la API
    cd apps/api
    
    # Ejecutar migraciones
    export DATABASE_URL="postgresql://test:test@localhost:5432/ritmo_test"
    npx prisma migrate deploy
    
    log_success "Migrations completed"
}

# Verificar conexión
test_connection() {
    log_info "Testing database connection..."
    
    # Probar conexión
    psql -U test -d ritmo_test -c "SELECT version();" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        log_success "Database connection successful"
    else
        log_error "Database connection failed"
        exit 1
    fi
}

# Función principal
main() {
    log_info "Starting test database setup..."
    
    check_postgres
    check_postgres_running
    create_test_user
    create_test_database
    run_migrations
    test_connection
    
    log_success "Test database setup completed successfully!"
    log_info "You can now run: pnpm test"
}

# Ejecutar función principal
main "$@"
