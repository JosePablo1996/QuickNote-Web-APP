import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => {
  // Detectar si es producción
  const isProduction = mode === 'production' || command === 'build';
  
  console.log(`🔧 Vite config - Modo: ${mode}, Producción: ${isProduction}`);

  // Configuración base (común para desarrollo y producción)
  const baseConfig = {
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
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
  };

  // Si es producción, no agregar configuración de servidor
  if (isProduction) {
    return baseConfig;
  }

  // En desarrollo, agregar configuración de servidor con proxy
  return {
    ...baseConfig,
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('⚠️ Proxy error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔄 Proxy:', req.method, req.url);
            });
          },
        },
      },
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:3001'],
        credentials: true,
      },
    },
  };
});