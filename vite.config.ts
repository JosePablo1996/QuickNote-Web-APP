import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual (para ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => {
  // Detectar si estamos en producción (Render)
  const isProduction = mode === 'production' || command === 'build';
  
  // URL de la API según el entorno
  const apiTarget = isProduction 
    ? process.env.VITE_API_URL || 'https://quicknote-api-app-react.onrender.com'
    : 'http://localhost:8000';

  console.log(`🔧 Modo: ${mode || command}`);
  console.log(`🔧 API Target: ${apiTarget}`);

  return {
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
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('⚠️ [Vite Proxy] Error de conexión con el backend:', err.message);
              console.log(`   ¿El backend está corriendo en ${apiTarget}?`);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`🔄 [Vite Proxy] ${req.method} ${req.url} -> ${apiTarget}${req.url}`);
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
      sourcemap: !isProduction, // Solo sourcemaps en desarrollo
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction, // Eliminar console.log en producción
          drop_debugger: isProduction,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['framer-motion', 'lucide-react'],
            'vendor-webauthn': ['@simplewebauthn/browser'],
            'vendor-utils': ['date-fns', 'uuid'],
          },
          // Mejorar nombres de chunks
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/css/[name]-[hash].[ext]',
        },
      },
      // Aumentar límite de advertencia de chunk
      chunkSizeWarningLimit: 1000,
    },
    // Optimizaciones para producción
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },
    // Variables de entorno disponibles en el cliente
    define: {
      __APP_VERSION__: JSON.stringify('2.4.0'),
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
  };
});