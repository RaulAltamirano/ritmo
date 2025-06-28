# 🎯 Ritmo - Agenda Inteligente

Ritmo es una aplicación web moderna diseñada para optimizar la productividad de estudiantes y profesionales mediante técnicas de estudio avanzadas y ayuda de IA. La aplicación utiliza **Mobile First Design** y sigue los principios de **Atomic Design** para crear una experiencia de usuario limpia, intuitiva y accesible.

## ✨ Características Principales

### 🧠 Dashboard Inteligente
- **Racha de estudio**: Visualización motivacional del progreso diario
- **Próximas tareas**: Vista compacta de agenda con prioridades
- **Heatmap de actividad**: Similar a GitHub contributions para tracking de hábitos
- **Logros y estadísticas**: Sistema de gamificación para mantener motivación
- **Frase del día**: Mensajes motivacionales personalizados

### ✅ Gestión de Tareas
- **Creación rápida**: Input simple para crear tareas en segundos
- **Cronómetro integrado**: Timer automático de 30 minutos (configurable)
- **Múltiples modos**: Pomodoro, Pomodoro XL, sesiones personalizadas
- **Modo Focus**: Pantalla completa sin distracciones
- **Estados visuales**: Pendiente, en progreso, completada
- **Filtros avanzados**: Por categoría, estado, prioridad

### 🗂️ Sistema de Categorías
- **Organización visual**: Colores e íconos personalizables
- **Estadísticas por categoría**: Progreso y métricas detalladas
- **Tareas recientes**: Vista rápida de actividad reciente
- **Categorías predefinidas**: Estudio, Trabajo, Personal, Salud

### ⚙️ Configuración Avanzada
- **Tiempos personalizables**: Duración de sesiones, descansos
- **Notificaciones**: Navegador, sonidos, recordatorios automáticos
- **Apariencia**: Temas, tamaños de fuente, modo oscuro
- **Productividad**: Objetivos diarios, días de estudio activos
- **Datos**: Exportación e importación de configuración

## 🎨 Diseño y UX

### Paleta de Colores
La aplicación utiliza una paleta de colores cuidadosamente diseñada:

- **Morado (Primary)**: Color principal de la marca
- **Azul**: Acciones secundarias y calendario
- **Verde**: Éxito, progreso y tareas completadas
- **Naranja**: Advertencias y elementos que requieren atención
- **Rojo**: Errores y acciones destructivas
- **Gris**: Elementos neutros y texto

### Principios de Diseño
- **Mobile First**: Diseño responsive optimizado para móviles
- **Atomic Design**: Componentes organizados en átomos, moléculas, organismos, templates y páginas
- **Accesibilidad WCAG**: Alto contraste, etiquetas descriptivas, navegación por teclado
- **Simplicidad**: Interfaz limpia sin distracciones visuales
- **Consistencia**: Patrones de diseño coherentes en toda la aplicación

## 🛠️ Tecnologías

- **Frontend**: Nuxt.js 3, Vue.js 3, TypeScript
- **Styling**: Tailwind CSS con configuración personalizada
- **Iconografía**: SVG icons personalizados
- **Estado**: Composables de Vue 3
- **Build**: Vite
- **Linting**: ESLint, Prettier

## 📁 Estructura del Proyecto

```
components/
│   ├── atoms/          # Componentes básicos (BaseButton, BaseCard, Badge)
│   ├── molecules/      # Componentes compuestos (NavLink, TaskItem, TaskForm)
│   ├── organisms/      # Componentes complejos (MainNavbar, StreakCard)
│   └── templates/      # Layouts de página (DashboardTemplate, AuthTemplate)
```

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- Yarn o npm

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/ritmo.git
cd ritmo

# Instalar dependencias
yarn install

# Iniciar servidor de desarrollo
yarn dev
```

### Scripts Disponibles
```bash
# Desarrollo
yarn dev          # Servidor de desarrollo
yarn build        # Build de producción
yarn preview      # Preview del build

# Linting y formateo
yarn lint         # Ejecutar ESLint
yarn lint:fix     # Corregir errores de linting
yarn format       # Formatear código con Prettier

# Testing
yarn test         # Ejecutar tests
yarn test:watch   # Tests en modo watch
```

## 📋 Funcionalidades Implementadas

### ✅ Completadas
- [x] Dashboard con racha de estudio y estadísticas
- [x] Sistema de tareas con cronómetro integrado
- [x] Gestión de categorías con colores e íconos
- [x] Configuración completa de la aplicación
- [x] Navbar responsive con navegación
- [x] Modo Focus para sesiones de estudio
- [x] Filtros y búsqueda de tareas
- [x] Sistema de notificaciones
- [x] Exportación de datos
- [x] Diseño responsive (Mobile First)
- [x] Accesibilidad WCAG

### 🔄 En Desarrollo
- [ ] Integración con backend
- [ ] Sincronización en la nube
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Análisis de patrones de estudio
- [ ] Sugerencias de IA

### 📋 Pendientes
- [ ] Tests unitarios y de integración
- [ ] PWA (Progressive Web App)
- [ ] Integración con calendarios externos
- [ ] Sistema de recordatorios avanzado
- [ ] Reportes y analytics
- [ ] Modo colaborativo

## 🎯 Uso de la Aplicación

### Para Estudiantes
1. **Configura tu perfil**: Establece tus objetivos diarios y preferencias
2. **Crea categorías**: Organiza tus tareas por materia o proyecto
3. **Planifica sesiones**: Crea tareas con duración específica
4. **Usa el modo Focus**: Elimina distracciones durante el estudio
5. **Revisa tu progreso**: Monitorea tu racha y estadísticas

### Para Profesionales
1. **Organiza proyectos**: Usa categorías para diferentes proyectos
2. **Gestiona tiempo**: Utiliza el cronómetro para sesiones de trabajo
3. **Establece prioridades**: Marca tareas como alta, media o baja prioridad
4. **Analiza productividad**: Revisa tus patrones de trabajo

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución
- Sigue los principios de Atomic Design
- Mantén la consistencia con la paleta de colores
- Asegura accesibilidad en todos los componentes
- Escribe tests para nuevas funcionalidades
- Documenta cambios importantes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Vue.js Team**: Por el increíble framework
- **Tailwind CSS**: Por el sistema de diseño
- **Heroicons**: Por los íconos SVG
- **Comunidad de desarrolladores**: Por el feedback y contribuciones

## 📞 Contacto

- **Proyecto**: [GitHub Issues](https://github.com/tu-usuario/ritmo/issues)
- **Email**: tu-email@ejemplo.com
- **Twitter**: [@tu-usuario](https://twitter.com/tu-usuario)

---

**Ritmo** - Optimiza tu productividad, maximiza tu potencial 🚀
