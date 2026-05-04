import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/auth':     { target: 'http://localhost:3000', changeOrigin: true },
      '/products': { target: 'http://localhost:3000', changeOrigin: true },
      '/orders':   { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
