import { defineConfig, devices } from '@playwright/test';

// Performance config: unlike the functional e2e config (which runs against the
// Vite dev server), this builds the *production* bundle and serves it via
// `vite preview`. The deadline targets in Instructions.md ("under 2 seconds to
// first interaction") are about the deployed app, so we must measure the real,
// minified, code-split bundle — not on-the-fly dev transforms.
const PREVIEW_PORT = 4173;
const AUTH_PORT = 9099;

// Build in `test` mode so .env.test is baked in (emulator config, demo project),
// then serve the static dist. This is the same artifact shape as production.
const previewCommand = [
  'npm run build -- --mode test',
  `npx vite preview --mode test --host 127.0.0.1 --port ${PREVIEW_PORT} --strictPort`,
].join(' && ');

const emulatorCommand = [
  'for p in 8080 9099 4000 4400 4500 9150; do lsof -ti tcp:$p 2>/dev/null | xargs kill -9 2>/dev/null; done',
  'export JAVA_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null || echo /Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home)"',
  'export PATH="$JAVA_HOME/bin:$PATH"',
  'exec npx firebase emulators:start --project demo-brilliant-clone --only auth,firestore',
].join('; ');

export default defineConfig({
  testDir: './e2e',
  testMatch: /performance\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://127.0.0.1:${PREVIEW_PORT}`,
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // A throttled mobile profile — Instructions.md requires lessons to load
    // fast on phone-sized screens too.
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: [
    {
      command: emulatorCommand,
      url: `http://127.0.0.1:${AUTH_PORT}`,
      reuseExistingServer: false,
      timeout: 240_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: previewCommand,
      url: `http://127.0.0.1:${PREVIEW_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
