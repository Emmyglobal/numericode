import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/', 'src/test/', 'src/main.tsx',
        'src/mocks/', '**/*.d.ts', 'vite.config.ts', 'vitest.config.ts',
        'src/app/Providers.tsx', 'src/lib/motion.ts',
      ],
      thresholds: { statements: 70, branches: 60, functions: 70, lines: 70 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
