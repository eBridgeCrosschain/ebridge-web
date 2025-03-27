/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAuthPlainText,
  getLocalJWT,
  resetLocalJWT,
  removeOneLocalJWT,
  setLocalJWT,
  LocalJWTData,
} from '../aelfAuthToken';
import { LocalStorageKey } from 'constants/storages';

// Mock localStorage
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

// Attach the mock to the global window object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('JWT Local Storage Utility Functions', () => {
  const TEST_KEY = 'test_key';
  const SAMPLE_DATA: LocalJWTData = {
    access_token: 'test_token',
    expires_in: 3600, // 1 hour in seconds
    token_type: 'Bearer',
    expiresTime: Date.now() + 3600 * 1000, // 1 hour in milliseconds
  };

  beforeEach(() => {
    // Reset localStorage mock and clear all mocks
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers(); // Use fake timers for time-based tests
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers after each test
  });

  describe('getLocalJWT', () => {
    it('should return undefined when no data is stored', () => {
      expect(getLocalJWT(TEST_KEY)).toBeUndefined();
    });

    it('should return undefined when data is expired', () => {
      const expiredData = {
        ...SAMPLE_DATA,
        expiresTime: Date.now() - 1000, // Expired 1 second ago
      };
      localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify({ [TEST_KEY]: expiredData }));

      expect(getLocalJWT(TEST_KEY)).toBeUndefined();
    });

    it('should return undefined when remaining time is less than half a day', () => {
      const nearlyExpiredData = {
        ...SAMPLE_DATA,
        expiresTime: Date.now() + 0.4 * 24 * 60 * 60 * 1000, // 0.4 days remaining
      };
      localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify({ [TEST_KEY]: nearlyExpiredData }));

      expect(getLocalJWT(TEST_KEY)).toBeUndefined();
    });

    it('should return valid data when conditions are met', () => {
      const validData = {
        ...SAMPLE_DATA,
        expiresTime: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days remaining
      };
      localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify({ [TEST_KEY]: validData }));

      const result = getLocalJWT(TEST_KEY);
      expect(result).toMatchObject(validData);
    });

    it('should handle JSON parsing errors gracefully', () => {
      localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, 'invalid_json');

      expect(getLocalJWT(TEST_KEY)).toBeUndefined();
    });
  });

  describe('setLocalJWT', () => {
    it('should create a new entry if no data exists', () => {
      setLocalJWT(TEST_KEY, SAMPLE_DATA);

      const storedData = JSON.parse(localStorageMock.getItem(LocalStorageKey.ACCESS_TOKEN)!);
      expect(storedData[TEST_KEY].access_token).toBe(SAMPLE_DATA.access_token);
    });

    it('should update an existing entry if data exists', () => {
      const initialData = { other_key: SAMPLE_DATA };
      localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify(initialData));

      setLocalJWT(TEST_KEY, SAMPLE_DATA);

      const storedData = JSON.parse(localStorageMock.getItem(LocalStorageKey.ACCESS_TOKEN)!);
      expect(storedData).toHaveProperty(TEST_KEY);
      expect(storedData).toHaveProperty('other_key');
    });

    it('should calculate expiration time correctly', () => {
      const testData = { ...SAMPLE_DATA, expires_in: 7200 }; // 2 hours
      setLocalJWT(TEST_KEY, testData);

      const storedData = JSON.parse(localStorageMock.getItem(LocalStorageKey.ACCESS_TOKEN)!);
      const expectedExpiresTime = Date.now() + (7200 - 10) * 1000; // 10 seconds buffer
      expect(storedData[TEST_KEY].expiresTime).toBeCloseTo(expectedExpiresTime, -3); // Allow 1-second tolerance
    });
  });

  describe('removeOneLocalJWT', () => {
    it('should remove the specified key from storage', () => {
      const initialData = {
        [TEST_KEY]: SAMPLE_DATA,
        other_key: SAMPLE_DATA,
      };
      localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify(initialData));

      removeOneLocalJWT(TEST_KEY);

      const storedData = JSON.parse(localStorageMock.getItem(LocalStorageKey.ACCESS_TOKEN)!);
      expect(storedData).not.toHaveProperty(TEST_KEY);
      expect(storedData).toHaveProperty('other_key');
    });

    it('should handle empty storage gracefully', () => {
      expect(() => removeOneLocalJWT(TEST_KEY)).not.toThrow();
    });
  });

  describe('resetLocalJWT', () => {
    it('should clear all stored JWT data', () => {
      localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify({ [TEST_KEY]: SAMPLE_DATA }));

      resetLocalJWT();

      expect(localStorageMock.getItem(LocalStorageKey.ACCESS_TOKEN)).toBeNull();
    });
  });
});

describe('getAuthPlainText', () => {
  const mockTimestamp = 1680000000000;

  it('should generate plainTextOrigin with the expected format', () => {
    // Mock the Date.now() method so the value of the nonce is predictable
    vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    const result = getAuthPlainText();

    // Verify plainTextOrigin content
    expect(result.plainTextOrigin).toContain('Welcome to eBridge!');
    expect(result.plainTextOrigin).toContain('Click to sign in and accept the eBridge Terms of Service');
    expect(result.plainTextOrigin).toContain(
      'https://ebridge-exchange.gitbook.io/docs/more-information/terms-of-service',
    );
    expect(result.plainTextOrigin).toContain(
      'https://ebridge-exchange.gitbook.io/docs/more-information/privacy-policy',
    );
    expect(result.plainTextOrigin).toContain(
      'This request will not trigger a blockchain transaction or cost any gas fees.',
    );
    expect(result.plainTextOrigin).toContain(`Nonce:\n${mockTimestamp}`);

    // Restore original Date.now() function
    vi.restoreAllMocks();
  });

  it('should generate plainTextHex as a correct hexadecimal representation of plainTextOrigin', () => {
    // Mock the Date.now() method to control the output of the nonce
    vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    const result = getAuthPlainText();

    // Convert plainTextOrigin to hex manually to compare
    const expectedHex = Buffer.from(result.plainTextOrigin).toString('hex').replace('0x', '');
    expect(result.plainTextHex).toBe(expectedHex);

    // Restore original Date.now() function
    vi.restoreAllMocks();
  });

  it('should include the correct nonce (current timestamp) in the plainTextOrigin', () => {
    // Mock the Date.now() method to control the output of the nonce
    vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    const result = getAuthPlainText();

    // Verify that the nonce matches the mocked timestamp
    expect(result.plainTextOrigin).toContain(`Nonce:\n${mockTimestamp}`);

    // Restore original Date.now() function
    vi.restoreAllMocks();
  });

  it('should have a consistent plainTextHex length for the same input', () => {
    // Mock the Date.now() to generate a fixed timestamp
    vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    const result1 = getAuthPlainText();
    const result2 = getAuthPlainText();

    // Both should have the same hex length because the same input is generated
    expect(result1.plainTextHex.length).toBe(result2.plainTextHex.length);

    // Restore original Date.now() function
    vi.restoreAllMocks();
  });
});
