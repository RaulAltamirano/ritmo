#!/bin/bash

# Script de configuración rápida para Storybook
# @ritmo/ui

echo "🚀 Configurando Storybook para @ritmo/ui..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d ".storybook" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio packages/ui"
    exit 1
fi

# Verificar dependencias
echo "📦 Verificando dependencias..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm no está instalado"
    echo "Instala pnpm con: npm install -g pnpm"
    exit 1
fi

# Instalar dependencias si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    pnpm install
fi

# Verificar configuración de Storybook
echo "🔧 Verificando configuración de Storybook..."

# Verificar archivos de configuración
required_files=(
    ".storybook/main.ts"
    ".storybook/preview.ts"
    ".storybook/manager.ts"
    ".storybook/globalTypes.ts"
    ".storybook/vite.config.ts"
    ".storybook/tailwind.config.js"
    ".storybook/postcss.config.js"
    ".storybook/tsconfig.json"
    ".storybook/jest.config.js"
    ".storybook/vitest.config.ts"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "⚠️  Archivos de configuración faltantes:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo "   Ejecuta este script después de crear todos los archivos de configuración"
    exit 1
fi

# Verificar historias
echo "📚 Verificando historias..."
story_files=$(find src -name "*.stories.ts" -o -name "*.stories.js" 2>/dev/null | wc -l)

if [ "$story_files" -eq 0 ]; then
    echo "⚠️  No se encontraron archivos de historias"
    echo "   Crea historias para tus componentes antes de continuar"
else
    echo "✅ Se encontraron $story_files archivos de historias"
fi

# Construir el proyecto
echo "🔨 Construyendo el proyecto..."
if pnpm build; then
    echo "✅ Proyecto construido exitosamente"
else
    echo "❌ Error al construir el proyecto"
    exit 1
fi

# Verificar que Storybook puede iniciar
echo "🧪 Probando Storybook..."
timeout 30s pnpm storybook --port 6006 &
storybook_pid=$!

# Esperar a que Storybook se inicie
sleep 10

# Verificar si Storybook está funcionando
if curl -s http://localhost:6006 > /dev/null; then
    echo "✅ Storybook está funcionando correctamente"
    echo "🌐 Accede a: http://localhost:6006"
    
    # Detener Storybook
    kill $storybook_pid 2>/dev/null
    
    echo ""
    echo "🎉 ¡Configuración completada exitosamente!"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   pnpm storybook          - Iniciar Storybook en desarrollo"
    echo "   pnpm build-storybook    - Construir Storybook para producción"
    echo "   pnpm test-storybook     - Ejecutar tests de Storybook"
    echo "   pnpm chromatic          - Ejecutar tests visuales (si está configurado)"
    echo ""
    echo "📖 Documentación:"
    echo "   - Guía completa: STORYBOOK_GUIDE.md"
    echo "   - Configuración: .storybook/"
    echo "   - Ejemplos: src/**/*.stories.ts"
    
else
    echo "❌ Error: Storybook no pudo iniciarse correctamente"
    kill $storybook_pid 2>/dev/null
    exit 1
fi

echo ""
echo "🚀 ¡Listo para desarrollar con Storybook!"
