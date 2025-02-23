import { describe, it, expect, vi, beforeEach } from 'vitest';
import TonWeb from 'tonweb';
import { Address } from '@ton/core';
import { SendTransactionResponse } from '@tonconnect/ui-react';
import {
  getTonChainBalance,
  packCreateReceiptBody,
  getTransactionResponseHash,
  isTonAddress,
  getTONJettonMinter,
} from 'utils/ton';

// Mock external dependencies
vi.mock('tonweb', async () => {
  const tonMock: any = vi.fn().mockImplementation(() => ({
    HttpProvider: vi.fn(),
    provider: {
      call: vi.fn(),
    },
    token: {
      jetton: {
        JettonMinter: vi.fn(),
        JettonWallet: vi.fn(),
      },
    },
    boc: {
      Cell: {
        oneFromBoc: vi.fn().mockReturnValue({
          hash: vi.fn(),
        }),
      },
    },
    utils: {
      base64ToBytes: vi.fn(),
      bytesToBase64: vi.fn((bytes: number[]) => Buffer.from(bytes).toString('base64')),
      Address: vi.fn(),
    },
  }));

  tonMock.HttpProvider = vi.fn();

  tonMock.provider = {
    call: vi.fn(),
  };

  tonMock.token = {
    jetton: {
      JettonMinter: vi.fn(),
      JettonWallet: vi.fn(),
    },
  };

  tonMock.boc = {
    Cell: {
      oneFromBoc: vi.fn().mockReturnValue({
        hash: vi.fn(),
      }),
    },
  };

  tonMock.utils = {
    base64ToBytes: vi.fn(),
    bytesToBase64: vi.fn((bytes: number[]) => Buffer.from(bytes).toString('base64')),
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
    storeBuffer: vi.fn().mockReturnThis(),
    storeAddress: vi.fn().mockReturnThis(),
    endCell: vi.fn(() => ({
      toBoc: vi.fn(() => Buffer.from('mock_boc')),
      hash: vi.fn(() => Buffer.from('mock_hash')),
    })),
  })),
}));

vi.mock('../chain', () => ({
  base58ToChainId: vi.fn((chainId: string) => chainId),
}));

vi.mock('constants/index', async (importOriginal) => {
  const originalModule: any = await importOriginal();

  return {
    ...originalModule,
    IS_MAINNET: false,
  };
});

const mockAccount = 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N';
const mockContractAddress = 'EQAhE0sJbtgHJqENqgHSpkPPNmR_9lYMTw_1QJkCCtS-H6e5';
const mockTokenContractAddress = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA';

describe('getTONJettonMinter', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should return token balance correctly with testnet', async () => {
    // Mock TonWeb.token.jetton.JettonMinter return value
    const mockJettonMinter = {
      getJettonWalletAddress: vi.fn().mockReturnValue({
        isUserFriendly: true,
        isBounceable: true,
        isUrlSafe: true,
        toString: vi.fn(),
      }),
    };
    (TonWeb.token.jetton.JettonMinter as any).mockImplementation(() => mockJettonMinter);

    const result = getTONJettonMinter(mockTokenContractAddress);

    expect(result).toBeDefined();
  });

  it('should handle wallet data fetch error with testnet', async () => {
    // Mock TonWeb.token.jetton.JettonMinter throw error
    const error = 'Failed to get JettonMinter';
    (TonWeb.token.jetton.JettonMinter as any).mockRejectedValue(error);

    await expect(getTONJettonMinter(mockTokenContractAddress)).rejects.toThrow(error);
  });
});

describe('getTonChainBalance', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock TonWeb.token.jetton.JettonMinter return value
    const mockJettonMinter = {
      getJettonWalletAddress: vi.fn().mockReturnValue({
        isUserFriendly: true,
        isBounceable: true,
        isUrlSafe: true,
        toString: vi.fn(),
      }),
    };
    (TonWeb.token.jetton.JettonMinter as any).mockImplementation(() => mockJettonMinter);
  });

  it('should return token balance correctly', async () => {
    // Mock TonWeb.token.jetton.JettonWallet return balance
    const mockJettonWallet = {
      getData: vi.fn().mockReturnValue({
        balance: 1500,
      }),
    };
    (TonWeb.token.jetton.JettonWallet as any).mockImplementation(() => mockJettonWallet);

    const balance = await getTonChainBalance(mockContractAddress, mockAccount);
    expect(balance).toBe('1500');
  });

  it('should handle wallet data fetch error', async () => {
    // Mock TonWeb.token.jetton.JettonWallet throw error
    const error = 'Failed to get balance';
    const mockJettonWallet = {
      getData: vi.fn().mockRejectedValue(error),
    };
    (TonWeb.token.jetton.JettonWallet as any).mockImplementation(() => mockJettonWallet);

    await expect(getTonChainBalance(mockContractAddress, mockAccount)).rejects.toThrow(error);
  });
});

describe('packCreateReceiptBody', () => {
  it('should pack receipt body correctly', () => {
    const payload = packCreateReceiptBody(
      1,
      Buffer.from('address'),
      Address.parse('EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N'),
    );
    expect(payload).toBeDefined();
  });
});

describe('getTransactionResponseHash', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should generate valid transaction hash', async () => {
    const mockBoc = 'mock_boc';

    const uint8Array = new Uint8Array([0, 1, 2, 3, 15, 16, 255]);
    const expectedHex = '000102030f10ff';

    (TonWeb.boc.Cell.oneFromBoc as any).mockImplementation(() => {
      return {
        hash: () => {
          return uint8Array;
        },
      };
    });

    (TonWeb.utils.bytesToBase64 as any).mockResolvedValue(expectedHex);

    const hash = await getTransactionResponseHash({ boc: mockBoc } as SendTransactionResponse);

    expect(hash).toBe(expectedHex);
  });

  it('should catch the error', async () => {
    const mockBoc = 'mock_boc';
    const error = 'Failed to get hash';
    (TonWeb.boc.Cell.oneFromBoc as any).mockImplementation(() => {
      return {
        hash: vi.fn().mockRejectedValue(error),
      };
    });

    await expect(getTransactionResponseHash({ boc: mockBoc } as SendTransactionResponse)).rejects.toThrow(error);
  });
});

describe('Address Validation', () => {
  it('should validate TON friendly addresses', () => {
    // Mock Address.isFriendly return true
    (Address.isFriendly as any).mockReturnValue(true);

    const result = isTonAddress(mockAccount);

    expect(result).toBe(true);
  });

  it('should return TON address', () => {
    // Mock Address.isFriendly return true
    (Address.isFriendly as any).mockReturnValue(true);

    // Mock Address.isAddress return true
    (Address.isAddress as any).mockReturnValue(true);

    const result = isTonAddress(mockAccount);

    expect(result).toBe(true);
  });

  it('should reject invalid addresses', () => {
    // Mock Address.isFriendly return false
    (Address.isFriendly as any).mockReturnValue(false);

    // Mock Address.isAddress return false
    (Address.isAddress as any).mockReturnValue(false);

    const result = isTonAddress('invalid_address');

    expect(result).toBe(false);
  });
});
