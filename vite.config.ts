import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the repo root, so use relative asset paths
  base: './',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
