#!/usr/bin/env node

/**
 * Script para convertir rutas relativas a rutas absolutas con @ en la app web
 * Convierte todas las importaciones de la app web a usar alias @
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

interface ImportReplacement {
  from: string
  to: string
  pattern: RegExp
}

class WebAppImportPathConverter {
  private readonly srcDir: string
  private replacements: ImportReplacement[] = []

  constructor(srcDir: string) {
    this.srcDir = srcDir
    this.setupReplacements()
  }

  private setupReplacements() {
    this.replacements = [
      // Components - Organisms
      {
        from: '../../components/organisms/',
        to: '@/components/organisms/',
        pattern: /from ['"]\.\.\/\.\.\/components\/organisms\//g,
      },
      {
        from: '../components/organisms/',
        to: '@/components/organisms/',
        pattern: /from ['"]\.\.\/components\/organisms\//g,
      },

      // Components - Molecules
      {
        from: '../../components/molecules/',
        to: '@/components/molecules/',
        pattern: /from ['"]\.\.\/\.\.\/components\/molecules\//g,
      },
      {
        from: '../components/molecules/',
        to: '@/components/molecules/',
        pattern: /from ['"]\.\.\/components\/molecules\//g,
      },

      // Components - Atoms
      {
        from: '../../components/atoms/',
        to: '@/components/atoms/',
        pattern: /from ['"]\.\.\/\.\.\/components\/atoms\//g,
      },
      {
        from: '../components/atoms/',
        to: '@/components/atoms/',
        pattern: /from ['"]\.\.\/components\/atoms\//g,
      },

      // Composables
      {
        from: '../../composables/',
        to: '@/composables/',
        pattern: /from ['"]\.\.\/\.\.\/composables\//g,
      },
      {
        from: '../composables/',
        to: '@/composables/',
        pattern: /from ['"]\.\.\/composables\//g,
      },

      // Stores
      {
        from: '../../stores/',
        to: '@/stores/',
        pattern: /from ['"]\.\.\/\.\.\/stores\//g,
      },
      {
        from: '../stores/',
        to: '@/stores/',
        pattern: /from ['"]\.\.\/stores\//g,
      },

      // Types
      {
        from: '../../types/',
        to: '@/types/',
        pattern: /from ['"]\.\.\/\.\.\/types\//g,
      },
      {
        from: '../types/',
        to: '@/types/',
        pattern: /from ['"]\.\.\/types\//g,
      },

      // Utils
      {
        from: '../../utils/',
        to: '@/utils/',
        pattern: /from ['"]\.\.\/\.\.\/utils\//g,
      },
      {
        from: '../utils/',
        to: '@/utils/',
        pattern: /from ['"]\.\.\/utils\//g,
      },

      // Config
      {
        from: '../../config/',
        to: '@/config/',
        pattern: /from ['"]\.\.\/\.\.\/config\//g,
      },
      {
        from: '../config/',
        to: '@/config/',
        pattern: /from ['"]\.\.\/config\//g,
      },

      // Constants
      {
        from: '../../constants/',
        to: '@/constants/',
        pattern: /from ['"]\.\.\/\.\.\/constants\//g,
      },
      {
        from: '../constants/',
        to: '@/constants/',
        pattern: /from ['"]\.\.\/constants\//g,
      },

      // Layouts
      {
        from: '../layouts/',
        to: '@/layouts/',
        pattern: /from ['"]\.\.\/layouts\//g,
      },

      // Plugins
      {
        from: '../plugins/',
        to: '@/plugins/',
        pattern: /from ['"]\.\.\/plugins\//g,
      },

      // Middleware
      {
        from: '../middleware/',
        to: '@/middleware/',
        pattern: /from ['"]\.\.\/middleware\//g,
      },

      // Assets
      {
        from: '../assets/',
        to: '@/assets/',
        pattern: /from ['"]\.\.\/assets\//g,
      },

      // Public
      {
        from: '../public/',
        to: '@/public/',
        pattern: /from ['"]\.\.\/public\//g,
      },

      // Relative imports within components
      {
        from: '../../molecules/',
        to: '@/components/molecules/',
        pattern: /from ['"]\.\.\/\.\.\/molecules\//g,
      },
      {
        from: '../molecules/',
        to: '@/components/molecules/',
        pattern: /from ['"]\.\.\/molecules\//g,
      },

      {
        from: '../../atoms/',
        to: '@/components/atoms/',
        pattern: /from ['"]\.\.\/\.\.\/atoms\//g,
      },
      {
        from: '../atoms/',
        to: '@/components/atoms/',
        pattern: /from ['"]\.\.\/atoms\//g,
      },
    ]
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = []
    const items = readdirSync(dir)

    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        // Skip certain directories
        if (['node_modules', '.nuxt', 'dist', '.turbo'].includes(item)) {
          continue
        }
        files.push(...this.getAllFiles(fullPath))
      } else if (
        item.endsWith('.vue') ||
        item.endsWith('.ts') ||
        item.endsWith('.js') ||
        item.endsWith('.tsx') ||
        item.endsWith('.jsx')
      ) {
        files.push(fullPath)
      }
    }

    return files
  }

  private convertFile(filePath: string): boolean {
    try {
      const content = readFileSync(filePath, 'utf-8')
      let newContent = content
      let hasChanges = false

      // Apply all replacements
      for (const replacement of this.replacements) {
        const matches = newContent.match(replacement.pattern)
        if (matches) {
          newContent = newContent.replace(replacement.pattern, match => {
            return match.replace(replacement.from, replacement.to)
          })
          hasChanges = true
        }
      }

      // Write back if changes were made
      if (hasChanges) {
        writeFileSync(filePath, newContent, 'utf-8')
        console.log(`✅ Updated: ${relative(this.srcDir, filePath)}`)
        return true
      }

      return false
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error)
      return false
    }
  }

  public convertAll(): void {
    console.log(
      '🔄 Converting relative imports to absolute imports with @ in web app...\n',
    )

    const files = this.getAllFiles(this.srcDir)
    let convertedCount = 0

    for (const file of files) {
      if (this.convertFile(file)) {
        convertedCount++
      }
    }

    console.log(`\n🎉 Conversion complete!`)
    console.log(`📊 Files processed: ${files.length}`)
    console.log(`✅ Files updated: ${convertedCount}`)
  }
}

// Run the converter
const srcDir = process.cwd()
const converter = new WebAppImportPathConverter(srcDir)
converter.convertAll()
