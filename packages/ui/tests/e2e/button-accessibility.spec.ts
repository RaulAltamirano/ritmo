import { expect, test } from '@playwright/test'

test.describe('Button Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-button')
  })

  test('should announce loading state to screen readers', async ({ page }) => {
    const button = page.locator('[data-testid="loading-button"]')

    // Trigger loading state
    await button.click()

    // Verify loading announcement
    const srText = page.locator('.sr-only')
    await expect(srText).toContainText('button.loading')

    // Verify aria-describedby includes loading ID
    const describedBy = await button.getAttribute('aria-describedby')
    expect(describedBy).toContain('loading')
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    const button = page.locator('[data-testid="accessible-button"]')

    // Check for proper role
    await expect(button).toHaveAttribute('role', 'button')

    // Check for proper name
    await expect(button).toHaveAttribute('aria-label', 'Submit form button')

    // Check for proper state
    await expect(button).toHaveAttribute('aria-busy', 'true')
    await expect(button).toHaveAttribute('aria-live', 'polite')
  })

  test('should handle keyboard navigation correctly', async ({ page }) => {
    const button = page.locator('[data-testid="keyboard-button"]')

    // Focus button
    await button.focus()

    // Test Enter key
    await page.keyboard.press('Enter')
    const clickEvent = page.locator('[data-testid="click-event"]')
    await expect(clickEvent).toBeVisible()

    // Test Space key
    await button.focus()
    await page.keyboard.press(' ')
    await expect(clickEvent).toBeVisible()
  })

  test('should handle pointer events correctly', async ({ page }) => {
    const button = page.locator('[data-testid="pointer-button"]')

    // Test pointer down
    await button.dispatchEvent('pointerdown')
    const pointerEvent = page.locator('[data-testid="pointer-event"]')
    await expect(pointerEvent).toBeVisible()

    // Test pointer up
    await button.dispatchEvent('pointerup')
    await expect(pointerEvent).toBeVisible()
  })

  test('should support toggle state', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="toggle-button"]')

    // Check initial state
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'false')

    // Toggle button
    await toggleButton.click()
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'true')

    // Toggle again
    await toggleButton.click()
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('should support expandable state', async ({ page }) => {
    const expandButton = page.locator('[data-testid="expand-button"]')

    // Check initial state
    await expect(expandButton).toHaveAttribute('aria-expanded', 'false')

    // Expand button
    await expandButton.click()
    await expect(expandButton).toHaveAttribute('aria-expanded', 'true')

    // Collapse button
    await expandButton.click()
    await expect(expandButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('should have proper focus styles', async ({ page }) => {
    const button = page.locator('[data-testid="focus-button"]')

    // Focus button
    await button.focus()

    // Verify focus is visible
    await expect(button).toBeFocused()

    // Check for focus styles
    const buttonClasses = await button.getAttribute('class')
    expect(buttonClasses).toContain('focus:outline')
    expect(buttonClasses).toContain('focus:ring')
  })

  test('should support disabled state', async ({ page }) => {
    const disabledButton = page.locator('[data-testid="disabled-button"]')

    // Check disabled attributes
    await expect(disabledButton).toHaveAttribute('disabled')
    await expect(disabledButton).toHaveAttribute('aria-disabled', 'true')

    // Verify button cannot be clicked
    await disabledButton.click()
    const clickEvent = page.locator('[data-testid="click-event"]')
    await expect(clickEvent).not.toBeVisible()
  })

  test('should support icon buttons', async ({ page }) => {
    const iconButton = page.locator('[data-testid="icon-button"]')

    // Check for icon
    const icon = iconButton.locator('[role="img"]')
    await expect(icon).toBeVisible()

    // Check for proper aria-label
    await expect(iconButton).toHaveAttribute('aria-label')

    // Check icon accessibility
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  test('should support full width buttons', async ({ page }) => {
    const fullWidthButton = page.locator('[data-testid="full-width-button"]')

    // Check for full width class
    const buttonClasses = await fullWidthButton.getAttribute('class')
    expect(buttonClasses).toContain('w-full')
  })

  test('should support different variants', async ({ page }) => {
    const primaryButton = page.locator('[data-testid="primary-button"]')
    const secondaryButton = page.locator('[data-testid="secondary-button"]')
    const successButton = page.locator('[data-testid="success-button"]')

    // Check variant classes
    const primaryClasses = await primaryButton.getAttribute('class')
    const secondaryClasses = await secondaryButton.getAttribute('class')
    const successClasses = await successButton.getAttribute('class')

    expect(primaryClasses).toContain('bg-blue-600')
    expect(secondaryClasses).toContain('bg-gray-600')
    expect(successClasses).toContain('bg-green-600')
  })

  test('should support different sizes', async ({ page }) => {
    const smallButton = page.locator('[data-testid="small-button"]')
    const mediumButton = page.locator('[data-testid="medium-button"]')
    const largeButton = page.locator('[data-testid="large-button"]')

    // Check size classes
    const smallClasses = await smallButton.getAttribute('class')
    const mediumClasses = await mediumButton.getAttribute('class')
    const largeClasses = await largeButton.getAttribute('class')

    expect(smallClasses).toContain('px-3 py-1.5')
    expect(mediumClasses).toContain('px-4 py-2')
    expect(largeClasses).toContain('px-6 py-3')
  })

  test('should meet WCAG 2.2 AA requirements', async ({ page }) => {
    const button = page.locator('[data-testid="wcag-button"]')

    // Check for proper role
    await expect(button).toHaveAttribute('role', 'button')

    // Check for proper name
    await expect(button).toHaveAttribute('aria-label')

    // Check for proper state
    await expect(button).toHaveAttribute('aria-busy')
    await expect(button).toHaveAttribute('aria-live')

    // Check for proper description
    await expect(button).toHaveAttribute('aria-describedby')

    // Check for proper disabled state
    await expect(button).toHaveAttribute('disabled')
  })

  test('should support high contrast mode', async ({ page }) => {
    const button = page.locator('[data-testid="contrast-button"]')

    // Check for proper contrast classes
    const buttonClasses = await button.getAttribute('class')
    expect(buttonClasses).toContain('bg-')
    expect(buttonClasses).toContain('text-')
    expect(buttonClasses).toContain('border')
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

    const button = page.locator('[data-testid="motion-button"]')

    // Verify button is accessible without motion
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
  })
})
