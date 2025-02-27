import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProvider, isUserDenied, getDefaultProvider, getDefaultProviderByChainId } from '../provider';
import Web3 from 'web3';
import { getBridgeChainInfo } from '../chain';
import { ChainId } from 'types';

// Mock external dependencies
vi.mock('web3', () => {
  return {
    default: {
      providers: {
        HttpProvider: vi.fn().mockImplementation((url: string) => ({
          url,
          options: { keepAlive: true, withCredentials: false, timeout: 20000 },
        })),
      },
    },
  };
});

vi.mock('constants/ChainConstants', () => ({
  ERCChainConstants: {
    constants: {
      CHAIN_INFO: {
        rpcUrl: 'https://default.rpc.url',
      },
    },
  },
}));

vi.mock('constants/index', () => {
  // Mock SupportedERCChain data
  const mockSupportedERCChain = {
    1: { CHAIN_INFO: { rpcUrl: 'https://chain1.rpc.url' } },
    2: { CHAIN_INFO: { rpcUrl: 'https://chain2.rpc.url' } },
  };

  // Mock SupportedERCChain implementation
  return {
    SupportedERCChain: mockSupportedERCChain,
  };
});

vi.mock('../chain', () => ({
  getBridgeChainInfo: vi.fn(),
}));

describe('Web3 Provider Utilities', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('getProvider', () => {
    it('should return correct provider for existing chainId (number)', () => {
      const provider = getProvider(1);

      // Verify provider construction with correct URL
      expect(provider).toHaveProperty('url', 'https://chain1.rpc.url');
    });

    it('should return correct provider for existing chainId (string)', () => {
      const provider = getProvider(2);

      // Verify provider construction with correct URL
      expect(provider).toHaveProperty('url', 'https://chain2.rpc.url');
    });

    it('should return undefined for non-existing chainId', () => {
      const provider = getProvider(999);
      expect(provider).toBeUndefined();
    });

    it('should handle invalid chainId types', () => {
      // Test with boolean type
      const provider = getProvider(true as unknown as number);
      expect(provider).toBeUndefined();
    });
  });

  describe('isUserDenied', () => {
    it('should return true for messages containing "User denied"', () => {
      expect(isUserDenied('User denied transaction')).toBe(true);
      expect(isUserDenied('Error: User denied message')).toBe(true);
    });

    it('should return false for messages without "User denied"', () => {
      expect(isUserDenied('Transaction failed')).toBe(false);
      expect(isUserDenied('')).toBe(false);
    });

    it('should handle non-string inputs gracefully', () => {
      // Test with number input
      expect(isUserDenied(123 as unknown as string)).toBe(false);
      // Test with object input
      expect(isUserDenied({ message: 'User denied' } as unknown as string)).toBe(false);
    });
  });

  describe('getDefaultProvider', () => {
    it('should create provider with default ERC chain URL', () => {
      const provider = getDefaultProvider();
      expect(Web3.providers.HttpProvider).toHaveBeenCalledWith(
        'https://default.rpc.url',
        expect.objectContaining({
          keepAlive: true,
          withCredentials: false,
          timeout: 20000,
        }),
      );

      // Verify provider construction with correct URL
      expect(provider).toHaveProperty('url', 'https://default.rpc.url');
    });
  });

  describe('getDefaultProviderByChainId', () => {
    it('should create provider with chain-specific URL', () => {
      // Mock bridge chain info response
      const rpcUrl = 'https://custom.rpc.url';
      vi.mocked(getBridgeChainInfo).mockReturnValue({
        CHAIN_INFO: { rpcUrl: rpcUrl },
      });

      const provider = getDefaultProviderByChainId(5 as ChainId);

      expect(getBridgeChainInfo).toHaveBeenCalledWith(5);
      expect(Web3.providers.HttpProvider).toHaveBeenCalledWith(rpcUrl, expect.any(Object));

      // Verify provider construction with correct URL
      expect(provider).toHaveProperty('url', rpcUrl);
    });

    it('should handle missing chain info gracefully', () => {
      vi.mocked(getBridgeChainInfo).mockReturnValue(undefined);
      const provider = getDefaultProviderByChainId(999 as ChainId);

      // Verify provider construction with correct URL
      expect(provider).toHaveProperty('url', undefined);
    });

    it('should handle invalid chainId types', () => {
      // Test with string chainId
      const rpcUrl = 'https://string.chain.url';
      vi.mocked(getBridgeChainInfo).mockReturnValue({
        CHAIN_INFO: { rpcUrl: rpcUrl },
      });
      const provider = getDefaultProviderByChainId('invalid' as unknown as ChainId);

      expect(getBridgeChainInfo).toHaveBeenCalledWith('invalid');

      // Verify provider construction with correct URL
      expect(provider).toHaveProperty('url', rpcUrl);
    });
  });
});
