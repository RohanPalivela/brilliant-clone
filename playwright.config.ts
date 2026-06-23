import { defineConfig, devices } from '@playwright/test';

const VITE_PORT = 5173;
const FIRESTORE_PORT = 8080;

// The Firestore emulator needs a JRE. Java is installed but not on PATH in this
// environment, so resolve JAVA_HOME (Temurin) before launching the emulators.
const emulatorCommand = [
  'export JAVA_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null || echo /Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home)"',
  'export PATH="$JAVA_HOME/bin:$PATH"',
  'npx firebase emulators:start --project demo-brilliant-clone --only auth,firestore',
].join('; ');

export default defineConfig({
  testDir: './e2e',
  // The specs share a single emulator instance; run them serially for
  // deterministic Firestore state (each spec still uses unique accounts).
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: `http://127.0.0.1:${VITE_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: emulatorCommand,
      // Firestore is the Java-backed, slowest-to-boot emulator; once it answers
      // the auth emulator is ready too. First run downloads the emulator jars,
      // so allow a generous timeout.
      url: `http://127.0.0.1:${FIRESTORE_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `npm run dev -- --mode test --port ${VITE_PORT} --strictPort`,
      url: `http://127.0.0.1:${VITE_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
