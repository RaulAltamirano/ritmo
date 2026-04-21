import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['vue', 'vue-router'],
  outDir: 'dist',
  // onSuccess: 'pnpm build:css', // Comando no implementado
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    }
  },
})
