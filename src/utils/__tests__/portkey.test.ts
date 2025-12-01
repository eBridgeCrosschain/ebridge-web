import { afterEach, describe, it, expect, vi } from 'vitest';
import { compareVersions, isPortkey, isPortkeyConnectEagerly, isPortkeyConnector, isSelectPortkey } from '../portkey';

// Mocking `window` object for testing
declare const window: Window & typeof globalThis;

describe('compareVersions', () => {
  it('should return -1 when v1 is less than v2', () => {
    expect(compareVersions('1.2.3', '1.2.4')).toBe(-1);
    expect(compareVersions('1.2.3', '1.3.0')).toBe(-1);
    expect(compareVersions('1.2.3', '2.0.0')).toBe(-1);
  });

  it('should return 1 when v1 is greater than v2', () => {
    expect(compareVersions('1.2.4', '1.2.3')).toBe(1);
    expect(compareVersions('1.3.0', '1.2.3')).toBe(1);
    expect(compareVersions('2.0.0', '1.2.3')).toBe(1);
  });

  it('should return 0 when v1 is equal to v2', () => {
    expect(compareVersions('1.2.3', '1.2.3')).toBe(0);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });

  it('should handle versions with different lengths', () => {
    expect(compareVersions('1.2', '1.2.0')).toBe(0);
    expect(compareVersions('1.2.0', '1.2')).toBe(0);
    expect(compareVersions('1.2.3', '1.2')).toBe(1);
    expect(compareVersions('1.2', '1.2.3')).toBe(-1);
  });
});

describe('isPortkey', () => {
  afterEach(() => {
    // Reset the mocked `window` object after each test
    vi.resetModules();
  });

  it('should return true if `window.navigator.userAgent` contains "Portkey"', () => {
    // Mock a user agent containing "Portkey"
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'SomeBrowser Portkey OtherInfo' },
      writable: true,
    });

    expect(isPortkey()).toBe(true);
  });

  it('should return false if `window.navigator.userAgent` does not contain "Portkey"', () => {
    // Mock a user agent not containing "Portkey"
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'SomeBrowser OtherInfo' },
      writable: true,
    });

    expect(isPortkey()).toBe(false);
  });

  it('should return false if `window` is not an object', () => {
    // Simulate a non-browser environment by completely removing `window`
    const originalWindow = global.window;
    delete (global as any).window;

    expect(isPortkey()).toBeUndefined();

    // Restore original `window` after the test
    global.window = originalWindow;
  });
});

describe('isPortkeyConnectEagerly', () => {
  it('should return false if not Portkey', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Chrome');

    expect(isPortkeyConnectEagerly()).toBe(false);
  });

  it('should return false if version is less than 1.4.0', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('PortkeyV1.3.0');

    expect(isPortkeyConnectEagerly()).toBe(false);
  });

  it('should return true if version is greater than or equal to 1.4.0', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('PortkeyV1.4.0');

    expect(isPortkeyConnectEagerly()).toBe(true);

    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Portkey2.0.0');

    expect(isPortkeyConnectEagerly()).toBe(false);
  });
});

describe('isPortkeyConnector', () => {
  it('should return true if connector is PORTKEY', () => {
    expect(isPortkeyConnector('PORTKEY')).toBe(true);
  });

  it('should return false if connector is not PORTKEY', () => {
    expect(isPortkeyConnector('METAMASK')).toBe(false);
    expect(isPortkeyConnector(undefined)).toBe(false);
  });
});

describe('isSelectPortkey', () => {
  it('should return true if type includes PORTKEY', () => {
    expect(isSelectPortkey('PORTKEY_CONNECTOR')).toBe(true);
    expect(isSelectPortkey('PORTKEY_WALLET')).toBe(true);
  });

  it('should return false if type does not include PORTKEY', () => {
    expect(isSelectPortkey('METAMASK_CONNECTOR')).toBe(false);
    expect(isSelectPortkey(undefined)).toBeUndefined();
  });
});
