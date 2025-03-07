import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTokenInfoByWhitelist } from 'utils/whitelist';
import storages from 'constants/storages';
import { ChainId } from 'types';

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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('getTokenInfoByWhitelist', () => {
  const mockTokenInfo = { symbol: 'ELF', address: '0x123' };
  const aelfMainChainId = 'AELF' as ChainId;

  beforeEach(() => {
    const value = JSON.stringify({
      defaultWhitelistMap: {
        ELF: { [aelfMainChainId]: mockTokenInfo },
      },
    });
    localStorageMock.setItem(storages.useWhitelist, value);
  });

  it('should retrieve token info from localStorage', () => {
    const result = getTokenInfoByWhitelist(aelfMainChainId, 'ELF');
    expect(result).toEqual(mockTokenInfo);
  });

  it('should return undefined for missing data', () => {
    localStorageMock.clear();
    const result = getTokenInfoByWhitelist(aelfMainChainId, 'ELF');
    expect(result).toBeUndefined();
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorageMock.setItem(storages.useWhitelist, 'invalid_json');
    const result = getTokenInfoByWhitelist(aelfMainChainId, 'ELF');
    expect(result).toBeUndefined();
  });

  it('should return undefined for invalid chainId', () => {
    const result = getTokenInfoByWhitelist(undefined, 'ELF');
    expect(result).toBeUndefined();
  });

  it('should return undefined for invalid symbol', () => {
    const result = getTokenInfoByWhitelist(aelfMainChainId, undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined for invalid arguments', () => {
    const result = getTokenInfoByWhitelist();
    expect(result).toBeUndefined();
  });
});
