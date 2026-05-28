import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production' || command === 'build';
  
  console.log(`🔧 Vite config - Modo: ${mode}, Producción: ${isProduction}`);

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
          main: path.resolve(__dirname, 'index.html'), // ✅ Ahora apunta al archivo corregido
        },
        output: {
          manualChunks: undefined,
        },
      },
      chunkSizeWarningLimit: 2000,
      copyPublicDir: true, // ✅ Asegurar que se copian assets de public/
    },
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
  };

  if (isProduction) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
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
        origin: ['http://localhost:5173', 'http://localhost:8000'],
        credentials: true,
      },
    },
  };
});