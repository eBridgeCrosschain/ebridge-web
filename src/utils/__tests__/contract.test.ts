import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChainId } from 'types';
import { encodedTransfer, getContractMethods, getTxResult, isELFChain } from 'utils/aelfUtils';
import { getTransactionResponseHash } from 'utils/ton';
import {
  AElfContractBasic,
  ContractBasic,
  PortkeyContractBasic,
  PortkeySDKContractBasic,
  TONContractBasic,
  WB3ContractBasic,
} from 'utils/contract';
import { TonContractCallData } from 'utils/tonContractCall';
import { isTonChain } from 'utils';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { ZERO } from 'constants/misc';
import {
  getGasPriceByWagmi,
  readContractByWagmi,
  waitForTransactionReceiptByWagmi,
  writeContractByWagmi,
} from 'utils/wagmi';
import BigNumber from 'bignumber.js';

// Mock external dependencies
vi.mock('utils/wagmi', () => {
  return {
    getGasPriceByWagmi: vi.fn(),
    readContractByWagmi: vi.fn(),
    waitForTransactionReceiptByWagmi: vi.fn(),
    writeContractByWagmi: vi.fn(),
  };
});

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
    ERCChainConstants: {
      chainId: 11155111,
    },
  };
});

vi.mock('constants/misc', async (importOriginal) => {
  const originalModule: any = await importOriginal();

  return {
    ...originalModule,
    ZERO: {
      plus: vi.fn(),
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
    PortkeyDid: {
      managerApprove: vi.fn(),
    },
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
  };

  const mockTONProps = {
    contractAddress: 'TON_ADDRESS',
    chainId: 1100 as ChainId,
  };

  describe('initialize', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should initialize portkey contract correctly', async () => {
      // Setup chain environment
      vi.mocked(isELFChain).mockReturnValue(true);

      const contract = new ContractBasic(mockPortkeyProps);

      expect(contract.contractType).toBe('ELF');
      expect(contract.callContract).toBeInstanceOf(PortkeyContractBasic);
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

  describe('callViewMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle view method calls with aelf contract', async () => {
      // Setup chain environment
      vi.mocked(isELFChain).mockReturnValue(true);

      const contract = new ContractBasic({
        ...mockAelfProps,
        aelfContract: {
          GetBalance: {
            call: vi.fn().mockResolvedValue({ balance: '1000' }),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance', {
        symbol: 'ELF',
        owner: correctAelfAddress,
      });

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('balance', '1000');
    });

    it('should handle view method calls with portkey contract', async () => {
      // Setup chain environment
      vi.mocked(isELFChain).mockReturnValue(true);

      const contract = new ContractBasic({
        ...mockPortkeyProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callViewMethod: vi.fn().mockResolvedValue({ data: { balance: '1000' } }),
          }),
        },
      });
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance');

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('balance', '1000');
    });

    it('should handle view method calls with web3 contract', async () => {
      // Setup chain environment
      vi.mocked(isELFChain).mockReturnValue(false);
      vi.mocked(isTonChain).mockReturnValue(false);

      const response = 'mockResult';
      vi.mocked(readContractByWagmi).mockResolvedValue(response);

      const contract = new ContractBasic(mockERCProps);

      const result = await contract.callViewMethod('testMethod');

      expect(result).toBe(response);
    });
  });

  describe('callSendMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle send method calls with aelf contract', async () => {
      // Setup chain environment
      vi.mocked(isELFChain).mockReturnValue(true);

      const contract = new ContractBasic({
        ...mockAelfProps,
        aelfContract: {
          GetTransaction: vi.fn().mockResolvedValue({ TransactionId: 'mockId' }),
        },
        aelfInstance: {} as any,
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });
      vi.mocked(getTxResult).mockResolvedValue({ txResult: 'success' });

      const result = await contract.callSendMethod('GetTransaction', correctAelfAddress, {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(getTxResult).toHaveBeenCalled();
      expect(result.txResult).toBe('success');
    });

    it('should handle send method calls with portkey contract', async () => {
      const contract = new ContractBasic({
        ...mockPortkeyProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callSendMethod: vi.fn().mockResolvedValue({ status: 'success' }),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ CreateToken: {}, GetWalletInfo: {} });

      const result = await contract.callSendMethod('CreateToken', correctAelfAddress, {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('status', 'success');
    });

    it('should handle send method calls with web3 contract', async () => {
      // Setup chain environment
      vi.mocked(isELFChain).mockReturnValue(false);
      vi.mocked(isTonChain).mockReturnValue(false);
      const txHash = '0x1234567';
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);
      vi.mocked(waitForTransactionReceiptByWagmi).mockResolvedValue({
        status: 'success',
        transactionHash: txHash,
      } as any);

      const contract = new ContractBasic({ ...mockERCProps, contractABI: [] } as any);

      const result = await contract.callSendMethod('crossChainCreateToken', '0xAccount', []);

      expect(result.transactionHash).toBe(txHash);
      expect(result.TransactionId).toBe(txHash);
    });
  });

  describe('callSendPromiseMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle send promise method calls with aelf contract', async () => {
      // Setup chain environment
      vi.mocked(isELFChain).mockReturnValue(true);

      const contract = new ContractBasic({
        ...mockAelfProps,
        aelfContract: {
          GetTransaction: vi.fn().mockResolvedValue({ result: 'data' }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.callSendPromiseMethod('GetTransaction', correctAelfAddress);

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('result', 'data');
    });

    it('should handle send promise method calls with portkey contract', async () => {
      const contract = new ContractBasic(mockPortkeyProps);

      await expect(contract.callSendPromiseMethod('CreateToken', correctAelfAddress)).rejects.toThrow(
        Error('Method not implemented.'),
      );
    });

    it('should handle send promise method calls with web3 contract', async () => {
      // Setup chain environment
      vi.mocked(isELFChain).mockReturnValue(false);
      vi.mocked(isTonChain).mockReturnValue(false);
      const txHash = '0x1234567';
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);

      const contract = new ContractBasic({ ...mockERCProps, contractABI: [] } as any);

      const result = await contract.callSendPromiseMethod('createToken', '0xAccount', []);

      expect(result).toBe(txHash);
    });
  });

  describe('encodedTx', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle encode method calls with aelf contract', async () => {
      // Setup chain environment
      vi.mocked(isELFChain).mockReturnValue(true);

      const contract = new ContractBasic({
        ...mockAelfProps,
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

      expect(getContractMethods).toHaveBeenCalled();
      expect(encodedTransfer).toHaveBeenCalled();
      expect(result).toEqual({ data: 'encodedData', inputType: 'inputType' });
    });
  });
});

describe('WB3ContractBasic Class', () => {
  const mockProps = {
    contractAddress: '0x123',
    chainId: 11155111 as ChainId,
    contractABI: [],
  } as any;

  describe('callViewMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle view method calls', async () => {
      const txHash = '0x1234567';
      vi.mocked(readContractByWagmi).mockResolvedValue(txHash);

      const contract = new WB3ContractBasic(mockProps);

      const result = await contract.callViewMethod('testMethod');

      expect(result).toBe(txHash);
    });

    it('should handle view method calls when there is no chainId', async () => {
      const txHash = '0x1234567';
      vi.mocked(readContractByWagmi).mockResolvedValue(txHash);

      const contract = new WB3ContractBasic({ ...mockProps, chainId: null });

      const result = await contract.callViewMethod('testMethod', ['param']);

      expect(result).toBe(txHash);
    });

    it('should return error if getBalance return error', async () => {
      vi.mocked(readContractByWagmi).mockRejectedValue('Failed to get balance');

      const contract = new WB3ContractBasic(mockProps);

      const result = await contract.callViewMethod('getBalance', ['param']);

      expect(result.error).toBe('Failed to get balance');
    });
  });

  describe('callSendMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      vi.mocked(ZERO.plus).mockImplementation((n: BigNumber.Value, base?: number) => {
        return new BigNumber(n, base);
      });
    });

    it('should handle send method and return result correctly', async () => {
      // Mock
      const txHash = '0x1234567';
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);
      vi.mocked(waitForTransactionReceiptByWagmi).mockResolvedValue({
        status: 'success',
        transactionHash: txHash,
      } as any);

      const contract = new WB3ContractBasic(mockProps);

      const result = await contract.callSendMethod('crossChainCreateToken', '0xAccount', [], {
        onMethod: 'receipt',
        gas: 10,
        nonce: 4567823,
      });

      expect(result.transactionHash).toBe(txHash);
      expect(result.TransactionId).toBe(txHash);
    });

    it('should console error if ZERO throw error', async () => {
      const contract = new WB3ContractBasic(mockProps);

      // Mock
      const txHash = '0x1234567';
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);
      vi.mocked(waitForTransactionReceiptByWagmi).mockResolvedValue({
        status: 'success',
        transactionHash: txHash,
      } as any);
      vi.mocked(ZERO.plus).mockImplementation(() => {
        throw 'ZERO throw error';
      });

      const result = await contract.callSendMethod('crossChainCreateToken', '0xAccount', undefined, {
        onMethod: 'confirmation',
      });

      expect(result.TransactionId).toEqual(txHash);
    });

    it('should return error if there is no chainId', async () => {
      const contract = new WB3ContractBasic({ ...mockProps, chainId: null });

      // Mock
      const txHash = '0x1234567';
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);
      vi.mocked(waitForTransactionReceiptByWagmi).mockResolvedValue({
        status: 'success',
        transactionHash: txHash,
      } as any);

      const result = await contract.callSendMethod('testMethod', '0xAccount');

      expect(result.TransactionId).toEqual(txHash);
    });

    it('should catch error if callSendMethod rejected', async () => {
      const contract = new WB3ContractBasic(mockProps);

      // Mock
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockRejectedValue('Failed');

      const result = await contract.callSendMethod('swapToken', '0xAccount', []);

      expect(result.error).toBe('Failed');
    });

    it('should return successful if getGasPriceByWagmi return undefined', async () => {
      const contract = new WB3ContractBasic(mockProps);

      // Mock
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(undefined as any);
      const txHash = '0x1234567';
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);

      const result = await contract.callSendMethod('swapToken', '0xAccount', [], { onMethod: 'receipt', value: 20 });

      expect(result.TransactionId).toEqual(txHash);
    });

    it('should handle send method errors', async () => {
      const contract = new WB3ContractBasic({ ...mockProps, chainId: null, contractAddress: '' });

      // Mock
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      const txHash = '0x1234567';
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);
      vi.mocked(waitForTransactionReceiptByWagmi).mockResolvedValue({ status: 'reverted' } as any);

      const result = await contract.callSendMethod('createToken', '0xAccount');

      expect(result.error).toEqual({ message: 'Transaction is reverted', status: 'reverted' });
    });
  });

  describe('callSendPromiseMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle createToken and return successfully', async () => {
      const contract = new WB3ContractBasic(mockProps);

      // Mock
      const txHash = '0x1234567';
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);

      const result = await contract.callSendPromiseMethod('createToken', '0xAccount', [], {
        gasPrice: '10',
        gas: 20,
        value: '12',
        nonce: 123,
        onMethod: 'transactionHash',
      });

      expect(result).toBe(txHash);
    });

    it('should handle createToken and return successfully if no paramsOption', async () => {
      const contract = new WB3ContractBasic(mockProps);

      // Mock
      const txHash = '0x1234567';
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);

      const result = await contract.callSendPromiseMethod('createToken', '0xAccount');

      expect(result).toBe(txHash);
    });

    it('should catch error if callSendPromiseMethod throw error', async () => {
      const contract = new WB3ContractBasic(mockProps);

      // Mock
      const error = 'Failed to create receipt';
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockRejectedValue(error);

      const result = await contract.callSendPromiseMethod('createReceipt', '0xAccount');

      expect(result.error).toBe('Failed to create receipt');
    });

    it('should return error if there is no chainId', async () => {
      const contract = new WB3ContractBasic({ ...mockProps, chainId: null });

      // Mock
      const txHash = '0x1234567';
      vi.mocked(getGasPriceByWagmi).mockResolvedValue(BigInt(1234));
      vi.mocked(writeContractByWagmi).mockResolvedValue(txHash);

      const result = await contract.callSendPromiseMethod('testMethod', '0xAccount');

      expect(result).toEqual(txHash);
    });
  });
});

describe('AElfContractBasic Class', () => {
  const mockProps = {
    contractAddress: 'ELF_ADDRESS',
    chainId: 999 as ChainId,
  } as any;

  describe('getFileDescriptorsSet', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should set methods', async () => {
      // Mock contract
      const contract = new AElfContractBasic(mockProps);
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      await contract.getFileDescriptorsSet(AELFTestnetContractAddress);

      expect(contract.methods).toEqual({ GetBalance: {} });
    });

    it('should set methods error if getContractMethods rejected', async () => {
      const contract = new AElfContractBasic(mockProps);

      // Mock
      vi.mocked(getContractMethods).mockRejectedValueOnce('Failed to get GetBalance method');

      await expect(contract.getFileDescriptorsSet(AELFTestnetContractAddress)).rejects.toThrow(
        `"Failed to get GetBalance method"address:JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaEContract:getContractMethods`,
      );
    });
  });

  describe('checkMethods', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should check methods successfully if there is no method cache', async () => {
      // Mock contract
      const contract = new AElfContractBasic(mockProps);
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      await contract.checkMethods();

      expect(contract.methods).toEqual({ GetBalance: {} });
    });
  });

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

      expect(getContractMethods).toHaveBeenCalled();
      expect(getTxResult).toHaveBeenCalled();
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

      const result = await contract.callSendMethod('GetTransaction', {}, { onMethod: 'transactionHash' });

      expect(getContractMethods).toHaveBeenCalled();
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

      const result = await contract.callSendMethod('GetTransaction', {}, { onMethod: 'transactionHash' });

      expect(getContractMethods).toHaveBeenCalled();
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

      expect(getContractMethods).toHaveBeenCalled();
      expect(getTxResult).toHaveBeenCalled();
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

      expect(getContractMethods).toHaveBeenCalled();
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

      expect(getContractMethods).toHaveBeenCalled();
      expect(result.error).toEqual({
        message: 'Failed to get tx result',
        code: {
          message: {
            Message: 'Failed to get tx result',
          },
        },
      });
    });

    it('should return error if aelfContract[method] throw error and errorMessage', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          GetTransaction: vi.fn().mockResolvedValue({
            TransactionId: '',
            error: '500',
            errorMessage: { message: 'Failed to get tx result' },
          }),
        },
        aelfInstance: {},
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.callSendMethod('GetTransaction', {});

      expect(getContractMethods).toHaveBeenCalled();

      expect(result.error).toEqual({ code: '500', message: 'Failed to get tx result' });
    });
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

      expect(getContractMethods).toHaveBeenCalled();
      expect(encodedTransfer).toHaveBeenCalled();
      expect(result).toEqual({ data: 'encodedData', inputType: 'inputType' });
    });

    it('should return error if there is no aelfContract', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.encodedTx('GetTransaction', {});

      expect(getContractMethods).toHaveBeenCalled();
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

      expect(getContractMethods).toHaveBeenCalled();
      expect(encodedTransfer).toHaveBeenCalled();
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
          GetTransaction: vi.fn().mockResolvedValue({ result: 'data' }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.callSendPromiseMethod('GetTransaction', {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('result', 'data');
    });

    it('should handle callSendPromiseMethod method error', async () => {
      const contract = new AElfContractBasic({
        ...mockProps,
        aelfContract: {
          SendTransaction: vi.fn().mockImplementation(() => {
            throw 'Failed send tx';
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ SendTransaction: {} });

      const result = await contract.callSendPromiseMethod('SendTransaction', {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('error', 'Failed send tx');
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

  describe('getFileDescriptorsSet', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should set methods', async () => {
      // Mock contract
      const contract = new PortkeyContractBasic({ ...mockProps, portkeyChain: { getContract: vi.fn() } });
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      await contract.getFileDescriptorsSet(AELFTestnetContractAddress);

      expect(contract.methods).toEqual({ GetBalance: {} });
    });

    it('should set methods error if getContractMethods rejected', async () => {
      const contract = new PortkeyContractBasic({ ...mockProps, portkeyChain: { getContract: vi.fn() } });

      // Mock
      vi.mocked(getContractMethods).mockRejectedValueOnce('Failed to get GetBalance method');

      await expect(contract.getFileDescriptorsSet(AELFTestnetContractAddress)).rejects.toThrow(
        `"Failed to get GetBalance method"address:JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaEContract:getContractMethods`,
      );
    });
  });

  describe('checkMethods', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should check methods successfully if there is no method cache', async () => {
      // Mock contract
      const contract = new PortkeyContractBasic(mockProps);
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      await contract.checkMethods();

      expect(contract.methods).toEqual({ GetBalance: {} });
    });
  });

  describe('callViewMethod', () => {
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
            callViewMethod: vi.fn().mockResolvedValue({ balance: '1000' }),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance');

      expect(result).toHaveProperty('balance', '1000');
    });

    it('should handle portkey view methods if callViewMethod return data', async () => {
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callViewMethod: vi.fn().mockResolvedValue({ data: { balance: '1000' } }),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance');

      expect(result).toHaveProperty('balance', '1000');
    });

    it('should handle portkey view methods if callViewMethod return data', async () => {
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callViewMethod: vi.fn().mockResolvedValue({ error: 'Failed to get balance' }),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance');

      expect(result).toHaveProperty('error', 'Failed to get balance');
    });

    it('should handle portkey view methods if callViewMethod rejected', async () => {
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callViewMethod: vi.fn().mockRejectedValue('Failed to get balance'),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance');

      expect(result).toHaveProperty('error', 'Failed to get balance');
    });
  });

  describe('callSendMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle callSendMethod method', async () => {
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callSendMethod: vi.fn().mockResolvedValue({ status: 'success' }),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ CreateToken: {}, GetWalletInfo: {} });

      const result = await contract.callSendMethod('CreateToken', {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('status', 'success');
    });

    it('should handle callSendMethod method if callSendMethod return data', async () => {
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callSendMethod: vi.fn().mockResolvedValue({ data: { status: 'success' } }),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ CreateToken: {}, GetWalletInfo: {} });

      const result = await contract.callSendMethod('CreateToken', {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('status', 'success');
    });

    it('should return error if there is no contract', async () => {
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn(),
        },
      });

      const result = await contract.callSendMethod('CreateToken', {});

      expect(result).toHaveProperty('error', { code: 401, message: 'Contract init error2' });
    });

    it('should return error if callSendMethod return string error', async () => {
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callSendMethod: vi.fn().mockResolvedValue({ error: 'Failed' }),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ CreateToken: {}, GetWalletInfo: {} });

      const result = await contract.callSendMethod('CreateToken', {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('error', 'Failed');
    });

    it('should return error if callSendMethod return error.message', async () => {
      const error = { message: 'Failed to create token' };
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callSendMethod: vi.fn().mockRejectedValue(error),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ CreateToken: {} });

      const result = await contract.callSendMethod('CreateToken', {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('error', error);
    });

    it('should return error if callSendMethod return error.Error', async () => {
      const errorMessage = 'Failed to create token';
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callSendMethod: vi.fn().mockRejectedValue({ Error: errorMessage }),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ CreateToken: {} });

      const result = await contract.callSendMethod('CreateToken', {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('error', { message: errorMessage });
    });

    it('should return error if callSendMethod return error.Status', async () => {
      const errorMessage = 'Failed to create token';
      const contract = new PortkeyContractBasic({
        ...mockProps,
        portkeyChain: {
          getContract: vi.fn().mockReturnValue({
            callSendMethod: vi.fn().mockRejectedValue({ Status: errorMessage }),
          }),
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ CreateToken: {} });

      const result = await contract.callSendMethod('CreateToken', {});

      expect(getContractMethods).toHaveBeenCalled();
      expect(result).toHaveProperty('error', { message: errorMessage });
    });
  });

  describe('callSendPromiseMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle callSendPromiseMethod method', async () => {
      const contract = new PortkeyContractBasic(mockProps);

      await expect(contract.callSendPromiseMethod('CreateToken', correctAelfAddress)).rejects.toThrow(
        Error('Method not implemented.'),
      );
    });
  });
});

describe('PortkeySDKContractBasic', () => {
  const mockProps = {
    contractAddress: AELFTestnetContractAddress,
    chainId: 'AELF' as ChainId,
  } as any;

  describe('initialize', () => {
    it('initialization class successful', () => {
      const contract = new PortkeySDKContractBasic(mockProps);

      expect(contract.contractType).toBe('ELF');
    });
  });

  describe('getFileDescriptorsSet', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should set methods', async () => {
      // Mock contract
      const contract = new PortkeySDKContractBasic(mockProps);
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      await contract.getFileDescriptorsSet(AELFTestnetContractAddress);

      expect(contract.methods).toEqual({ GetBalance: {} });
    });

    it('should set methods error if getContractMethods rejected', async () => {
      const contract = new PortkeySDKContractBasic(mockProps);

      // Mock
      vi.mocked(getContractMethods).mockRejectedValueOnce('Failed to get GetBalance method');

      await expect(contract.getFileDescriptorsSet(AELFTestnetContractAddress)).rejects.toThrow(
        `"Failed to get GetBalance method"address:JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaEContract:getContractMethods`,
      );
    });
  });

  describe('checkMethods', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should check methods successfully if there is no method cache', async () => {
      // Mock contract
      const contract = new PortkeySDKContractBasic(mockProps);
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      await contract.checkMethods();

      expect(contract.methods).toEqual({ GetBalance: {} });
    });
  });

  describe('callViewMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should catch error if there is no contract method', async () => {
      // Mock contract
      const contract = new PortkeySDKContractBasic({ ...mockProps, aelfContract: vi.fn() });
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
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        viewContract: {
          GetBalance: {
            call: vi.fn().mockResolvedValue({ balance: '1000' }),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance');

      expect(result).toHaveProperty('balance', '1000');
    });

    it('should handle portkey view methods if callViewMethod return data', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        viewContract: {
          GetBalance: {
            call: vi.fn().mockResolvedValue({ result: { balance: '1000' } }),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance');

      expect(getContractMethods).toHaveBeenCalled();

      expect(result).toHaveProperty('balance', '1000');
    });

    it('should handle portkey view methods if callViewMethod return data', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        viewContract: {
          GetBalance: {
            call: vi.fn().mockResolvedValue({ error: 'Failed to get balance' }),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance');

      expect(result).toHaveProperty('error', 'Failed to get balance');
    });

    it('should handle portkey view methods if callViewMethod rejected', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        viewContract: {
          GetBalance: {
            call: vi.fn().mockRejectedValue('Failed to get balance'),
          },
        },
      });

      // Mock
      vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

      const result = await contract.callViewMethod('GetBalance');

      expect(result).toHaveProperty('error', 'Failed to get balance');
    });
  });

  describe('callSendMethod', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle send method transaction flow and return tx id', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        sdkContract: {
          callSendMethod: vi.fn().mockResolvedValue({ TransactionId: 'mockId' }),
        },
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.callSendMethod('GetTransaction', correctAelfAddress, {});

      expect(getContractMethods).toHaveBeenCalled();

      expect(result.TransactionId).toBe('mockId');
    });

    it('should handle send method transaction flow and return tx id', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        sdkContract: {
          callSendMethod: vi.fn().mockResolvedValue({ error: 'Failed' }),
        },
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.callSendMethod('GetTransaction', correctAelfAddress, {});

      expect(getContractMethods).toHaveBeenCalled();

      expect(result.error).toBe('Failed');
    });

    it('should return error if callSendMethod return error.Error', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        sdkContract: {
          callSendMethod: vi.fn().mockRejectedValue({ Error: 'Failed' }),
        },
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.callSendMethod('GetTransaction', correctAelfAddress, {});

      expect(getContractMethods).toHaveBeenCalled();

      expect(result.error.message).toBe('Failed');
    });

    it('should return error if callSendMethod return error.Status', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        sdkContract: {
          callSendMethod: vi.fn().mockRejectedValue({ Status: 'Failed' }),
        },
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.callSendMethod('GetTransaction', correctAelfAddress, {});

      expect(getContractMethods).toHaveBeenCalled();

      expect(result.error.message).toBe('Failed');
    });

    it('should return error if callSendMethod return error.message', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        sdkContract: {
          callSendMethod: vi.fn().mockRejectedValue({ message: 'Failed' }),
        },
      });

      vi.mocked(getContractMethods).mockResolvedValue({ GetTransaction: {} });

      const result = await contract.callSendMethod('GetTransaction', correctAelfAddress, {});

      expect(getContractMethods).toHaveBeenCalled();

      expect(result.error.message).toBe('Failed');
    });

    it('should throw error if there is no sdkContract', async () => {
      const contract = new PortkeySDKContractBasic(mockProps);

      const result = await contract.callSendMethod('GetTransaction', correctAelfAddress, {});

      expect(result.error).toEqual({ code: 401, message: 'Contract init error2' });
    });

    it('should handle send approve method return successfully', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        caContract: {
          callSendMethod: vi.fn().mockResolvedValue({ result: 'success' }),
        },
        portkeyWallet: {
          extraInfo: {
            portkeyInfo: {
              caInfo: {
                caHash: 'mockCaHash',
              },
              chainId: 'AELF',
            },
          },
        },
      });

      // Mock managerApprove
      vi.mocked(PortkeyDid.managerApprove).mockResolvedValue({ amount: '1000', guardiansApproved: [], symbol: 'ELF' });

      const result = await contract.callSendMethod('approve', correctAelfAddress, {});

      expect(PortkeyDid.managerApprove).toHaveBeenCalled();

      expect(result.result).toBe('success');
    });

    it('should return error when called approve method and callSendMethod return error', async () => {
      const contract = new PortkeySDKContractBasic({
        ...mockProps,
        caContract: {
          callSendMethod: vi.fn().mockResolvedValue({ error: 'Failed to approve' }),
        },
      });

      // Mock managerApprove
      vi.mocked(PortkeyDid.managerApprove).mockResolvedValue({ amount: '1000', guardiansApproved: [], symbol: 'ELF' });

      const result = await contract.callSendMethod('approve', correctAelfAddress, {});

      expect(PortkeyDid.managerApprove).toHaveBeenCalled();

      expect(result.error).toBe('Failed to approve');
    });

    it('should throw error if called approve method and there is no sdkContract', async () => {
      const contract = new PortkeySDKContractBasic(mockProps);

      const result = await contract.callSendMethod('approve', correctAelfAddress, {});

      expect(result.error).toEqual({ code: 401, message: 'Contract init error2' });
    });
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle invalid chain IDs', () => {
    // Setup chain environment
    vi.mocked(isELFChain).mockReturnValue(false);

    vi.mocked(getContractMethods).mockResolvedValue({ GetBalance: {} });

    const contract = new ContractBasic({ contractAddress: '0x123', chainId: 11155111 as ChainId });

    expect(contract.contractType).toBe('ERC');
  });

  it('should handle empty contract addresses', () => {
    const contract = new WB3ContractBasic({ ...mockERCProps, contractAddress: '' });
    expect(contract.address).toBe('');
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
