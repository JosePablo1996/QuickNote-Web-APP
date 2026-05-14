import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production' || command === 'build';
  const apiTarget = isProduction 
    ? process.env.VITE_API_URL || 'https://quicknote-api-app-react.onrender.com'
    : 'http://localhost:8000';

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
      minify: false, // ✅ Desactivar minificación para ahorrar memoria
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          // ✅ Simplificar chunks
          manualChunks: undefined,
        },
      },
      chunkSizeWarningLimit: 2000,
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});