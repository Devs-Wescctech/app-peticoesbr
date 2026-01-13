import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],

  base: process.env.VITE_BASE_URL || '/',

  resolve: {
    alias: [
      { find: '@',           replacement: fileURLToPath(new URL('./src',            import.meta.url)) },
      { find: '@components', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
      { find: '@pages',      replacement: fileURLToPath(new URL('./src/pages',      import.meta.url)) },
      { find: '@lib',        replacement: fileURLToPath(new URL('./src/lib',        import.meta.url)) },
      { find: '@utils',      replacement: fileURLToPath(new URL('./src/utils',      import.meta.url)) },
      { find: '@assets',     replacement: fileURLToPath(new URL('./attached_assets', import.meta.url)) },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },

  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'vendor-motion': ['framer-motion'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
})
