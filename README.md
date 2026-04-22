<!-- Logo -->
<p align="center">
  <img src="public/logo-ritmo.svg" alt="Ritmo Logo" width="64" height="64" />
</p>

# 🚀 RITMO - Technical Documentation

## 📋 **OVERVIEW**

Ritmo is a **monorepo** personal productivity application with unified configuration. Complete system with backend API, web frontend, and landing page built with modern technologies.

> **📖 Looking for product information?** See [PRODUCT.md](PRODUCT.md) for features, use cases, and user guides.
> **📚 Complete documentation available in the [docs/](docs/) folder.**

## 📚 **Documentation Overview**

- **[README.md](README.md)** - Technical setup and development (this file)
- **[PRODUCT.md](PRODUCT.md)** - Product features and user guide
- **[docs/](docs/)** - Complete documentation library
  - [Quick Start](docs/QUICKSTART.md) - 5-minute setup guide
  - [Design System](docs/COLORS.md) - Color palette and UI guidelines
  - [API Reference](docs/API.md) - Backend development
  - [User Manual](docs/USER-GUIDE.md) - Complete user guide

## 🏗️ **ARCHITECTURE**

```
📁 ritmo/
├── 📄 .env                    ← Centralized configuration
├── 📁 packages/
│   ├── 📁 config/            ← Unified configuration system
│   ├── 📁 shared/            ← Shared utilities
│   └── 📁 ui/                ← UI components
├── 📁 apps/
│   ├── 📁 api/               ← Backend (Node.js + Express + Prisma)
│   ├── 📁 web/               ← Frontend (Vue + Nuxt)
│   └── 📁 landing/           ← Landing page
├── 📁 docker/                 ← Services (PostgreSQL, Redis)
├── 📄 docker-compose.yml      ← Orchestration
└── 📁 scripts/                ← Unified utilities
    ├── 📁 database/           ← Centralized seed system
    ├── 📁 setup/              ← Environment configuration
    └── 📁 utils/              ← Shared utilities
```

## 🚀 **QUICK DEPLOYMENT**

### **1. Prerequisites**

```bash
# Node.js 18+, pnpm, Docker, Docker Compose
node --version
pnpm --version
docker --version
docker-compose --version
```

### **2. Initial Setup**

```bash
# Clone and configure
git clone <repository-url>
cd ritmo
pnpm install -w

# Configure environment
pnpm run setup-env

# Validate configuration
pnpm run validate-env
pnpm run validate-db
```

### **3. Start Services**

```bash
# Start database and Redis
docker-compose up -d

# Verify services
docker-compose ps
```

### **4. Initialize Database**

Apply migrations, then seed (required for `circadian_phases` and related catalog data):

```bash
pnpm --filter @ritmo/api db:deploy
pnpm --filter @ritmo/api db:seed
```

Local convenience (if your root scripts wrap the same):

```bash
# Create demo user and sample data
pnpm run seed

# Verify demo user
pnpm run demo:user --info
```

Use the same **migrate → seed** order in staging and production after deploy.

### **5. Start Development**

```bash
# Backend
pnpm run dev:api

# Frontend (new terminal)
pnpm run dev:web

# Landing (new terminal)
pnpm run dev:landing
```

## 🔧 **CORE SCRIPTS**

### **🌱 Database**

```bash
pnpm run seed              # Complete seed
pnpm run seed:demo         # Demo user only
pnpm run seed:reset        # Complete reset
pnpm run seed:validate     # Validation only
```

### **👤 Demo User**

```bash
pnpm run demo:user         # Create demo user
pnpm run demo:user --info  # View information
pnpm run demo:reset        # Reset demo user
```

### **🔍 Validation**

```bash
pnpm run validate-env      # Validate environment
pnpm run validate-db       # Validate database
pnpm run validate:all      # Validate everything
```

### **🐳 Docker**

```bash
pnpm run docker:up         # Start services
pnpm run docker:down       # Stop services
pnpm run docker:build      # Build images
```

## 📊 **DATA STRUCTURE**

### **🗄️ Core Models**

- **User**: System users with preferences
- **Category**: Task and activity categories
- **Task**: Tasks with priorities and deadlines
- **Activity**: Time tracking activities
- **UserPreferences**: Personalized configuration
- **EmailNotificationSettings**: Email notifications

### **🔐 Authentication**

- JWT with refresh tokens
- Device validation with HMAC
- Secure sessions with Redis
- Rate limiting and audit logs

## 🌐 **APPLICATIONS**

### **🚀 API Backend** (`apps/api`)

- **Port**: 3001
- **Technologies**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL + Redis
- **Authentication**: JWT + Refresh tokens

### **🌐 Web Frontend** (`apps/web`)

- **Port**: 3000
- **Technologies**: Vue.js + Nuxt.js + TypeScript
- **UI**: Tailwind CSS + Custom components
- **State**: Pinia + Composables

### **🏠 Landing Page** (`apps/landing`)

- **Port**: 3002
- **Technologies**: Vue.js + Vite
- **Purpose**: Product presentation page

## 🔧 **CONFIGURATION**

### **📄 Environment Variables** (`.env`)

```bash
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ritmo
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# JWT (change in production)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
SESSION_SECRET=your-session-secret

# Demo user
DEMO_USER_EMAIL=demo@ritmo.app
DEMO_USER_PASSWORD=Demo123!
```

### **🐳 Docker Compose**

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - '5433:5432'

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - '6379:6379'
```

## 🛠️ **DEVELOPMENT**

### **📦 Dependency Installation**

```bash
# Install everything
pnpm install -w

# Install only API
pnpm --filter=@ritmo/api install

# Install only frontend
pnpm --filter=@ritmo/web install
```

### **🏗️ Building**

```bash
# Build everything
pnpm run build

# Build only API
pnpm run build:api

# Build only frontend
pnpm run build:web
```

### **🧪 Testing**

```bash
# API tests
pnpm --filter=@ritmo/api test

# Linting
pnpm run lint

# Formatting
pnpm run format
```

## 🚨 **TROUBLESHOOTING**

### **❌ Error: "Cannot find module '@ritmo/config'"**

```bash
cd packages/config && pnpm run build
cd ../.. && pnpm install -w
```

### **❌ Error: "Database connection failed"**

```bash
pnpm run validate-db
docker-compose up -d postgres
```

### **❌ Error: "JWT invalid signature"**

```bash
pnpm run validate-env
pnpm run seed:reset
```

### **❌ Error: "Port already in use"**

```bash
# Check ports in use
lsof -i :3000
lsof -i :3001
lsof -i :5433
lsof -i :6379
```

## 📚 **USEFUL COMMANDS**

### **🔍 Diagnostics**

```bash
# System status
pnpm run validate:all
docker-compose ps

# Service logs
docker-compose logs postgres
docker-compose logs redis
docker-compose logs api
```

### **🗄️ Database**

```bash
# Prisma Studio
pnpm run db:studio

# Complete reset
pnpm run db:reset

# Schema push
pnpm run db:push
```

### **🧹 Cleanup**

```bash
# Clean node_modules
pnpm run clean

# Clean Docker
docker-compose down -v
docker system prune -f
```

## 🎯 **TECHNICAL FEATURES**

- ✅ **Monorepo architecture** with unified configuration
- ✅ **TypeScript** throughout the stack
- ✅ **Prisma ORM** with PostgreSQL
- ✅ **Redis** for sessions and caching
- ✅ **JWT authentication** with refresh tokens
- ✅ **Device fingerprinting** with HMAC
- ✅ **Complete audit logging** system
- ✅ **Rate limiting** and security protection
- ✅ **Docker containerization** for all services
- ✅ **Unified seeding** and database management

## 🤝 **CONTRIBUTION**

1. **Fork and clone** the repository
2. **Configure environment** with `pnpm run setup-env`
3. **Validate system** with `pnpm run validate:all`
4. **Create branch** for your feature
5. **Develop and test** changes
6. **Commit and push** with descriptive messages
7. **Create Pull Request** with clear description

## 📄 **LICENSE**

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 **SUPPORT**

- **Documentation**: This README
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

## 🎉 **READY TO USE!**

Ritmo is configured with **unified configuration** and **centralized seed system**. Run `pnpm run seed` to start with sample data.

**🚀 Start your development journey!**
