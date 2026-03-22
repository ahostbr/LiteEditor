import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    globals: true,
    setupFiles: ['tests/unit/setup.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer')
    }
  }
})
