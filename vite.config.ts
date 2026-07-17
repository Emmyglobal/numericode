import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // In production, replace the real MSW browser module with a no-op stub
      // This prevents all MSW dependencies from entering the production bundle
      ...(isProd ? {
        '@/mocks/browser': path.resolve(__dirname, './src/mocks/browser.stub.ts'),
      } : {}),
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/'))
            return 'vendor-react'
          if (id.includes('react-router') || id.includes('@remix-run'))
            return 'vendor-router'
          if (id.includes('@tanstack/query-core') || id.includes('@tanstack/react-query'))
            return 'vendor-query'
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils'))
            return 'vendor-motion'
          if (id.includes('/axios/') || id.includes('follow-redirects'))
            return 'vendor-axios'
          if (id.includes('/zod/'))
            return 'vendor-zod'
          if (id.includes('react-hook-form') || id.includes('@hookform'))
            return 'vendor-forms'
          if (id.includes('/zustand/'))
            return 'vendor-state'
          if (id.includes('lucide-react'))
            return 'vendor-icons'
          if (id.includes('clsx') || id.includes('tailwind-merge'))
            return 'vendor-css-utils'
          return 'vendor-misc'
        },
      },
    },
  },
  server: {
    warmup: {
      clientFiles: [
        './src/app/App.tsx',
        './src/app/Router.tsx',
        './src/components/ui/Button.tsx',
        './src/components/ui/Input.tsx',
      ],
    },
  },
})
