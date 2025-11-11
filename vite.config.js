// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],

  // Produção: assets sob /peticoes/*
  base: '/peticoes/',

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

  // Dev: proxy opcional para evitar CORS durante desenvolvimento local
  // (em produção o Nginx já resolve; aqui só ajuda no `npm run dev`)
  server: {
    proxy: {
      // usa VITE_SUPABASE_URL se estiver setado, senão vai direto no host público
      '/supabase': {
        target: process.env.VITE_SUPABASE_URL || 'https://supabase.wescctech.com.br',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/supabase/, ''),
      },
    },
  },
})
