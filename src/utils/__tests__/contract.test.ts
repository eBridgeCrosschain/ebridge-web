import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { ChainId, ChainType } from 'types';
import { encodedTransfer, getContractMethods, getTxResult, isELFChain, transformArrayToMap } from 'utils/aelfUtils';
import { checkAElfBridge } from 'utils/checkAElfBridge';
import { TonConnectUI } from '@tonconnect/ui-react';
import { getTransactionResponseHash } from 'utils/ton';
import {
  AElfContractBasic,
  ContractBasic,
  PortkeyContractBasic,
  TONContractBasic,
  WB3ContractBasic,
} from 'utils/contract';
import { TonContractCallData } from 'utils/tonContractCall';
import { isTonChain } from 'utils';

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

vi.mock('utils/checkAElfBridge', () => ({
  checkAElfBridge: vi.fn(),
}));

vi.mock('utils/ton', () => ({
  getTransactionResponseHash: vi.fn(),
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
          appName: 'AELF_appName',
          options: {},
        },
      },
    },
  };
});

vi.mock('@tonconnect/ui-react', () => {
  return {
    TonConnectUI: vi.fn(),
  };
});

vi.mock('@aelf-web-login/wallet-adapter-bridge', () => {
  return {
    PortkeyDid: vi.fn(),
  };
});

vi.mock('web3-core', () => {
  return {
    provider: vi.fn(),
  };
});

vi.mock('web3', () => {
  const Web3Mock: any = vi.fn().mockImplementation((provider) => ({
    provider,
    eth: {
      Contract: vi.fn(),
      getGasPrice: vi.fn(),
    },
    providers: {
      HttpProvider: vi.fn().mockImplementation((url: string) => ({
        url,
        options: { keepAlive: true, withCredentials: false, timeout: 20000 },
      })),
    },
  }));

  return {
    default: Web3Mock,
  };
});

const correctAelfAddress = 'ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_AELF';
const AELFTestnetContractAddress = 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE';

describe('ContractBasic Class', () => {
  const mockPortkeyProps = {
    portkeyChain: { getContract: vi.fn() },
    contractAddress: 'ELF_ADDRESS',
    chainId: 'AELF' as ChainId,
  } as any;

  const mockAelfProps = {
    contractAddress: 'ELF_ADDRESS',
    chainId: 'AELF' as ChainId,
    aelfContract: { someMethod: vi.fn() },
  };

  const mockERCProps = {
    contractAddress: 'ERC_ADDRESS',
    chainId: 11155111 as ChainId,
    // provider: {},
    // contractABI: [],
  };

  const mockTONProps = {
    contractAddress: 'TON_ADDRESS',
    chainId: 1100 as ChainId,
    // tonConnectUI: { sendTransaction: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize portkey contract correctly', async () => {
    // Setup chain environment
    vi.mocked(isELFChain).mockReturnValue(true);

    const contract = new ContractBasic(mockPortkeyProps);

    expect(contract.contractType).toBe('ELF');
    expect(contract.callContract).toBeInstanceOf(PortkeyContractBasic);

    // const viewResult = await contract.callViewMethod('GetBalance', {
    //   symbol: 'ELF',
    //   owner: correctAelfAddress,
    // });
  });

  it('should initialize aelf contract correctly', () => {
    // Setup chain environment
    vi.mocked(isELFChain).mockReturnValue(true);

    const contract = new ContractBasic(mockAelfProps);

    expect(contract.contractType).toBe('ELF');
    expect(contract.callContract).toBeInstanceOf(AElfContractBasic);
  });

  it('should initialize ERC contract correctly', () => {
    // Setup chain environment
    vi.mocked(isELFChain).mockReturnValue(false);
    vi.mocked(isTonChain).mockReturnValue(false);

    const contract = new ContractBasic(mockERCProps);

    expect(contract.contractType).toBe('ERC');
    expect(contract.callContract).toBeInstanceOf(WB3ContractBasic);
  });

  it('should initialize TON contract correctly', () => {
    // Setup chain environment
    vi.mocked(isELFChain).mockReturnValue(false);
    vi.mocked(isTonChain).mockReturnValue(true);

    const contract = new ContractBasic(mockTONProps);

    expect(contract.contractType).toBe('TON');
    expect(contract.callContract).toBeInstanceOf(TONContractBasic);
  });
});

describe('WB3ContractBasic Class', () => {
  const mockProps = {
    contractAddress: '0x123',
    chainId: 1 as ChainId,
    provider: {},
    contractABI: [],
  } as any;

  it('should initialize web3 contract successfully', () => {
    const contract = new WB3ContractBasic(mockProps);
    expect(contract.contract).toBeDefined();
  });

  // it('should handle view method calls', async () => {
  //   const contract = new WB3ContractBasic(mockProps);
  //   vi.spyOn(contract.contractForView.methods, 'testMethod').mockReturnValue({
  //     call: vi.fn().mockResolvedValue('result'),
  //   });

  //   const result = await contract.callViewMethod('testMethod', ['param']);
  //   expect(result).toBe('result');
  // });

  it('should handle send method errors', async () => {
    const contract = new WB3ContractBasic({ ...mockProps, provider: undefined });
    const result = await contract.callSendMethod('testMethod', '0xAccount', []);
    expect(result.error).toBeDefined();
  });
});

describe('AElfContractBasic Class', () => {
  const mockProps = {
    contractAddress: 'ELF_ADDRESS',
    chainId: 999 as ChainId,
  } as any;

  describe('callViewMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle successful view method calls', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          TestMethod: {
            call: vi.fn().mockResolvedValue({ result: 'data' }),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ TestMethod: {} });

      const result = await contract.callViewMethod('TestMethod');
      expect(result).toBe('data');
    });

    it('should return null if aelfContract[method] return null', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          TestMethod: {
            call: vi.fn().mockResolvedValue({ result: null }),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ TestMethod: {} });

      const result = await contract.callViewMethod('TestMethod');

      expect(result).toBeNull();
    });

    it('should return result if aelfContract[method] return result', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          TestMethod: {
            call: vi.fn().mockResolvedValue({ status: 'success' }),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ TestMethod: {} });

      const result = await contract.callViewMethod('TestMethod');

      expect(result.status).toBe('success');
    });

    it('should return error if aelfContract[method] return error', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          TestMethod: {
            call: vi.fn().mockRejectedValue({ status: 'error' }),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ TestMethod: {} });

      const result = await contract.callViewMethod('TestMethod');

      expect(result.error).toEqual({ status: 'error' });
    });

    it('should return error if there is no aelfContract', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ TestMethod: {} });

      const result = await contract.callViewMethod('TestMethod');

      expect(result).toEqual({ error: { code: 401, message: 'Contract init error1' } });
    });
  });

  describe('callSendMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle send method transaction flow and return tx result', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          GetTransaction: vi.fn().mockResolvedValue({ TransactionId: 'mockId' }),
        },
        aelfInstance: {},
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });
      vi.mocked(getTxResult).mockResolvedValue({ txResult: 'success' });

      const result = await contract.callSendMethod('GetTransaction', {});

      expect(result.txResult).toBe('success');
    });

    it('should handle send method transaction flow and return TransactionId', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          GetTransaction: vi.fn().mockResolvedValue({ TransactionId: 'mockId' }),
        },
        aelfInstance: {},
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });
      vi.mocked(getTxResult).mockResolvedValue({ txResult: 'success' });

      const result = await contract.callSendMethod('GetTransaction', {}, { onMethod: 'transactionHash' });

      expect(result).toHaveProperty('TransactionId', 'mockId');
    });

    it('should return error if there is no aelfInstance', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          GetTransaction: vi.fn().mockResolvedValue({ TransactionId: 'mockId' }),
        },
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });
      vi.mocked(getTxResult).mockResolvedValue({ txResult: 'success' });

      const result = await contract.callSendMethod('GetTransaction', {}, { onMethod: 'transactionHash' });

      expect(result).toEqual({ error: new Error('aelfInstance is undefined') });
    });

    it('should return error if there is not aelfContract', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
      });

      const result = await contract.callSendMethod('GetTransaction', {}, { onMethod: 'transactionHash' });

      expect(result).toEqual({ error: { code: 401, message: 'Contract init error2' } });
    });

    it('should return error if getTxResult throw error.message', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          GetTransaction: vi.fn().mockResolvedValue({ TransactionId: 'mockId' }),
        },
        aelfInstance: {},
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });
      vi.mocked(getTxResult).mockRejectedValue({ message: 'Failed to get tx result' });

      const result = await contract.callSendMethod('GetTransaction', {});

      expect(result.error).toEqual({ message: 'Failed to get tx result' });
    });

    it('should return error if getTxResult throw error.ErrorMessage', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          GetTransaction: vi.fn().mockResolvedValue({
            TransactionId: 'mockId',
            errorMessage: {
              message: 'Failed to get tx result',
            },
          }),
        },
        aelfInstance: {},
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });
      vi.mocked(getTxResult).mockRejectedValue({ ErrorMessage: 'Failed' });

      const result = await contract.callSendMethod('GetTransaction', {});

      expect(result.error).toEqual({ message: 'Failed to get tx result' });
    });

    it('should return error if getTxResult throw string error', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          GetTransaction: vi.fn().mockResolvedValue({
            TransactionId: '',
            error: {
              message: { Message: 'Failed to get tx result' },
            },
          }),
        },
        aelfInstance: {},
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });
      vi.mocked(getTxResult).mockRejectedValue('Failed');

      const result = await contract.callSendMethod('GetTransaction', {});

      expect(result.error).toEqual({
        message: 'Failed to get tx result',
        code: {
          message: {
            Message: 'Failed to get tx result',
          },
        },
      });
    });

    // it('should catch error if getContractMethods rejected', async () => {
    //   const contract = new AElfContractBasic({
    //     ...mockProps,
    //     aelfContract: {
    //       GetTransactionInfo: vi.fn().mockResolvedValue({ TransactionId: 'mockId' }),
    //     },
    //     aelfInstance: {},
    //   });

    //   vi.mocked(getContractMethods)
    //     .mockResolvedValueOnce({ testMethod: {} })
    //     .mockRejectedValueOnce('Failed to get GetTransactionInfo method');
    //   // vi.mocked(getTxResult).mockResolvedValue({ txResult: 'success' });

    //   await expect(await contract.callSendMethod('GetTransactionInfo', {})).rejects.toThrow();
    //   // try {
    //   //   const result = await contract.callSendMethod('GetTransactionInfo', {});
    //   //   console.log('🌹 result', result);
    //   //   expect(result).toHaveProperty('error', {
    //   //     message: `"Failed to get GetTransactionInfo method"address:ELF_ADDRESSContract:getContractMethods`,
    //   //   });
    //   // } catch (error) {
    //   //   console.log('🌹 error', error);
    //   // }
    // });
    //
  });

  describe('encodedTx', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return encode tx successfully', async () => {
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
      vi.mocked(encodedTransfer).mockResolvedValue({
        data: 'encodedData',
        inputType: 'inputType',
      });

      const result = await contract.encodedTx('GetTransaction', {});

      expect(result).toEqual({ data: 'encodedData', inputType: 'inputType' });
    });

    it('should return error if there is no aelfContract', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });
      vi.mocked(encodedTransfer).mockResolvedValue({
        data: 'encodedData',
        inputType: 'inputType',
      });

      const result = await contract.encodedTx('GetTransaction', {});

      expect(result).toEqual({ error: { code: 401, message: 'Contract init error2' } });
    });

    it('should return error if encodedTransfer is throw error', async () => {
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
      vi.mocked(encodedTransfer).mockImplementation(() => {
        throw 'Failed encode tx';
      });

      const result = await contract.encodedTx('GetTransaction', {});

      expect(result).toEqual({ error: 'Failed encode tx' });
    });
  });

  describe('callSendPromiseMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle callSendPromiseMethod method', async () => {
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

      expect(result).toBeDefined();
    });

    it('should return error if there is no aelfContract', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
      });

      const result = await contract.callSendPromiseMethod('GetTransaction', {});

      expect(result).toEqual({ error: { code: 401, message: 'Contract init error3' } });
    });
  });
});

describe('PortkeyContractBasic Class', () => {
  const mockProps = {
    contractAddress: AELFTestnetContractAddress,
    chainId: 'AELF' as ChainId,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should catch error if there is no contract method', async () => {
    // Mock contract
    const contract = new PortkeyContractBasic({ ...mockProps, portkeyChain: { getContract: vi.fn() } });
    vi.mocked(getContractMethods).mockResolvedValue({ TestMethod: {} });

    const result = await contract.callViewMethod('GetBalance');

    expect(result).toEqual({
      error: {
        code: 401,
        message: 'Contract init error1',
      },
    });
  });

  it('should handle portkey view methods', async () => {
    const contract = new PortkeyContractBasic({
      ...mockProps,
      portkeyChain: {
        getContract: vi.fn().mockReturnValue({
          callViewMethod: vi.fn().mockResolvedValue({ data: { balance: '1000' } }),
        }),
      },
    });
    vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

    const result = await contract.callViewMethod('GetBalance');

    expect(result).toHaveProperty('balance', '1000');
  });

  it('should catch error if there is no contract "GetWalletInfo" method', async () => {
    const contract = new PortkeyContractBasic({
      ...mockProps,
      portkeyChain: {
        getContract: vi.fn().mockReturnValue({
          callViewMethod: vi.fn(),
        }),
      },
    });
    vi.mocked(getContractMethods).mockRejectedValue('Failed to get GetWalletInfo method');

    const result = await contract.callViewMethod('GetWalletInfo');

    expect(result).toHaveProperty(
      'error',
      new Error(
        `"Failed to get GetWalletInfo method"address:JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaEContract:getContractMethods`,
      ),
    );
  });
});

describe('TONContractBasic Class', () => {
  const mockProps = {
    contractAddress: 'TON_ADDRESS',
    chainId: 1007 as ChainId,
    tonConnectUI: {
      account: { address: 'TON_ACCOUNT' },
      sendTransaction: vi.fn().mockResolvedValue({ boc: 'TON_TX' }),
    },
  } as any;

  describe('callViewMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call GetBalance method and return correct result', async () => {
      // Mock methods
      const contract = new TONContractBasic(mockProps);

      const result = await contract.callViewMethod('GetBalance', []);

      expect(result).toHaveProperty('balance', '123');
    });

    it('should call GetTokenInfo method and return error.message', async () => {
      // Mock methods
      const contract = new TONContractBasic(mockProps);

      const result = await contract.callViewMethod('GetTokenInfo', []);

      expect(result).toHaveProperty('error', { message: 'Failed to get token info' });
    });

    it('should call GetAllowance method and return error.Error', async () => {
      // Mock methods
      const contract = new TONContractBasic(mockProps);

      const result = await contract.callViewMethod('GetAllowance', []);

      expect(result).toHaveProperty('error', { message: 'Failed to get allowance' });
    });

    it('should call GetSwapId method and return error.Status', async () => {
      // Mock methods
      const contract = new TONContractBasic(mockProps);

      const result = await contract.callViewMethod('getSwapId', []);

      expect(result).toHaveProperty('error', { message: 'Failed to get swap id' });
    });
  });

  describe('callSendMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle TON transactions', async () => {
      // Mock methods
      vi.mocked(getTransactionResponseHash).mockResolvedValue('TON_HASH');
      vi.mocked(TonContractCallData).createReceipt = vi.fn().mockResolvedValue({});

      const contract = new TONContractBasic(mockProps);

      const result = await contract.callSendMethod('createReceipt', '', []);

      expect(result.TransactionId).toBe('TON_HASH');
    });

    it('should catch error if getTransactionResponseHash rejected error.Error', async () => {
      // Mock methods
      vi.mocked(getTransactionResponseHash).mockRejectedValue({
        Error: 'Failed to get hash',
      });
      vi.mocked(TonContractCallData).createReceipt = vi.fn().mockResolvedValue({});

      const contract = new TONContractBasic(mockProps);

      const result = await contract.callSendMethod('createReceipt', '', []);

      expect(result).toHaveProperty('error', { message: 'Failed to get hash' });
    });

    it('should catch error if getTransactionResponseHash rejected error.Error', async () => {
      // Mock methods
      vi.mocked(getTransactionResponseHash).mockRejectedValue({
        Status: 'Failed to get hash',
      });
      vi.mocked(TonContractCallData).createReceipt = vi.fn().mockResolvedValue({});

      const contract = new TONContractBasic(mockProps);

      const result = await contract.callSendMethod('createReceipt', '', []);

      expect(result).toHaveProperty('error', { message: 'Failed to get hash' });
    });

    it('should catch error if getTransactionResponseHash rejected error.message', async () => {
      // Mock methods
      vi.mocked(getTransactionResponseHash).mockRejectedValue({
        message: 'Failed to get hash',
      });
      vi.mocked(TonContractCallData).createReceipt = vi.fn().mockResolvedValue({});

      const contract = new TONContractBasic(mockProps);

      const result = await contract.callSendMethod('createReceipt', '', []);

      expect(result).toHaveProperty('error', { message: 'Failed to get hash' });
    });

    it('should handle missing TON connection', async () => {
      const contract = new TONContractBasic({ ...mockProps, tonConnectUI: undefined });

      const result = await contract.callSendMethod('createReceipt', '', []);

      expect(result.error).toBeDefined();
    });
  });

  describe('callSendPromiseMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call createReceipt correctly and return undefined', async () => {
      const contract = new TONContractBasic({ ...mockProps, tonConnectUI: undefined });

      const result = await contract.callSendPromiseMethod('createReceipt', '', []);

      expect(result).toBeUndefined();
    });
  });
});

// Boundary and edge case tests
describe('Boundary Cases', () => {
  const mockAelfProps = {
    contractAddress: 'ELF_ADDRESS',
    chainId: 999 as ChainId,
  } as any;

  const mockERCProps = {
    contractAddress: 'ERC_ADDRESS',
    chainId: 11155111 as ChainId,
  };

  it('should handle invalid chain IDs', () => {
    vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

    const contract = new ContractBasic({ contractAddress: '0x123', chainId: 0 as ChainId });

    expect(contract.contractType).toBe('TON');
  });

  it('should handle empty contract addresses', () => {
    const contract = new WB3ContractBasic({ ...mockERCProps, contractAddress: '' });
    expect(contract.contract).toBeNull();
  });

  it('should handle non-object parameters', async () => {
    const contract = new AElfContractBasic(mockAelfProps);
    const result = await contract.callSendMethod('testMethod', 'invalid' as any);
    expect(result.error).toBeDefined();
  });

  // it('should handle network failures', async () => {
  //   const contract = new WB3ContractBasic(mockERCProps);
  //   // vi.spyOn(contract.contractForView.methods, 'testMethod').mockReturnValue({
  //   //   call: vi.fn().mockRejectedValue(new Error('Network error')),
  //   // });

  //   const result = await contract.callViewMethod('testMethod');
  //   expect(result.error).toBeDefined();
  // });
});
