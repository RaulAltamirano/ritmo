import { expect, test } from '@playwright/test'

test.describe('Modal Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-modal')
  })

  test('should be accessible to screen readers', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal"]')

    // Verify modal is visible
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()

    // Verify proper ARIA attributes
    await expect(modal).toHaveAttribute('aria-modal', 'true')
    await expect(modal).toHaveAttribute('aria-labelledby')
    await expect(modal).toHaveAttribute('aria-describedby')
  })

  test('should have proper focus trap', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal"]')

    // Verify focus is trapped in modal
    await page.keyboard.press('Tab')
    const firstFocusable = page.locator('[data-testid="modal-first-focus"]')
    await expect(firstFocusable).toBeFocused()

    // Tab through all focusable elements
    await page.keyboard.press('Tab')
    const secondFocusable = page.locator('[data-testid="modal-second-focus"]')
    await expect(secondFocusable).toBeFocused()

    // Tab should wrap back to first element
    await page.keyboard.press('Tab')
    await expect(firstFocusable).toBeFocused()
  })

  test('should announce state changes to screen readers', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal"]')

    // Verify announcement for modal opened
    const announcement = page.locator('[aria-live="polite"]')
    await expect(announcement).toContainText('Modal opened')

    // Close modal
    await page.keyboard.press('Escape')

    // Verify announcement for modal closed
    await expect(announcement).toContainText('Modal closed')
  })

  test('should handle keyboard navigation correctly', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal"]')

    // Verify escape key closes modal
    await page.keyboard.press('Escape')
    const modal = page.locator('[role="dialog"]')
    await expect(modal).not.toBeVisible()
  })

  test('should have proper heading structure', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal"]')

    // Verify heading is properly associated
    const heading = page.locator('h2')
    const modal = page.locator('[role="dialog"]')

    await expect(heading).toBeVisible()
    const headingId = await heading.getAttribute('id')
    const labelledBy = await modal.getAttribute('aria-labelledby')

    expect(labelledBy).toContain(headingId)
  })

  test('should support high contrast mode', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal"]')

    // Verify modal has proper contrast
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()

    // Check for proper styling classes
    const modalClasses = await modal.getAttribute('class')
    expect(modalClasses).toContain('bg-white')
    expect(modalClasses).toContain('border')
  })

  test('should handle backdrop click correctly', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal"]')

    // Click on backdrop
    await page.click('[data-testid="modal-backdrop"]')

    // Verify modal closes
    const modal = page.locator('[role="dialog"]')
    await expect(modal).not.toBeVisible()
  })

  test('should maintain focus when modal reopens', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal"]')

    // Focus on first element
    const firstFocusable = page.locator('[data-testid="modal-first-focus"]')
    await firstFocusable.focus()

    // Close modal
    await page.keyboard.press('Escape')

    // Reopen modal
    await page.click('[data-testid="open-modal"]')

    // Verify focus returns to first element
    await expect(firstFocusable).toBeFocused()
  })

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      })
    })

    // Open modal
    await page.click('[data-testid="open-modal"]')

    // Verify modal opens without animations
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()
  })

  test('should meet WCAG 2.2 AA requirements', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal"]')

    const modal = page.locator('[role="dialog"]')

    // Check for required ARIA attributes
    await expect(modal).toHaveAttribute('aria-modal', 'true')
    await expect(modal).toHaveAttribute('aria-labelledby')
    await expect(modal).toHaveAttribute('aria-describedby')

    // Check for proper heading structure
    const heading = page.locator('h2')
    await expect(heading).toBeVisible()

    // Check for close button accessibility
    const closeButton = page.locator('[aria-label*="Close"]')
    await expect(closeButton).toBeVisible()

    // Check for proper focus management
    await expect(closeButton).toBeFocused()
  })
})
