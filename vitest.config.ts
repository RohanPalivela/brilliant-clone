import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Unit + component tests run under jsdom. Playwright e2e specs live in `e2e/`
// and are excluded here so they only run via `npm run test:e2e`.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/content/**',
        'src/types/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/lib/firebase.ts',
      ],
    },
  },
});
