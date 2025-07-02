<!-- Logo -->
<p align="center">
  <img src="public/logo-ritmo.svg" alt="Ritmo Logo" width="64" height="64" />
</p>

# Ritmo

Boost your productivity with Ritmo: a modern web app to manage tasks, study, and work better.

## 🚀 How it works

Ritmo helps you organize your day with a smart dashboard, quick task creation, and a built-in timer. Create categories for your activities, start focused sessions, and track your progress visually. Use the focus mode to study or work without distractions, and get notified about your goals and tasks. Everything is designed to be fast, simple, and mobile-friendly.

## ✨ Main Features

- 🎯 Smart dashboard with productivity analytics
- ⚡ Fast task and category management
- ⏱️ Built-in timer (Pomodoro and custom sessions)
- 🎨 Focus mode and notifications
- 📱 Responsive and accessible design
- 📊 Activity tracking and metrics
- 📅 Intelligent scheduling system
- 🌙 Dark/Light theme support

## 🛠️ Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Database**: PostgreSQL with Prisma ORM
- **Containerization**: Docker & Docker Compose
- **Calendar**: FullCalendar
- **Icons**: Lucide Vue Next
- **Internationalization**: @nuxtjs/i18n

## 📋 Prerequisites

- Node.js 18+ 
- Yarn or npm
- Docker & Docker Compose

## 🚀 Quick Start

### Option 1: Full Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/your-username/ritmo.git
cd ritmo

# Install dependencies
yarn install

# Start everything (Docker + Database + Seed + Dev Server)
yarn dev:full
```

### Option 2: Manual Setup
```bash
# Clone and install dependencies
git clone https://github.com/your-username/ritmo.git
cd ritmo
yarn install

# Start Docker services
yarn docker:up

# Wait for database to be ready, then run migrations
yarn db:migrate

# Seed the database with sample data
yarn db:seed

# Start development server
yarn dev
```

## 📚 Available Scripts

### Development
- `yarn dev` – Start development server
- `yarn dev:full` – Complete setup + development server
- `yarn build` – Production build
- `yarn start` – Start production server
- `yarn preview` – Preview production build

### Database Management
- `yarn db:generate` – Generate Prisma client
- `yarn db:migrate` – Run database migrations
- `yarn db:deploy` – Deploy migrations to production
- `yarn db:studio` – Open Prisma Studio (database GUI)
- `yarn db:seed` – Seed database with sample data
- `yarn db:reset` – Reset database (⚠️ destructive)
- `yarn db:push` – Push schema changes to database
- `yarn db:pull` – Pull database schema

### Docker Management
- `yarn docker:up` – Start Docker services
- `yarn docker:down` – Stop Docker services
- `yarn docker:logs` – View Docker logs
- `yarn docker:reset` – Reset Docker volumes and restart

### Code Quality
- `yarn lint` – Run ESLint
- `yarn format` – Format code with Prettier
- `yarn test` – Run tests

### Setup & Utilities
- `yarn setup` – Complete environment setup
- `yarn install` – Install dependencies

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - User accounts and profiles
- **Activities** - Tasks and activities with types and priorities
- **Schedules** - Recurring schedule templates
- **ScheduleBlocks** - Time blocks within schedules
- **ActivityMetrics** - Productivity analytics and tracking
- **UserPreferences** - User settings and preferences

## 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ritmo"

# Environment
NODE_ENV=development

# Optional: Redis for caching (future use)
REDIS_URL="redis://localhost:6379"
```

## 🐳 Docker Services

The project includes Docker Compose configuration for:

- **PostgreSQL 16** - Main database
- **Redis 7** - Caching layer (optional)

### Docker Commands
```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Reset everything
docker compose down -v && docker compose up -d
```

## 📊 Sample Data

The seed script creates:
- Demo user with profile and preferences
- Sample activities across different types
- Default weekly schedule
- Activity metrics for the past week

**Demo User Credentials:**
- Email: `demo@ritmo.app`
- Password: (No authentication implemented yet)

## 🏗️ Project Structure

```
ritmo/
├── components/          # Vue components
│   ├── atoms/          # Basic UI components
│   ├── molecules/      # Compound components
│   └── organisms/      # Complex components
├── composables/        # Vue composables
├── layouts/           # Nuxt layouts
├── pages/             # Application pages
├── plugins/           # Nuxt plugins
├── prisma/            # Database schema and migrations
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Database seeder
├── public/            # Static assets
├── server/            # Server-side code
│   ├── api/           # API endpoints
│   ├── lib/           # Server utilities
│   └── services/      # Business logic services
├── stores/            # Pinia stores
├── types/             # TypeScript type definitions
├── docker-compose.yml # Docker services
└── package.json       # Dependencies and scripts
```

## 🔄 Development Workflow

1. **Start Development:**
   ```bash
   yarn dev:full
   ```

2. **Make Changes:**
   - Edit components in `components/`
   - Add pages in `pages/`
   - Update API in `server/api/`
   - Modify database schema in `prisma/schema.prisma`

3. **Database Changes:**
   ```bash
   # After schema changes
   yarn db:migrate
   yarn db:generate
   ```

4. **Add Sample Data:**
   ```bash
   yarn db:seed
   ```

## 🚀 Deployment

### Production Build
```bash
yarn build
yarn start
```

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if Docker is running
docker ps

# Restart database
yarn docker:reset

# Check database logs
yarn docker:logs
```

### Prisma Issues
```bash
# Regenerate Prisma client
yarn db:generate

# Reset database
yarn db:reset

# Check Prisma Studio
yarn db:studio
```

### Port Conflicts
If port 3000 or 5432 is in use:
```bash
# Kill processes on ports
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5432 | xargs kill -9
```

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the Prisma documentation
