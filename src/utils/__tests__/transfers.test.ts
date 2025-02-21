import { parseCrossChainTransfers } from 'utils/transfers';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('utils/chain', () => ({
  getChainIdByAPI: vi.fn((chainId: string) => chainId),
}));

describe('parseCrossChainTransfers', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should parse cross-chain transfers correctly', () => {
    const items = [
      { toChainId: 'AELF', fromChainId: 'ETH', txId: 'tx1' },
      { toChainId: 'BSC', fromChainId: 'AELF', txId: 'tx2' },
    ];
    const result = parseCrossChainTransfers({ items });
    expect(result).toEqual([
      { toChainId: 'AELF', fromChainId: 'ETH', txId: 'tx1' },
      { toChainId: 'BSC', fromChainId: 'AELF', txId: 'tx2' },
    ]);
  });

  it('should return undefined if items are undefined', () => {
    const result = parseCrossChainTransfers({ items: undefined });
    expect(result).toBeUndefined();
  });
});
