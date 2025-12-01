import { clearWCStorageByDisconnect } from 'utils/localStorage';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('clearWCStorageByDisconnect', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('if there are no WC-related items in the storage, there is no need to remove', () => {
    // Mock window and localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};

      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    clearWCStorageByDisconnect();

    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('wc-session');
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('wc-topic');
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other-key');
  });

  it('should remove all WC-related items from localStorage', () => {
    // Mock window and localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};

      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
        ['wc-session']: 'value1',
        ['wc-topic']: 'value2',
        ['other-key']: 'value3',
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    clearWCStorageByDisconnect();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('wc-session');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('wc-topic');
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other-key');
  });
});
