// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],

  // Use '/' for Replit development, '/peticoes/' for production deployment
  base: process.env.VITE_BASE_URL || '/',

  resolve: {
    alias: [
      { find: '@',           replacement: fileURLToPath(new URL('./src',            import.meta.url)) },
      { find: '@components', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
      { find: '@pages',      replacement: fileURLToPath(new URL('./src/pages',      import.meta.url)) },
      { find: '@lib',        replacement: fileURLToPath(new URL('./src/lib',        import.meta.url)) },
      { find: '@utils',      replacement: fileURLToPath(new URL('./src/utils',      import.meta.url)) },
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
    },
  },
})
