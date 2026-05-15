import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production' || command === 'build';
  
  // ✅ CORREGIDO: Puerto correcto para desarrollo (3001)
  const apiTarget = isProduction 
    ? process.env.VITE_API_URL || 'https://quicknote-api-app-react.onrender.com'
    : 'http://localhost:3001';  // ← Cambiado de 8000 a 3001

  return {
    plugins: [react()],
    root: __dirname,
    publicDir: path.resolve(__dirname, 'public'),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      sourcemap: false,
      minify: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: undefined,
        },
      },
      chunkSizeWarningLimit: 2000,
    },
    server: {
      port: 5173,
      proxy: {
        // ✅ Proxy para todas las rutas /api
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // No rewrite: mantener la ruta /api/v1/...
          // Asegurar que WebSocket también funciona
          ws: true,
        },
        // ✅ Proxy adicional para auth (por si acaso)
        '/auth': {
          target: apiTarget,
          changeOrigin: true,
        },
        // ✅ Proxy para passkeys
        '/passkeys': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
      // Configuración CORS para desarrollo
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:3001'],
        credentials: true,
      },
    },
    // Variables de entorno para el frontend
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
  };
});