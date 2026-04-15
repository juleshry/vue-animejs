import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
  },
  resolve: {
    alias: {
      '@lib': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    },
  },
})
