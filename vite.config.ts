import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

  // Logs para diagnóstico en Render
  console.log(`🔧 Modo: ${mode || command}`);
  console.log(`🔧 Directorio actual: ${__dirname}`);
  console.log(`🔧 API Target: ${apiTarget}`);
  
  // Verificar si index.html existe (para diagnóstico)
  const indexPath = path.resolve(__dirname, 'index.html');
  const indexExists = fs.existsSync(indexPath);
  console.log(`🔧 index.html existe: ${indexExists} en ${indexPath}`);
  
  // Verificar si src/main.tsx existe
  const mainPath = path.resolve(__dirname, 'src', 'main.tsx');
  const mainExists = fs.existsSync(mainPath);
  console.log(`🔧 src/main.tsx existe: ${mainExists} en ${mainPath}`);

  return {
    plugins: [react()],
    // ✅ Forzar la raíz al directorio actual
    root: __dirname,
    // ✅ Especificar el archivo de entrada principal
    publicDir: path.resolve(__dirname, 'public'),
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
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
      rollupOptions: {
        // ✅ Especificar el punto de entrada explícitamente
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['framer-motion', 'lucide-react'],
            'vendor-webauthn': ['@simplewebauthn/browser'],
            'vendor-utils': ['date-fns', 'uuid'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/css/[name]-[hash].[ext]',
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },
    define: {
      __APP_VERSION__: JSON.stringify('2.4.0'),
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
  };
});