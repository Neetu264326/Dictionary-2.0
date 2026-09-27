import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API port can be overridden without touching this file: PORT=5174 npm run dev
const apiPort = process.env.API_PORT || process.env.PORT || 5000;
const apiTarget = process.env.VITE_PROXY_TARGET || `http://localhost:${apiPort}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.CLIENT_PORT) || 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
