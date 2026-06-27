// Scratch-only vitest config so the simulation under scratch/ can run without
// touching the repo's real vitest.config.ts. Run with:
//   npx vitest run --config scratch/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['scratch/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    css: false,
  },
});
