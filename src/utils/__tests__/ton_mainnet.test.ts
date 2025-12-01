import { describe, it, expect, vi, beforeEach } from 'vitest';
import TonWeb from 'tonweb';
import { getTONJettonMinter } from 'utils/ton';

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

vi.mock('constants/index', async (importOriginal) => {
  const originalModule: any = await importOriginal();

  return {
    ...originalModule,
    IS_MAINNET: true,
  };
});

describe('getTONJettonMinter', () => {
  const mockTokenContractAddress = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA';

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should return token balance correctly with mainnet', async () => {
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

  it('should handle wallet data fetch error with mainnet', async () => {
    // Mock TonWeb.token.jetton.JettonMinter throw error
    const error = 'Failed to get JettonMinter';
    (TonWeb.token.jetton.JettonMinter as any).mockRejectedValue(error);

    await expect(getTONJettonMinter(mockTokenContractAddress)).rejects.toThrow(error);
  });
});
