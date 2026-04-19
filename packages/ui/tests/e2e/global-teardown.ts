import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  // Cleanup global test data or resources if needed
  console.log('Global teardown completed')
}

export default globalTeardown
