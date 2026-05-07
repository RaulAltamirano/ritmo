#!/bin/bash

# 🧪 RITMO API COMPLETE TEST RUNNER - 2025
# 
# Script para ejecutar todos los tests y generar reportes completos
# Incluye setup, ejecución, coverage y reportes

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_ROOT/apps/api"
COVERAGE_DIR="$API_DIR/coverage"
REPORT_DIR="$API_DIR/reports"

# Función para mostrar banner
show_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🧪 RITMO API TEST SUITE                    ║"
    echo "║                        2025 EDITION                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Función para verificar prerequisitos
check_prerequisites() {
    log "🔍 Verificando prerequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
        exit 1
    fi
    
    # Verificar pnpm
    if ! command -v pnpm &> /dev/null; then
        error "pnpm no está instalado"
        exit 1
    fi
    
    # Verificar Docker
    if ! docker info > /dev/null 2>&1; then
        error "Docker no está corriendo"
        exit 1
    fi
    
    success "Prerequisitos verificados"
}

# Función para setup de entorno
setup_environment() {
    log "🔧 Configurando entorno de test..."
    
    # Crear directorios si no existen
    mkdir -p "$COVERAGE_DIR"
    mkdir -p "$REPORT_DIR"
    
    # Navegar al directorio de la API
    cd "$API_DIR"
    
    # Instalar dependencias si es necesario
    if [ ! -d "node_modules" ]; then
        log "📦 Instalando dependencias..."
        pnpm install
    fi
    
    success "Entorno configurado"
}

# Función para setup de base de datos
setup_database() {
    log "🐳 Configurando base de datos de test..."
    
    # Ejecutar script de setup de Docker
    if ! "$SCRIPT_DIR/setup-test-db-docker.sh"; then
        error "Falló el setup de la base de datos"
        exit 1
    fi
    
    success "Base de datos configurada"
}

# Función para ejecutar tests básicos
run_basic_tests() {
    log "🧪 Ejecutando tests básicos..."
    
    if pnpm test:basic; then
        success "Tests básicos completados"
    else
        error "Tests básicos fallaron"
        return 1
    fi
}

# Función para ejecutar tests de autenticación
run_auth_tests() {
    log "🔐 Ejecutando tests de autenticación..."
    
    local auth_tests=(
        "test:auth:basic"
        "test:auth:sessions"
        "test:auth:security"
        "test:auth:errors"
        "test:auth:performance"
    )
    
    local failed_tests=()
    
    for test in "${auth_tests[@]}"; do
        log "Ejecutando $test..."
        if pnpm "$test"; then
            success "$test completado"
        else
            error "$test falló"
            failed_tests+=("$test")
        fi
    done
    
    if [ ${#failed_tests[@]} -eq 0 ]; then
        success "Todos los tests de autenticación completados"
    else
        warning "Algunos tests fallaron: ${failed_tests[*]}"
        return 1
    fi
}

# Función para ejecutar tests con coverage
run_coverage_tests() {
    log "📊 Ejecutando tests con coverage..."
    
    if pnpm test:coverage; then
        success "Tests con coverage completados"
    else
        error "Tests con coverage fallaron"
        return 1
    fi
}

# Función para generar reportes
generate_reports() {
    log "📈 Generando reportes..."
    
    # Generar reporte JSON
    if pnpm test:report; then
        success "Reporte JSON generado"
    else
        warning "No se pudo generar reporte JSON"
    fi
    
    # Copiar reportes a directorio de reports
    if [ -f "$COVERAGE_DIR/test-results.json" ]; then
        cp "$COVERAGE_DIR/test-results.json" "$REPORT_DIR/"
    fi
    
    if [ -f "$COVERAGE_DIR/junit.xml" ]; then
        cp "$COVERAGE_DIR/junit.xml" "$REPORT_DIR/"
    fi
    
    success "Reportes generados en $REPORT_DIR"
}

# Función para mostrar resumen
show_summary() {
    log "📋 Generando resumen de tests..."
    
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                        TEST SUMMARY                          ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Mostrar archivos de coverage
    if [ -d "$COVERAGE_DIR" ]; then
        echo "📊 Coverage Reports:"
        ls -la "$COVERAGE_DIR"/*.html 2>/dev/null || echo "   No HTML reports found"
        ls -la "$COVERAGE_DIR"/*.json 2>/dev/null || echo "   No JSON reports found"
        ls -la "$COVERAGE_DIR"/*.xml 2>/dev/null || echo "   No XML reports found"
    fi
    
    # Mostrar archivos de reportes
    if [ -d "$REPORT_DIR" ]; then
        echo ""
        echo "📈 Test Reports:"
        ls -la "$REPORT_DIR"/*.json 2>/dev/null || echo "   No test reports found"
        ls -la "$REPORT_DIR"/*.xml 2>/dev/null || echo "   No JUnit reports found"
    fi
    
    echo ""
    echo "🚀 Comandos útiles:"
    echo "   Ver coverage HTML: open $COVERAGE_DIR/index.html"
    echo "   Ver reportes: ls -la $REPORT_DIR"
    echo "   Ejecutar tests específicos: pnpm test:auth:basic"
    echo "   Ejecutar con watch: pnpm test:watch"
}

# Función para limpieza
cleanup() {
    log "🧹 Limpiando recursos..."
    
    # Detener contenedores de Docker si están corriendo
    if [ -f "$PROJECT_ROOT/docker-compose.test.yml" ]; then
        docker-compose -f "$PROJECT_ROOT/docker-compose.test.yml" down -v 2>/dev/null || true
    fi
    
    success "Limpieza completada"
}

# Función principal
main() {
    show_banner
    
    # Verificar argumentos
    local run_setup=true
    local run_basic=true
    local run_auth=true
    local run_coverage=true
    local run_reports=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-setup)
                run_setup=false
                shift
                ;;
            --no-basic)
                run_basic=false
                shift
                ;;
            --no-auth)
                run_auth=false
                shift
                ;;
            --no-coverage)
                run_coverage=false
                shift
                ;;
            --no-reports)
                run_reports=false
                shift
                ;;
            --help)
                echo "Uso: $0 [opciones]"
                echo ""
                echo "Opciones:"
                echo "  --no-setup     Saltar setup de base de datos"
                echo "  --no-basic     Saltar tests básicos"
                echo "  --no-auth      Saltar tests de autenticación"
                echo "  --no-coverage  Saltar tests con coverage"
                echo "  --no-reports   Saltar generación de reportes"
                echo "  --help         Mostrar esta ayuda"
                exit 0
                ;;
            *)
                error "Opción desconocida: $1"
                echo "Usa --help para ver las opciones disponibles"
                exit 1
                ;;
        esac
    done
    
    log "🎯 Iniciando ejecución completa de tests..."
    
    # Verificar prerequisitos
    check_prerequisites
    
    # Setup de entorno
    setup_environment
    
    # Setup de base de datos si es necesario
    if [ "$run_setup" = true ]; then
        setup_database
    else
        warning "Saltando setup de base de datos"
    fi
    
    # Ejecutar tests básicos
    if [ "$run_basic" = true ]; then
        run_basic_tests
    else
        warning "Saltando tests básicos"
    fi
    
    # Ejecutar tests de autenticación
    if [ "$run_auth" = true ]; then
        run_auth_tests
    else
        warning "Saltando tests de autenticación"
    fi
    
    # Ejecutar tests con coverage
    if [ "$run_coverage" = true ]; then
        run_coverage_tests
    else
        warning "Saltando tests con coverage"
    fi
    
    # Generar reportes
    if [ "$run_reports" = true ]; then
        generate_reports
    else
        warning "Saltando generación de reportes"
    fi
    
    # Mostrar resumen
    show_summary
    
    success "✅ Ejecución completa de tests finalizada!"
}

# Trap para limpiar al salir
trap cleanup EXIT

# Ejecutar función principal
main "$@"
