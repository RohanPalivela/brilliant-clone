import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Confetti touches the DOM/canvas in ways jsdom can't render; stub it everywhere.
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// Never spin up a real Firebase app during unit/component tests. Anything that
// needs Firestore/auth behavior should mock the data layer (e.g. progressService)
// or the useAuth hook directly.
vi.mock('../lib/firebase', () => ({
  app: {},
  auth: {},
  db: {},
  googleProvider: {},
}));

// jsdom doesn't implement these browser APIs the widgets touch. The pointer-paint
// handler reads elementFromPoint; CongratsScreen checks matchMedia before confetti.
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

// jsdom lacks ResizeObserver, which the look-back arrow layout (ReachabilityCells)
// observes to measure cell positions. A no-op stub is enough for tests.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

afterEach(() => {
  cleanup();
});
