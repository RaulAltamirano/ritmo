#!/usr/bin/env tsx

/**
 * Update Storybook Stories Script
 *
 * This script automatically updates all Storybook story files
 * to reflect the new categorized structure.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'

interface StoryUpdate {
  oldTitle: string
  newTitle: string
  filePath: string
}

/**
 * Mapping of old titles to new categorized titles
 */
const titleMappings: Record<string, string> = {
  // Atoms
  'Atoms/BaseButton': 'Design System/Atoms/Interactive/BaseButton',
  'Atoms/BaseInput': 'Design System/Atoms/Forms/BaseInput',
  'Atoms/BaseCheckbox': 'Design System/Atoms/Forms/BaseCheckbox',
  'Atoms/BaseAlert': 'Design System/Atoms/Feedback/BaseAlert',
  'Atoms/BaseToast': 'Design System/Atoms/Feedback/BaseToast',
  'Atoms/BaseBadge': 'Design System/Atoms/Feedback/BaseBadge',
  'Atoms/BaseCard': 'Design System/Atoms/Layout/BaseCard',
  'Atoms/BaseSkeleton': 'Design System/Atoms/Layout/BaseSkeleton',
  'Atoms/BaseModal': 'Design System/Atoms/Interactive/BaseModal',
  'Atoms/BaseIcon': 'Design System/Atoms/Display/BaseIcon',
  'Atoms/BaseSpinner': 'Design System/Atoms/Display/BaseSpinner',
  'Atoms/BaseLoadingSpinner': 'Design System/Atoms/Display/BaseLoadingSpinner',
  'Atoms/RitmoLogo': 'Design System/Atoms/Display/RitmoLogo',
  'Atoms/ClientOnly': 'Design System/Atoms/Display/ClientOnly',
  'Atoms/CloseButtonDemo': 'Design System/Atoms/Interactive/CloseButtonDemo',

  // Molecules
  'Molecules/LoginForm': 'Design System/Molecules/Forms/LoginForm',
  'Molecules/RegisterForm': 'Design System/Molecules/Forms/RegisterForm',
  'Molecules/DarkModeToggle': 'Design System/Molecules/Navigation/DarkModeToggle',
  'Molecules/RitmoBrand': 'Design System/Molecules/Navigation/RitmoBrand',

  // Organisms
  'Organisms/BaseNavbar': 'Design System/Organisms/Navigation/BaseNavbar',
  'Organisms/BaseNavItem': 'Design System/Organisms/Navigation/BaseNavItem',
  'Organisms/BaseNavDropdown': 'Design System/Organisms/Navigation/BaseNavDropdown',

  // Templates
  'Templates/AuthLayout': 'Design System/Templates/Layouts/AuthLayout',
  'Templates/DashboardLayout': 'Design System/Templates/Layouts/DashboardLayout',
  'Templates/LandingLayout': 'Design System/Templates/Layouts/LandingLayout',
  'Templates/AdminLayout': 'Design System/Templates/Layouts/AdminLayout',
}

/**
 * Recursively find all .stories.ts files
 */
function findStoryFiles(dir: string): string[] {
  const files: string[] = []

  try {
    const items = readdirSync(dir)

    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        files.push(...findStoryFiles(fullPath))
      } else if (item.endsWith('.stories.ts')) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error)
  }

  return files
}

/**
 * Update a single story file
 */
function updateStoryFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8')
    let updated = false
    let newContent = content

    // Find and replace title patterns
    for (const [oldTitle, newTitle] of Object.entries(titleMappings)) {
      const titlePattern = new RegExp(
        `title:\\s*['"]${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
        'g',
      )

      if (titlePattern.test(newContent)) {
        newContent = newContent.replace(titlePattern, `title: '${newTitle}'`)
        updated = true
        console.log(`✅ Updated ${filePath}: ${oldTitle} → ${newTitle}`)
      }
    }

    if (updated) {
      writeFileSync(filePath, newContent, 'utf-8')
      return true
    }

    return false
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error)
    return false
  }
}

/**
 * Main function to update all story files
 */
function updateAllStories(): void {
  console.log('🚀 Updating Storybook stories...')

  const srcDir = join(process.cwd(), 'src', 'components')
  const storyFiles = findStoryFiles(srcDir)

  console.log(`📁 Found ${storyFiles.length} story files`)

  let updatedCount = 0

  for (const filePath of storyFiles) {
    if (updateStoryFile(filePath)) {
      updatedCount++
    }
  }

  console.log(`🎉 Updated ${updatedCount} story files`)

  if (updatedCount === 0) {
    console.log('ℹ️  No stories needed updating')
  }
}

/**
 * Generate new story file template
 */
function generateStoryTemplate(
  level: string,
  category: string,
  component: string,
): string {
  return `import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ${component} from './${component}.vue'

const meta: Meta<typeof ${component}> = {
  title: 'Design System/${level}/${category}/${component}',
  component: ${component},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${component} component description'
      }
    }
  },
  argTypes: {
    // Define argTypes here
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { ${component} },
    setup() {
      return { args }
    },
    template: '<${component} v-bind="args" />'
  })
}
`
}

/**
 * Create missing story files
 */
function createMissingStories(): void {
  console.log('🚀 Creating missing story files...')

  const componentsDir = join(process.cwd(), 'src', 'components')
  const missingStories: Array<{
    level: string
    category: string
    component: string
    filePath: string
  }> = []

  // Find components without stories
  function findMissingStories(dir: string, level: string, category?: string) {
    try {
      const items = readdirSync(dir)

      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          findMissingStories(fullPath, level, item)
        } else if (item.endsWith('.vue') && !item.includes('.stories.')) {
          const componentName = item.replace('.vue', '')
          const storyPath = join(dir, `${componentName}.stories.ts`)

          if (!statSync(storyPath).isFile()) {
            missingStories.push({
              level,
              category: category || 'unknown',
              component: componentName,
              filePath: storyPath,
            })
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }

  findMissingStories(componentsDir, 'Components')

  console.log(`📁 Found ${missingStories.length} components without stories`)

  for (const { level, category, component, filePath } of missingStories) {
    try {
      const template = generateStoryTemplate(level, category, component)
      writeFileSync(filePath, template, 'utf-8')
      console.log(`✅ Created ${filePath}`)
    } catch (error) {
      console.error(`❌ Error creating ${filePath}:`, error)
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.includes('--create-missing')) {
    createMissingStories()
  } else {
    updateAllStories()
  }
}

export { createMissingStories, generateStoryTemplate, updateAllStories }
