import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'lucide': ['lucide-react'],
        },
      },
    },
    target: 'es2015',
    sourcemap: true, // Enable source maps for debugging
  },
  esbuild: {
    target: 'es2015',
    keepNames: true, // Prevent name mangling issues
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
});
