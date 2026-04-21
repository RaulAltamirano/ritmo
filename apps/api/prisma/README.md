# 🗂️ Prisma Schema Organization

## 📁 Estructura del Esquema

El esquema de Prisma está organizado en módulos separados para mejorar la mantenibilidad y organización del código.

```
prisma/
├── schema.prisma          # 🔧 Archivo principal (auto-generado)
├── extensions/
│   └── database.prisma    # ⚙️ Configuración de base de datos
├── models/
│   ├── user.prisma        # 👤 Gestión de usuarios
│   ├── session.prisma     # 🔐 Gestión de sesiones
│   ├── security.prisma    # 🛡️ Seguridad y auditoría
│   ├── business.prisma    # 💼 Lógica de negocio
│   └── enums.prisma       # 📋 Enumeraciones
└── scripts/
    └── build-schema.js    # 🔨 Script de construcción
```

## 🚀 Cómo Funciona

### **1. Desarrollo Modular**

- **Edita los módulos individuales** en `prisma/models/`
- **No edites directamente** `schema.prisma` (se regenera automáticamente)
- **Cada módulo** tiene una responsabilidad específica

### **2. Construcción Automática**

```bash
# Construir el esquema combinado
pnpm run db:build-schema

# O manualmente
node scripts/build-schema.js
```

### **3. Validación y Generación**

```bash
# Validar el esquema
npx prisma validate

# Generar el cliente
npx prisma generate

# Aplicar cambios a la base de datos
npx prisma db push
```

## 📋 Módulos Disponibles

### **🔧 `extensions/database.prisma`**

- Configuración de base de datos
- Extensiones PostgreSQL (pgcrypto, pg_trgm)
- Configuraciones globales

### **👤 `models/user.prisma`**

- Modelo `User` y autenticación
- Preferencias y configuraciones
- Historial de contraseñas
- Tokens de verificación

### **🔐 `models/session.prisma`**

- Gestión de sesiones de usuario
- Tokens de refresco
- Información de dispositivos
- Tracking de actividad

### **🛡️ `models/security.prisma`**

- Logs de seguridad
- Auditoría de eventos
- Tracking de amenazas
- Metadatos de seguridad

### **💼 `models/business.prisma`**

- Actividades y tareas
- Categorías y organización
- Sesiones de trabajo
- Métricas de productividad

### **📋 `models/enums.prisma`**

- Estados de usuario
- Tipos de actividad
- Prioridades y severidades
- Eventos de seguridad

## 🎯 Ventajas de esta Organización

### **✅ Mantenibilidad**

- **Código más limpio** y organizado
- **Fácil navegación** entre módulos
- **Responsabilidades separadas** claramente

### **✅ Escalabilidad**

- **Agregar nuevos modelos** sin afectar otros
- **Refactorizar módulos** independientemente
- **Colaboración en equipo** más eficiente

### **✅ Reutilización**

- **Módulos independientes** pueden reutilizarse
- **Testing más fácil** por módulo
- **Documentación específica** por área

## 🔄 Flujo de Trabajo

### **1. Desarrollo**

```bash
# Editar un módulo específico
vim prisma/models/user.prisma

# Construir el esquema
pnpm run db:build-schema

# Validar cambios
npx prisma validate
```

### **2. Testing**

```bash
# Generar cliente
npx prisma generate

# Ejecutar tests
pnpm test
```

### **3. Despliegue**

```bash
# Aplicar cambios
npx prisma db push

# O crear migración
npx prisma migrate dev
```

## ⚠️ Reglas Importantes

### **🚫 NO HACER**

- **Editar directamente** `schema.prisma`
- **Cambiar el orden** de los módulos en `build-schema.js`
- **Eliminar comentarios** de separación de módulos

### **✅ SÍ HACER**

- **Editar módulos individuales** en `prisma/models/`
- **Ejecutar** `pnpm run db:build-schema` después de cambios
- **Validar** el esquema antes de commit
- **Documentar** cambios en módulos

## 🆘 Solución de Problemas

### **Error: "Schema validation failed"**

```bash
# Reconstruir el esquema
pnpm run db:build-schema

# Validar nuevamente
npx prisma validate
```

### **Error: "Module not found"**

- Verificar que todos los módulos existen
- Revisar rutas en `build-schema.js`
- Ejecutar `pnpm run db:build-schema`

### **Error: "Client generation failed"**

```bash
# Limpiar y regenerar
rm -rf node_modules/.prisma
pnpm run db:build-schema
npx prisma generate
```

## 📚 Recursos Adicionales

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

---

**🎉 ¡Tu esquema de Prisma ahora está perfectamente organizado y es fácil de mantener!**
