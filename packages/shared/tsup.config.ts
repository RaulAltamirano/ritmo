import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  target: 'es2020',
  outDir: 'dist',
  external: ['zod', 'crypto-js'],
  esbuildOptions(options) {
    options.define = {
      'process.env.NODE_ENV': '"production"',
    }
  },
})
