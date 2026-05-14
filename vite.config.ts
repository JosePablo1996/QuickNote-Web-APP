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
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        // ✅ Mejor manejo de errores de proxy
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('⚠️ [Vite Proxy] Error de conexión con el backend:', err.message);
            console.log('   ¿El backend está corriendo en http://localhost:8000?');
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`🔄 [Vite Proxy] ${req.method} ${req.url} -> http://localhost:8000${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`✅ [Vite Proxy] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
          });
        },
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
  // ✅ Agregar variables de entorno para el frontend
  define: {
    __APP_VERSION__: JSON.stringify('2.1.0'),
  },
});