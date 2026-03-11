import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Proxy para las rutas de passkey
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // No reescribimos la ruta para mantener /api
        rewrite: (path) => path,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          webauthn: ['@simplewebauthn/browser', '@simplewebauthn/server'],
        },
      },
    },
  },
});