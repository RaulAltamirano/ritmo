// Configuration for @storybook/test-runner
// TODO: Install missing packages:
// npm install @storybook/test-runner axe-playwright --save-dev

import type { TestRunnerConfig } from '@storybook/test-runner'
import { checkA11y, configureAxe, injectAxe } from 'axe-playwright'

const config: TestRunnerConfig = {
  setup() {
    // Global setup before all tests
  },

  async preVisit(page) {
    // Inject axe-core into every page before visiting stories
    await injectAxe(page)
  },

  async postVisit(page, context) {
    // Configure axe for WCAG 2.1 AA compliance
    await configureAxe(page, {
      rules: [
        // Enable critical accessibility rules
        { id: 'color-contrast', enabled: true },
        { id: 'button-name', enabled: true },
        { id: 'form-field-multiple-labels', enabled: true },
        { id: 'aria-required-attr', enabled: true },
        { id: 'aria-describedby', enabled: true },
        { id: 'heading-order', enabled: true },
        { id: 'landmark-one-main', enabled: true },
        { id: 'page-has-heading-one', enabled: true },
        { id: 'region', enabled: true },
        { id: 'skip-link', enabled: true },
        { id: 'aria-valid-attr-value', enabled: true },
        { id: 'aria-input-field-name', enabled: true },
        { id: 'focus-order-semantics', enabled: true },
        { id: 'keyboard', enabled: true },
      ],
    })

    // Run accessibility tests on each story
    await checkA11y(
      page,
      '#storybook-root',
      {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      },
      true,
      'v2',
    )
  },
}

export default config
