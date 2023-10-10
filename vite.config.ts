/// <reference types="vitest" />
/// <reference types="vite/client" />
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
      '@types': path.resolve('./src/@types'),
      '@helpers': path.resolve('./src/helpers'),
      '@components': path.resolve('./src/components'),
      '@assets': path.resolve('./src/assets'),
      '@constants': path.resolve('./src/constants'),
      '@lib': path.resolve('./src/lib'),
      '@hooks': path.resolve('./src/hooks'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});
