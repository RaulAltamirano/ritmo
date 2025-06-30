<!-- Logo -->
<p align="center">
  <img src="public/logo-ritmo.svg" alt="Ritmo Logo" width="64" height="64" />
</p>

# 🎯 Ritmo

**Create your best day.**

Ritmo is a modern web app designed to help students and professionals optimize their productivity using advanced study techniques and AI assistance. Built with a **Mobile First Design** and following **Atomic Design** principles, Ritmo delivers a clean, intuitive, and accessible user experience.

---

## ✨ Main Features

### 🧠 Smart Dashboard
- **Study Streak:** Motivational daily progress visualization
- **Upcoming Tasks:** Compact agenda view with priorities
- **Activity Heatmap:** GitHub-style habit tracking
- **Achievements & Stats:** Gamification to keep you motivated
- **Quote of the Day:** Personalized motivational messages

### ✅ Task Management
- **Quick Creation:** Instantly add tasks
- **Integrated Timer:** 30-minute timer (configurable)
- **Multiple Modes:** Pomodoro, Pomodoro XL, custom sessions
- **Focus Mode:** Distraction-free fullscreen
- **Visual States:** Pending, in progress, completed
- **Advanced Filters:** By category, state, priority

### 🗂️ Category System
- **Visual Organization:** Custom colors and icons
- **Category Stats:** Progress and detailed metrics
- **Recent Tasks:** Quick activity overview
- **Predefined Categories:** Study, Work, Personal, Health

### ⚙️ Advanced Settings
- **Custom Times:** Session and break durations
- **Notifications:** Browser, sound, and reminders
- **Appearance:** Themes, font sizes, dark mode
- **Productivity:** Daily goals, active study days
- **Data:** Export/import settings

---

## 🎨 Design & UX

### Color Palette
- **Purple (Primary):** Brand color
- **Blue:** Secondary actions, calendar
- **Green:** Success, progress, completed tasks
- **Orange:** Warnings, attention
- **Red:** Errors, destructive actions
- **Gray:** Neutral elements, text

### Design Principles
- **Mobile First:** Responsive, mobile-optimized
- **Atomic Design:** Atoms, molecules, organisms, templates, pages
- **Accessibility (WCAG):** High contrast, descriptive labels, keyboard navigation
- **Simplicity:** Clean, distraction-free interface
- **Consistency:** Unified design patterns

---

## 🛠️ Tech Stack

- **Frontend:** Nuxt.js 3, Vue.js 3, TypeScript
- **Styling:** Tailwind CSS (custom config)
- **Icons:** Lucide Vue Next
- **State:** Vue 3 Composables + Pinia
- **Build:** Vite
- **Linting:** ESLint, Prettier

---

## 📁 Project Structure

```
ritmo/
├── components/           # Atomic Design components
│   ├── atoms/           # Basic components (BaseButton, BaseCard, etc.)
│   ├── molecules/       # Compound components (TaskItem, TaskList, etc.)
│   ├── organisms/       # Complex components (MainNavbar)
│   └── templates/       # Page layouts (DashboardTemplate)
├── pages/               # App pages
├── layouts/             # Nuxt layouts
├── composables/         # Vue 3 composables
├── stores/              # Pinia stores
├── types/               # TypeScript definitions
├── utils/               # Utilities and helpers
│   └── routes.ts        # Centralized routes
├── assets/              # Static assets
├── public/              # Public files
└── docs/                # Documentation
    └── COMPONENTS.md    # Component docs
```

---

## 🏗️ Atomic Design Architecture

### 🟢 Atoms
- `BaseButton.vue` - Button with variants
- `BaseCard.vue` - Card container
- `BaseInput.vue` - Input field
- `Badge.vue` - Small label

### 🔵 Molecules
- `TaskItem.vue` - Single task item
- `TaskList.vue` - Task list with filters
- `PageHeader.vue` - Page header
- `FloatingTimer.vue` - Floating timer
- `QuickTaskInput.vue` - Quick task input
- `StreakCard.vue` - Streak card
- `ProgressVisual.vue` - Progress visualization

### 🟡 Organisms
- `MainNavbar.vue` - Main navigation bar

### 🟠 Templates
- `DashboardTemplate.vue` - Dashboard layout

---

## 🛣️ Centralized Routing

All routes are centralized in `utils/routes.ts`:

```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  HOY: '/hoy',
  TAREAS: '/tareas',
  PROYECTOS: '/proyectos',
  MATERIAS: '/materias',
  CATEGORIAS: '/categorias',
  HORARIO: '/horario',
  ANALITICAS: '/analiticas',
  ENFOQUE: '/enfoque',
  FOCUS: '/focus',
  PERFIL: '/perfil',
  CONFIGURACION: '/configuracion'
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn or npm

### Installation
```bash
# Clone the repo
git clone https://github.com/your-username/ritmo.git
cd ritmo

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Available Scripts
```bash
# Development
yarn dev          # Start dev server
yarn build        # Production build
yarn preview      # Preview production build

# Linting & Formatting
yarn lint         # Run ESLint
yarn lint:fix     # Fix lint errors
yarn format       # Format code with Prettier

# Testing
yarn test         # Run tests
yarn test:watch   # Watch mode
```

---

## 📋 Features & Roadmap

### ✅ Completed
- [x] Dashboard with streak and stats
- [x] Task system with integrated timer
- [x] Category management with colors and icons
- [x] Full app configuration
- [x] Responsive navbar
- [x] Focus mode for study sessions
- [x] Task filters and search
- [x] Notification system
- [x] Data export
- [x] Responsive design (Mobile First)
- [x] Accessibility (WCAG)
- [x] **Unused components cleaned up**
- [x] **Centralized routes**
- [x] **Optimized Atomic Design structure**

### 🔄 In Progress
- [ ] Backend integration
- [ ] Cloud sync
- [ ] Push notifications
- [ ] Offline mode
- [ ] Study pattern analytics
- [ ] AI suggestions

### 📋 To Do
- [ ] Unit & integration tests
- [ ] PWA (Progressive Web App)
- [ ] External calendar integration
- [ ] Advanced reminders
- [ ] Reports & analytics
- [ ] Collaborative mode

---

## 🧹 Cleanup & Refactoring

### Removed Components
- `SimpleTimer.vue` - Replaced by `FloatingTimer.vue`
- `MobileNavLink.vue` - Integrated into `MainNavbar.vue`
- `NavLink.vue` - Integrated into `MainNavbar.vue`
- `FormInput.vue` - Replaced by `BaseInput.vue`
- `TaskSection.vue` - Integrated into `TaskList.vue`
- `AuthTemplate.vue` - Not used

### Removed Dev Pages
- `test.vue` - Test page
- `test-navbar.vue` - Navbar test page
- `navbar-demo.vue` - Navbar demo

### Improvements
- **Centralized routes**: All routes in `utils/routes.ts`
- **Import aliases**: Consistent use of `@components`, `@utils`, etc.
- **Documentation**: `docs/COMPONENTS.md` for components
- **Optimized structure**: Follows Atomic Design

---

## 🎯 How to Use

### For Students
1. **Set up your profile:** Define daily goals and preferences
2. **Create categories:** Organize tasks by subject or project
3. **Plan sessions:** Create tasks with specific durations
4. **Use Focus Mode:** Eliminate distractions while studying
5. **Track your progress:** Monitor your streak and stats

### For Professionals
1. **Organize projects:** Use categories for different projects
2. **Manage time:** Use the timer for work sessions
3. **Set priorities:** Mark tasks by priority
4. **Analyze productivity:** Review your work patterns

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow Atomic Design principles
- Keep color palette consistent
- Ensure accessibility in all components
- Write tests for new features
- Document important changes
- **Use centralized routes** from `utils/routes.ts`
- **Follow the component structure** in `docs/COMPONENTS.md`

---

## 📚 Documentation

- **[Component Docs](./docs/COMPONENTS.md)** – Full guide to all components
- **[README Components](./README_COMPONENTS.md)** – Technical component docs
- **[Timer Flow](./README_TIMER_FLOW.md)** – Timer system documentation

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🙏 Acknowledgements

- **Vue.js Team** – For the amazing framework
- **Tailwind CSS** – For the design system
- **Lucide** – For SVG icons
- **Dev Community** – For feedback and contributions

---

## 📞 Contact

- **Project:** [GitHub Issues](https://github.com/your-username/ritmo/issues)
- **Email:** your-email@example.com
- **Twitter:** [@your-username](https://twitter.com/your-username)

---

**Ritmo** – Make it count 🚀
