import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { CallTonContract, TonContractCallData } from 'utils/tonContractCall';
import { ZERO } from 'constants/misc';
import { getTONJettonMinter, packCreateReceiptBody, TON_WEB } from '../ton';

// Mock external dependencies
vi.mock('tonweb', async () => {
  const tonMock: any = vi.fn().mockImplementation(() => ({
    utils: {
      Address: vi.fn(),
    },
  }));

  tonMock.utils = {
    Address: vi.fn(),
  };

  return {
    default: tonMock,
  };
});

vi.mock('@ton/core', () => ({
  Address: {
    parse: vi.fn(),
    isFriendly: vi.fn(),
    isAddress: vi.fn(),
  },
  beginCell: vi.fn(() => ({
    storeUint: vi.fn().mockReturnThis(),
    storeCoins: vi.fn().mockReturnThis(),
    storeBuffer: vi.fn().mockReturnThis(),
    storeAddress: vi.fn().mockReturnThis(),
    storeMaybeRef: vi.fn().mockReturnThis(),
    endCell: vi.fn(() => ({
      toBoc: vi.fn(() => Buffer.from('mock_boc')),
      hash: vi.fn(() => Buffer.from('mock_hash')),
    })),
  })),
  toNano: vi.fn((amount: string) => Number(amount) * 1e9),
}));

vi.mock('../ton', () => {
  return {
    getTONJettonMinter: vi.fn(),
    packCreateReceiptBody: vi.fn(),
    TON_WEB: {
      provider: {
        call: vi.fn(),
      },
    },
  };
});

vi.mock('../chain', () => {
  return {
    base58ToChainId: vi.fn(),
  };
});

vi.mock('aelf-sdk', () => {
  return {
    default: {
      utils: {
        base58: {
          decode: vi.fn(),
        },
      },
    },
  };
});

const mockAccount = 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N';
const mockContractAddress = 'EQAhE0sJbtgHJqENqgHSpkPPNmR_9lYMTw_1QJkCCtS-H6e5';

describe('TonContractCallData', () => {
  describe('createReceipt', () => {
    beforeEach(() => {
      // Mock dependencies
      (getTONJettonMinter as Mock).mockReturnValue({
        getJettonWalletAddress: vi.fn().mockReturnValue({
          isUserFriendly: true,
          isBounceable: true,
          isUrlSafe: true,
          toString: vi.fn(),
        }),
      });
      (packCreateReceiptBody as Mock).mockReturnValue({
        toBoc: vi.fn(() => Buffer.from('mock_boc')),
        hash: vi.fn(() => Buffer.from('mock_hash')),
      });
    });

    it('should create receipt transaction with valid parameters', async () => {
      const transaction = await TonContractCallData.createReceipt(mockContractAddress, mockAccount, [
        'token_address',
        '100',
        'AELF',
        'target_address',
      ]);

      // Verify transaction structure
      expect(transaction.messages[0].address).toBeUndefined();
      expect(transaction.messages[0].amount).toBe((0.3 * 1e9).toString());
      expect(transaction.validUntil).toBeDefined();
    });

    it('should handle zero amount in transaction', async () => {
      const transaction = await TonContractCallData.createReceipt(mockContractAddress, mockAccount, [
        'token_address',
        '0',
        'chainId_AELF',
        'target_address',
      ]);

      // Verify transaction structure
      expect(transaction.messages[0].payload).toBeDefined();
    });
  });
});

describe('CallTonContract', () => {
  describe('getReceiptDailyLimit', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      vi.clearAllMocks();
    });

    it('should get receipt daily limit correctly', async () => {
      // Mock provider call response
      (TON_WEB.provider.call as any).mockResolvedValue({
        stack: [
          [null, '100'],
          [null, '1633072800'],
          [null, '500'],
        ],
      });

      const result = await CallTonContract.getReceiptDailyLimit(mockContractAddress, ['', 'AELF']);

      expect(result.tokenAmount).toEqual(ZERO.plus(100));
      expect(result.dailyLimit).toEqual(ZERO.plus(500));
    });

    it('should handle empty response from provider', async () => {
      (TON_WEB.provider.call as any).mockResolvedValue({ stack: [] });

      await expect(CallTonContract.getReceiptDailyLimit(mockContractAddress, ['', ''])).rejects.toThrow();
    });
  });

  describe('getCurrentReceiptTokenBucketState', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      vi.clearAllMocks();
    });

    it('should get current receipt token bucket state correctly', async () => {
      (TON_WEB.provider.call as any).mockResolvedValue({
        stack: [
          [null, '100'],
          [null, '1633072800'],
          [null, '500'],
          [null, '600'],
          [null, '700'],
        ],
      });

      const result = await CallTonContract.getCurrentReceiptTokenBucketState(mockContractAddress, ['', 'AELF']);

      expect(result.currentTokenAmount).toEqual(ZERO.plus(100));
      expect(result.refreshTime).toEqual(ZERO.plus(1633072800));
      expect(result.tokenCapacity).toEqual(ZERO.plus(500));
      expect(result.isEnable).toEqual(false);
      expect(result.rate).toEqual(ZERO.plus(700));
    });

    it('should handle empty response from provider', async () => {
      (TON_WEB.provider.call as any).mockResolvedValue({ stack: [] });

      await expect(CallTonContract.getReceiptDailyLimit(mockContractAddress, ['', ''])).rejects.toThrow();
    });
  });
});
