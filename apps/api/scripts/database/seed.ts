import { PrismaClient } from '@prisma/client'
import { DatabaseSeeder } from './utils/DatabaseSeeder'

const prisma = new PrismaClient()

async function main() {
  const seeder = new DatabaseSeeder(prisma)
  await seeder.seedDemoData()
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
