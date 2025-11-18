import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [],
    alias: {
      '@': new URL('./client/src', import.meta.url).pathname,
    },
  },
})