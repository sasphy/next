import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with React Testing Library's matchers
expect.extend(matchers);

// Make vitest.mock work correctly
vi.hoisted(() => {
  // This will run before the imports
  vi.stubGlobal('fetch', vi.fn());
});

// Mock the Next.js router
vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      pathname: '/',
      route: '/',
      query: {},
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  };
});

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4040';

// Reset mocks and cleanup after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
}); 