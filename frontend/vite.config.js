import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 4000,
    proxy: {
      '/api': 'http://localhost:5001',
      '/quran-api': {
        target: 'https://api.alquran.cloud',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/quran-api/, '')
      }
    }
  }
});
