import { defineConfig, devices } from '@playwright/test';

const VITE_PORT = 5173;
// The auth emulator finishes booting after the (Java) Firestore emulator, so we
// gate readiness on it — once auth answers, Firestore is already up too.
const AUTH_PORT = 9099;

// The Firestore emulator needs a JRE. Java is installed but not on PATH in this
// environment, so resolve JAVA_HOME (Temurin) before launching the emulators.
const emulatorCommand = [
  // Free any emulator ports left behind by a previously killed run. The
  // firebase CLI can orphan its Java (Firestore) child, so we clean up first to
  // keep every run deterministic.
  'for p in 8080 9099 4000 4400 4500 9150; do lsof -ti tcp:$p 2>/dev/null | xargs kill -9 2>/dev/null; done',
  'export JAVA_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null || echo /Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home)"',
  'export PATH="$JAVA_HOME/bin:$PATH"',
  // `exec` so Playwright's stop signal reaches the firebase process directly and
  // it can shut down its Java (Firestore) child cleanly instead of orphaning it.
  'exec npx firebase emulators:start --project demo-brilliant-clone --only auth,firestore',
].join('; ');

export default defineConfig({
  testDir: './e2e',
  // The performance suite measures the production bundle and is driven by its
  // own config (playwright.perf.config.ts). Keep it out of the functional run,
  // which serves the (slower, unrepresentative) Vite dev server.
  testIgnore: /performance\.spec\.ts/,
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
      // Auth is the last emulator to finish booting; once it answers, the
      // Java-backed Firestore emulator is already up. First run downloads the
      // emulator jars, so allow a generous timeout.
      url: `http://127.0.0.1:${AUTH_PORT}`,
      // Always boot a fresh, isolated emulator (and tear it down) so runs never
      // reuse a half-dead instance or leak state between invocations.
      reuseExistingServer: false,
      timeout: 240_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `npm run dev -- --mode test --host 127.0.0.1 --port ${VITE_PORT} --strictPort`,
      url: `http://127.0.0.1:${VITE_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
