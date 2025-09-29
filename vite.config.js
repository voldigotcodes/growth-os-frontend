import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false
    },
    fs: {
      strict: false,
      allow: ['..']
    },
    middlewareMode: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: './',
  optimizeDeps: {
    exclude: []
  }
});
