import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/scene': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/advise': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/decision': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
