import { vi } from 'vitest';

// Mock for react hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  const mockUseRef = (initialValue: any) => ({ current: initialValue });

  return {
    ...(actual as object),
    useRef: vi.fn(mockUseRef),
    useEffect: vi.fn((callback) => {
      callback();
      return undefined;
    }),
  };
});

// Mock for react-use hooks
vi.mock('react-use', () => ({
  useDeepCompareEffect: vi.fn((callback) => {
    const cleanup = callback();
    return cleanup;
  }),
}));

// Mock interval functions
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

// Create spy functions that preserve the original functionality
const setIntervalSpy = vi.fn((handler: TimerHandler, timeout?: number, ...args: any[]) =>
  originalSetInterval(handler, timeout, ...args),
);

const clearIntervalSpy = vi.fn((id?: number) => originalClearInterval(id));

// Assign spies to global functions without overriding property descriptors
global.setInterval = setIntervalSpy as any;
global.clearInterval = clearIntervalSpy as any;
