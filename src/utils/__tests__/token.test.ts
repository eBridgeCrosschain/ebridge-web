import { NATIVE_TOKEN_LIST } from 'constants/index';

import { formatSymbol, formatSymbolAndNativeToken } from 'utils/token';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('formatSymbol', () => {
  it('should format symbol using SYMBOL_FORMAT_MAP', () => {
    const result = formatSymbol('SGR-1');
    expect(result).toBe('SGR');
  });

  it('should return the original symbol if not in SYMBOL_FORMAT_MAP', () => {
    const result = formatSymbol('ETH');
    expect(result).toBe('ETH');
  });
});

describe('formatSymbolAndNativeToken', () => {
  it('should format symbol using SYMBOL_FORMAT_MAP', () => {
    const result = formatSymbolAndNativeToken('SGR-1');
    expect(result).toBe('SGR');
  });

  it('should remove "W" prefix for native tokens', () => {
    const result = formatSymbolAndNativeToken('WETH');
    expect(result).toBe('ETH');
  });

  it('should return the original symbol if not in SYMBOL_FORMAT_MAP or NATIVE_TOKEN_LIST', () => {
    const result = formatSymbolAndNativeToken('BTC');
    expect(result).toBe('BTC');
  });
});
