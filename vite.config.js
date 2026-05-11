import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.html'),
        lootDisplay: resolve(__dirname, 'src/loot-display.html'),
      },
    },
  },
});
