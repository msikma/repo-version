import {defineConfig} from 'tsup'

export default defineConfig({
  entry: {index: 'src/index.ts'},
  splitting: true,
  minify: false,
  clean: true,
  shims: true,
  outDir: 'dist',
  format: ['cjs', 'esm'],
  sourcemap: true,
  dts: true
})
