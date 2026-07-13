/// <reference types="vitest" />

import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { playwright } from '@vitest/browser-playwright';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    angular({ tsconfig: resolve(__dirname, 'tsconfig.spec.json') }),
    viteTsConfigPaths(),
  ],
  optimizeDeps: {
    exclude: ['playwright-core', 'chromium-bidi'],
  },
  test: {
    globals: false,

    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },

    setupFiles: [resolve(__dirname, 'src/test-setup.ts')],
    include: [resolve(__dirname, 'src/**/*.spec.ts')],
    exclude: ['node_modules/**', 'dist/**'],
    reporters: ['default'],
  },
});
