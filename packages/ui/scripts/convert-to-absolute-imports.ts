#!/usr/bin/env node

/**
 * Script para convertir rutas relativas a rutas absolutas con @
 * Convierte todas las importaciones del UI package a usar alias @
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, relative } from 'path'

interface ImportReplacement {
  from: string
  to: string
  pattern: RegExp
}

class ImportPathConverter {
  private srcDir: string
  private replacements: ImportReplacement[] = []

  constructor(srcDir: string) {
    this.srcDir = srcDir
    this.setupReplacements()
  }

  private setupReplacements() {
    this.replacements = [
      // Composables
      {
        from: '../../../composables/',
        to: '@/composables/',
        pattern: /from ['"]\.\.\/\.\.\/\.\.\/composables\//g,
      },
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

      // Types
      {
        from: '../../../types/',
        to: '@/types/',
        pattern: /from ['"]\.\.\/\.\.\/\.\.\/types\//g,
      },
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

      // i18n
      {
        from: '../../../i18n',
        to: '@/i18n',
        pattern: /from ['"]\.\.\/\.\.\/\.\.\/i18n['"]/g,
      },
      {
        from: '../../i18n',
        to: '@/i18n',
        pattern: /from ['"]\.\.\/\.\.\/i18n['"]/g,
      },
      {
        from: '../i18n',
        to: '@/i18n',
        pattern: /from ['"]\.\.\/i18n['"]/g,
      },

      // Components - Atoms
      {
        from: '../../atoms/display/',
        to: '@/components/atoms/display/',
        pattern: /from ['"]\.\.\/\.\.\/atoms\/display\//g,
      },
      {
        from: '../../atoms/forms/',
        to: '@/components/atoms/forms/',
        pattern: /from ['"]\.\.\/\.\.\/atoms\/forms\//g,
      },
      {
        from: '../../atoms/feedback/',
        to: '@/components/atoms/feedback/',
        pattern: /from ['"]\.\.\/\.\.\/atoms\/feedback\//g,
      },
      {
        from: '../../atoms/layout/',
        to: '@/components/atoms/layout/',
        pattern: /from ['"]\.\.\/\.\.\/atoms\/layout\//g,
      },
      {
        from: '../../atoms/interactive/',
        to: '@/components/atoms/interactive/',
        pattern: /from ['"]\.\.\/\.\.\/atoms\/interactive\//g,
      },

      // Components - Molecules
      {
        from: '../../molecules/forms/',
        to: '@/components/molecules/forms/',
        pattern: /from ['"]\.\.\/\.\.\/molecules\/forms\//g,
      },
      {
        from: '../../molecules/navigation/',
        to: '@/components/molecules/navigation/',
        pattern: /from ['"]\.\.\/\.\.\/molecules\/navigation\//g,
      },
      {
        from: '../../molecules/feedback/',
        to: '@/components/molecules/feedback/',
        pattern: /from ['"]\.\.\/\.\.\/molecules\/feedback\//g,
      },
      {
        from: '../../molecules/layout/',
        to: '@/components/molecules/layout/',
        pattern: /from ['"]\.\.\/\.\.\/molecules\/layout\//g,
      },

      // Components - Organisms
      {
        from: '../../organisms/navigation/',
        to: '@/components/organisms/navigation/',
        pattern: /from ['"]\.\.\/\.\.\/organisms\/navigation\//g,
      },

      // Relative component imports within same category
      {
        from: '../display/',
        to: '@/components/atoms/display/',
        pattern: /from ['"]\.\.\/display\//g,
      },
      {
        from: '../forms/',
        to: '@/components/atoms/forms/',
        pattern: /from ['"]\.\.\/forms\//g,
      },
      {
        from: '../feedback/',
        to: '@/components/atoms/feedback/',
        pattern: /from ['"]\.\.\/feedback\//g,
      },
      {
        from: '../layout/',
        to: '@/components/atoms/layout/',
        pattern: /from ['"]\.\.\/layout\//g,
      },
      {
        from: '../interactive/',
        to: '@/components/atoms/interactive/',
        pattern: /from ['"]\.\.\/interactive\//g,
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
        files.push(...this.getAllFiles(fullPath))
      } else if (
        item.endsWith('.vue') ||
        item.endsWith('.ts') ||
        item.endsWith('.js')
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
    console.log('🔄 Converting relative imports to absolute imports with @...\n')

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
const srcDir = join(process.cwd(), 'src')
const converter = new ImportPathConverter(srcDir)
converter.convertAll()
