#!/usr/bin/env tsx

/**
 * Generate Documentation Script
 *
 * This script automatically generates documentation for all components
 * based on the component categories configuration.
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { componentCategories } from '../config/component-categories'

interface DocumentationOptions {
  outputDir: string
  includeExamples: boolean
  includeAccessibility: boolean
  includeTypes: boolean
  includeComposables: boolean
}

const defaultOptions: DocumentationOptions = {
  outputDir: 'docs',
  includeExamples: true,
  includeAccessibility: true,
  includeTypes: true,
  includeComposables: true,
}

/**
 * Generate README for a specific category
 */
function generateCategoryReadme(
  level: string,
  category: string,
  options: DocumentationOptions = defaultOptions,
): string {
  const levelConfig = componentCategories[level]
  if (!levelConfig) {
    throw new Error(`Unknown level: ${level}`)
  }

  const categoryConfig = levelConfig.categories[category]
  if (!categoryConfig) {
    throw new Error(`Unknown category: ${category}`)
  }

  const levelName = levelConfig.name
  const categoryName = categoryConfig.name
  const description = categoryConfig.description

  let content = `# ${levelName}/${categoryName}\n\n`
  content += `${description}\n\n`

  // Components section
  content += `## Components\n\n`
  categoryConfig.components.forEach(component => {
    content += `### ${component}\n\n`
    content += `A ${levelName.toLowerCase()} component for ${categoryName.toLowerCase()}.\n\n`

    if (options.includeExamples) {
      content += `\`\`\`vue\n`
      content += `<template>\n`
      content += `  <${component} />\n`
      content += `</template>\n\n`
      content += `<script setup>\n`
      content += `import { ${component} } from '@ritmo/ui/${level}/${category}'\n`
      content += `</script>\n`
      content += `\`\`\`\n\n`
    }

    if (options.includeTypes && categoryConfig.types) {
      const componentType = categoryConfig.types.find(type =>
        type.toLowerCase().includes(component.toLowerCase().replace('base', '')),
      )
      if (componentType) {
        content += `**Props:** \`${componentType}\`\n\n`
      }
    }

    content += `**Storybook:** [/storybook/?path=/${levelName}/${categoryName}/${component}](/storybook/?path=/${levelName}/${categoryName}/${component})\n\n`
  })

  // Composables section
  if (options.includeComposables && categoryConfig.composables) {
    content += `## Composables\n\n`
    categoryConfig.composables.forEach(composable => {
      content += `### ${composable}\n\n`
      content += `A composable for ${categoryName.toLowerCase()} functionality.\n\n`
      content += `\`\`\`typescript\n`
      content += `import { ${composable} } from '@ritmo/ui'\n\n`
      content += `const { /* composable returns */ } = ${composable}()\n`
      content += `\`\`\`\n\n`
    })
  }

  // Types section
  if (options.includeTypes && categoryConfig.types) {
    content += `## Types\n\n`
    categoryConfig.types.forEach(type => {
      content += `### ${type}\n\n`
      content += `TypeScript interface for ${categoryName.toLowerCase()} components.\n\n`
      content += `\`\`\`typescript\n`
      content += `import type { ${type} } from '@ritmo/ui'\n`
      content += `\`\`\`\n\n`
    })
  }

  // Accessibility section
  if (options.includeAccessibility) {
    content += `## Accessibility\n\n`
    content += `All components in this category are built with accessibility in mind:\n\n`
    content += `- **WCAG 2.2 AA** compliant\n`
    content += `- **Keyboard navigation** support\n`
    content += `- **Screen reader** friendly\n`
    content += `- **High contrast** mode support\n`
    content += `- **Focus management** implemented\n\n`
    content += `For more details, see [Accessibility Guidelines](/docs/accessibility/guidelines.md)\n\n`
  }

  // Usage examples
  if (options.includeExamples) {
    content += `## Usage Examples\n\n`
    content += `### Basic Usage\n\n`
    content += `\`\`\`vue\n`
    content += `<template>\n`
    content += `  <div>\n`
    categoryConfig.components.slice(0, 2).forEach(component => {
      content += `    <${component} />\n`
    })
    content += `  </div>\n`
    content += `</template>\n\n`
    content += `<script setup>\n`
    content += `import {\n`
    categoryConfig.components.slice(0, 2).forEach(component => {
      content += `  ${component},\n`
    })
    content += `} from '@ritmo/ui/${level}/${category}'\n`
    content += `</script>\n`
    content += `\`\`\`\n\n`
  }

  // Related components
  content += `## Related Components\n\n`
  content += `- [${levelName} Overview](/docs/components/${level}/README.md)\n`
  content += `- [Design System Tokens](/docs/design-system/tokens.md)\n`
  content += `- [Component Patterns](/docs/patterns/${category}.md)\n\n`

  return content
}

/**
 * Generate main README for a level
 */
function generateLevelReadme(
  level: string,
  options: DocumentationOptions = defaultOptions,
): string {
  const levelConfig = componentCategories[level]
  if (!levelConfig) {
    throw new Error(`Unknown level: ${level}`)
  }

  const levelName = levelConfig.name
  const description = levelConfig.description
  const categories = Object.keys(levelConfig.categories)

  let content = `# ${levelName}\n\n`
  content += `${description}\n\n`

  // Categories overview
  content += `## Categories\n\n`
  categories.forEach(category => {
    const categoryConfig = levelConfig.categories[category]
    content += `### [${categoryConfig.name}](./${category}/README.md)\n\n`
    content += `${categoryConfig.description}\n\n`
    content += `**Components:** ${categoryConfig.components.join(', ')}\n\n`
  })

  // Quick start
  content += `## Quick Start\n\n`
  content += `\`\`\`typescript\n`
  content += `// Import specific components\n`
  content += `import { ${levelConfig.categories[categories[0]].components[0]} } from '@ritmo/ui/${level}/${categories[0]}'\n\n`
  content += `// Import all components from a category\n`
  content += `import * as ${categories[0]} from '@ritmo/ui/${level}/${categories[0]}'\n\n`
  content += `// Import all components from the level\n`
  content += `import * as ${levelName} from '@ritmo/ui/${level}'\n`
  content += `\`\`\`\n\n`

  // Storybook link
  content += `## Storybook\n\n`
  content += `View all ${levelName.toLowerCase()} components in Storybook:\n\n`
  content += `- [${levelName} Components](/storybook/?path=/${levelName})\n\n`

  return content
}

/**
 * Generate main documentation index
 */
function generateMainReadme(options: DocumentationOptions = defaultOptions): string {
  const levels = Object.keys(componentCategories)

  let content = `# Ritmo UI Design System\n\n`
  content += `A comprehensive Vue 3 component library built with accessibility, performance, and developer experience in mind.\n\n`

  // Architecture overview
  content += `## Architecture\n\n`
  content += `This design system follows the **Atomic Design** methodology:\n\n`
  levels.forEach(level => {
    const levelConfig = componentCategories[level]
    content += `- **[${levelConfig.name}](./docs/components/${level}/README.md)**: ${levelConfig.description}\n`
  })
  content += `\n`

  // Quick start
  content += `## Quick Start\n\n`
  content += `\`\`\`bash\n`
  content += `npm install @ritmo/ui\n`
  content += `\`\`\`\n\n`
  content += `\`\`\`typescript\n`
  content += `import { BaseButton } from '@ritmo/ui'\n`
  content += `\`\`\`\n\n`

  // Features
  content += `## Features\n\n`
  content += `- ✅ **Atomic Design** methodology\n`
  content += `- ✅ **Accessibility** WCAG 2.2 AA compliant\n`
  content += `- ✅ **TypeScript** fully typed\n`
  content += `- ✅ **Storybook** interactive documentation\n`
  content += `- ✅ **Testing** comprehensive test coverage\n`
  content += `- ✅ **Performance** optimized for production\n`
  content += `- ✅ **Tree Shaking** optimized exports\n\n`

  // Documentation links
  content += `## Documentation\n\n`
  content += `- [Getting Started](./docs/getting-started/installation.md)\n`
  content += `- [Components](./docs/components/)\n`
  content += `- [Design System](./docs/design-system/)\n`
  content += `- [Patterns](./docs/patterns/)\n`
  content += `- [Accessibility](./docs/accessibility/)\n`
  content += `- [Storybook](/storybook)\n\n`

  return content
}

/**
 * Main function to generate all documentation
 */
function generateAllDocumentation(
  options: DocumentationOptions = defaultOptions,
): void {
  console.log('🚀 Generating documentation...')

  // Create output directory
  if (!existsSync(options.outputDir)) {
    mkdirSync(options.outputDir, { recursive: true })
  }

  // Generate main README
  const mainReadme = generateMainReadme(options)
  writeFileSync(join(options.outputDir, 'README.md'), mainReadme)
  console.log('✅ Generated main README.md')

  // Generate level READMEs
  Object.keys(componentCategories).forEach(level => {
    const levelDir = join(options.outputDir, 'components', level)
    if (!existsSync(levelDir)) {
      mkdirSync(levelDir, { recursive: true })
    }

    const levelReadme = generateLevelReadme(level, options)
    writeFileSync(join(levelDir, 'README.md'), levelReadme)
    console.log(`✅ Generated ${level}/README.md`)

    // Generate category READMEs
    const levelConfig = componentCategories[level]
    Object.keys(levelConfig.categories).forEach(category => {
      const categoryDir = join(levelDir, category)
      if (!existsSync(categoryDir)) {
        mkdirSync(categoryDir, { recursive: true })
      }

      const categoryReadme = generateCategoryReadme(level, category, options)
      writeFileSync(join(categoryDir, 'README.md'), categoryReadme)
      console.log(`✅ Generated ${level}/${category}/README.md`)
    })
  })

  console.log('🎉 Documentation generation complete!')
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const options = { ...defaultOptions }

  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--output-dir=')) {
      options.outputDir = arg.split('=')[1]
    } else if (arg === '--no-examples') {
      options.includeExamples = false
    } else if (arg === '--no-accessibility') {
      options.includeAccessibility = false
    } else if (arg === '--no-types') {
      options.includeTypes = false
    } else if (arg === '--no-composables') {
      options.includeComposables = false
    }
  })

  generateAllDocumentation(options)
}

export {
  generateAllDocumentation,
  generateCategoryReadme,
  generateLevelReadme,
  generateMainReadme,
}
