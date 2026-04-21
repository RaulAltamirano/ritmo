# Database Seeding System

This directory contains a modular database seeding system for the Ritmo application.

## Structure

```
scripts/database/
├── config/
│   └── database.ts          # Centralized configuration and demo data
├── factories/
│   ├── ActivityFactory.ts   # Activity creation utilities
│   ├── CircadianPhaseFactory.ts # Circadian phase creation utilities
│   ├── UserFactory.ts       # User creation utilities
│   └── UserPreferencesFactory.ts # User preferences utilities
├── seeds/
│   ├── activities/
│   │   └── index.ts         # Activity seeding functions
│   ├── circadian/
│   │   └── index.ts         # Circadian phase seeding functions
│   ├── categories/
│   │   └── index.ts         # Category seeding functions (placeholder)
│   ├── sessions/
│   │   └── index.ts         # User preferences seeding functions
│   └── users/
│       └── index.ts         # User seeding functions
├── utils/
│   └── DatabaseSeeder.ts    # Main seeding orchestrator
├── index.ts                 # Main exports
└── seed.ts                  # Main seeding entry point
```

## Features

### 🌅 Circadian Phases
- **Dawn** (5-7 AM): Natural awakening and preparation phase
- **Morning** (7-12 PM): High energy and concentration phase  
- **Afternoon** (12-5 PM): Moderate energy and collaboration phase
- **Evening** (5-8 PM): Transition and reflection phase
- **Night** (8 PM-5 AM): Rest and recovery phase

### 👤 Demo User
- Email: `demo@ritmo.app`
- Username: `demo`
- Password: `Demo123!`
- Language: English
- Timezone: America/Mexico_City

### 📝 Sample Activities
- Project documentation (Work)
- React patterns study (Learning)
- Morning workout (Health)
- Logo design (Creative)
- Team meeting (Work)

## Usage

### Run Complete Seed
```bash
pnpm db:seed
```

### Run Individual Seeds
```typescript
import { seedCircadianPhases, seedUsers } from './scripts/database'

// Seed only circadian phases
await seedCircadianPhases(prisma)

// Seed only users
await seedUsers(prisma)
```

### Use Factories Directly
```typescript
import { CircadianPhaseFactory, UserFactory } from './scripts/database'

const circadianFactory = new CircadianPhaseFactory(prisma)
const userFactory = new UserFactory(prisma)

// Create custom circadian phase
await circadianFactory.createCircadianPhase({
  type: 'slow_activation',
  category: 'activation',
  // ... other properties
})

// Create custom user
await userFactory.createUser({
  email: 'custom@example.com',
  username: 'custom',
  // ... other properties
})
```

## Configuration

All demo data is centralized in `config/database.ts`:

- `DEMO_USER_DATA`: Default user configuration
- `DEMO_ACTIVITIES`: Sample activities with timing
- `USER_PREFERENCES`: Default user preferences
- `CIRCADIAN_PHASES`: Complete circadian phase definitions

## Best Practices

1. **Modular Design**: Each entity has its own factory and seed function
2. **Centralized Config**: All demo data is in one place for easy maintenance
3. **Type Safety**: Full TypeScript support with proper typing
4. **Cleanup**: Automatic cleanup of existing data before seeding
5. **Logging**: Comprehensive logging for debugging and monitoring

## Adding New Entities

1. Add configuration to `config/database.ts`
2. Create factory in `factories/`
3. Create seed function in `seeds/`
4. Update `DatabaseSeeder` to include new entity
5. Export from `index.ts`

## Scientific References

The circadian phases include scientific references and evidence levels:
- **High Evidence**: Dawn, Morning, Night phases
- **Medium Evidence**: Afternoon, Evening phases

This ensures the system is based on established circadian rhythm research.
