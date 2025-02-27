import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { ChainId } from 'types';
import { getContractMethods } from 'utils/aelfUtils';
import { AElfContractBasic } from 'utils/contract';

// Mock external dependencies
vi.mock('utils/index', () => {
  return {
    isTonChain: vi.fn(),
    sleep: vi.fn(),
  };
});

vi.mock('utils/aelfUtils', () => ({
  getContractMethods: vi.fn(),
  transformArrayToMap: vi.fn((_, params) => params),
  getTxResult: vi.fn(),
  encodedTransfer: vi.fn(),
  isELFChain: vi.fn(),
}));

vi.mock('utils/tonContractCall', () => {
  return {
    CallTonContract: {
      GetBalance: vi.fn().mockReturnValue({ balance: '123' }),
      GetTokenInfo: vi.fn().mockImplementation(() => {
        throw { message: 'Failed to get token info' };
      }),
      GetAllowance: vi.fn().mockImplementation(() => {
        throw { Error: 'Failed to get allowance' };
      }),
      getSwapId: vi.fn().mockImplementation(() => {
        throw { Status: 'Failed to get swap id' };
      }),
    },
    TonContractCallData: {
      createReceipt: vi.fn(),
    },
  };
});

vi.mock('utils/provider', () => {
  return {
    getDefaultProviderByChainId: vi.fn(),
  };
});

// Mock ELFChainConstants and ERCChainConstants
vi.mock('constants/ChainConstants', () => {
  return {
    ELFChainConstants: {
      aelfInstances: {
        AELF: {
          // appName: 'AELF_appName',
          // options: {},
          appName: undefined,
          options: undefined,
        },
      },
    },
  };
});

vi.mock('@aelf-web-login/wallet-adapter-bridge', () => {
  return {
    PortkeyDid: vi.fn(),
  };
});

describe('AElfContractBasic Class', () => {
  const mockProps = {
    contractAddress: 'ELF_ADDRESS',
    chainId: 999 as ChainId,
  } as any;

  describe('callSendPromiseMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          GetTransaction: {
            call: vi.fn().mockResolvedValue({ result: 'data' }),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.callSendPromiseMethod('GetTransaction', {});

      expect(result).toEqual({
        error: {
          code: 402,
          message: 'connect aelf',
        },
      });
    });
  });
});
