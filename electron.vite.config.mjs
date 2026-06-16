import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const EXTERNAL_DEPS = [
  'better-sqlite3',
  'sharp',
  'electron',
];

export default defineConfig({
  main: {
    plugins: [],
    build: {
      rollupOptions: {
        external: EXTERNAL_DEPS,
      },
    },
  },
  preload: {
    plugins: [],
    build: {
      rollupOptions: {
        external: EXTERNAL_DEPS,
      },
    },
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
        '@shared': resolve('src/shared'),
      },
    },
    css: {
      postcss: './postcss.config.js',
    },
  },
});
