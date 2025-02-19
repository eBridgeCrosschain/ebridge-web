/* eslint-disable @typescript-eslint/no-empty-function */
import { afterEach, beforeEach, describe, it, expect, Mock } from 'vitest';
import {
  approveELF,
  checkElfAllowanceAndApprove,
  encodedTransfer,
  encodeTransaction,
  getAElf,
  getBlockHeight,
  getContractFileDescriptorSet,
  getSerializedDataFromLog,
  getServicesFromFileDescriptors,
  getTxResult,
  getWallet,
  messageHTML,
  MessageTxToExplore,
  uint8ArrayToHex,
  getContractMethods,
  initContracts,
} from 'utils/aelfUtils';
import { ChainId } from 'types';
import { isMobileDevices } from '../isMobile';
import { getExploreLink } from 'utils';
import { message } from 'antd';
import { timesDecimals } from '../calculate';
import BigNumber from 'bignumber.js';
import AElf from 'aelf-sdk';
import descriptor from '@aelfqueen/protobufjs/ext/descriptor';
import storages from 'constants/storages';
import { baseRequest } from 'api';

// Mock localStorage
export const localStorageMock = (() => {
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

// Attach the mock to the global window object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

vi.mock('utils', async (importOriginal) => {
  const originalModule: any = await importOriginal();

  return {
    ...originalModule,
    getExploreLink: vi.fn(),
    shortenString: vi.fn(),
    sleep: vi.fn(),
  };
});

vi.mock('../calculate', async (importOriginal) => {
  const originalModule: any = await importOriginal();

  return {
    ...originalModule,
    timesDecimals: vi.fn(),
  };
});

// Mock AElf class and providers.HttpProvider
vi.mock('aelf-sdk', async () => {
  const HttpProviderMock = vi.fn().mockImplementation((rpc) => ({
    rpc: rpc,
  }));

  const AElfMock: any = vi.fn().mockImplementation((provider) => ({
    provider: provider,
    chain: {
      getTxResult: vi.fn(),
      getBlockHeight: vi.fn(),
    },
    pbUtils: {
      getSerializedDataFromLog: vi.fn(),
      encodeTransaction: vi.fn(),
    },
    utils: {
      uint8ArrayToHex: vi.fn(),
      transform: {
        transformMapToArray: vi.fn(),
        transform: vi.fn(),
      },
    },
    pbjs: {
      Root: {
        fromDescriptor: vi.fn(),
      },
    },
  }));

  AElfMock.providers = {
    HttpProvider: HttpProviderMock,
  };

  AElfMock.wallet = {
    createNewWallet: vi.fn().mockImplementation(() => {
      return { address: managerAddress };
    }),
  };

  AElfMock.chain = {
    getTxResult: vi.fn(),
    getBlockHeight: vi.fn(),
  };

  AElfMock.pbUtils = {
    getSerializedDataFromLog: vi.fn(),
    encodeTransaction: vi.fn(),
  };

  AElfMock.utils = {
    uint8ArrayToHex: vi.fn(),
    transform: {
      transformMapToArray: vi.fn(),
      transform: vi.fn(),
    },
  };

  AElfMock.pbjs = {
    Root: {
      fromDescriptor: vi.fn(),
    },
  };

  return {
    default: AElfMock,
  };
});

vi.mock('@aelfqueen/protobufjs/ext/descriptor', () => {
  return {
    default: {
      FileDescriptorSet: {
        decode: vi.fn(),
      },
    },
  };
});

vi.mock('api', () => {
  return {
    baseRequest: vi.fn(),
  };
});

vi.mock('../isMobile', () => ({
  isMobileDevices: vi.fn(),
}));

// Mock the message component
vi.mock('antd', async () => {
  const antd = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...antd,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      loading: vi.fn(),
      destroy: vi.fn(),
    },
  };
});

vi.mock('components/CommonMessage', () => {
  return {
    default: {
      error: vi.fn(),
    },
  };
});

const managerAddress = '7iC6EQtt4rKsqv9vFiwpUDvZVipSoKwvPLy7pRG189qJjyVT7';

describe('getWallet', () => {
  it('should return wallet info', () => {
    const result = getWallet();

    expect(result).toHaveProperty('address', managerAddress);
  });
});

const TransactionId = 'b40236195c71dd207753a336ed0fd2da1263a9ba527457422a6c9608dee9e775';
const successTxHash = TransactionId;
const errorTxHash = 'b40236195c71dd207753a336ed0fd';
const mainChainSuccessExploreUrl = `https://testnet.aelfscan.io/AELF/tx/${successTxHash}`;
const mainChainErrorExploreUrl = `https://testnet.aelfscan.io/AELF/tx/${errorTxHash}`;
const chainId = 'AELF' as ChainId;

describe('Message Utility Functions ', () => {
  describe('messageHTML', () => {
    afterEach(() => {
      // Clean up all messages after each test
      message.destroy();
      vi.clearAllMocks();
    });

    it('should call message.success correctly if type is success', () => {
      // Mock isMobileDevices and getExploreLink method
      (isMobileDevices as Mock).mockReturnValue(true);
      (getExploreLink as Mock).mockReturnValue(mainChainSuccessExploreUrl);

      const transactionMessage = 'Transaction success';

      messageHTML(successTxHash, 'success', transactionMessage);

      expect(isMobileDevices).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalled();
    });

    it('should call message.error correctly if type is error', () => {
      // Mock isMobileDevices and getExploreLink method
      (isMobileDevices as Mock).mockReturnValue(false);
      (getExploreLink as Mock).mockReturnValue(mainChainErrorExploreUrl);

      const transactionMessage = 'AElf.Sdk.CSharp.AssertionException: Transaction failed';

      messageHTML(errorTxHash, 'error', transactionMessage);

      expect(isMobileDevices).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalled();
    });

    it('should call message.warning correctly if txHash is empty string', () => {
      // Mock isMobileDevices and getExploreLink method
      (isMobileDevices as Mock).mockReturnValue(false);
      (getExploreLink as Mock).mockReturnValue(mainChainErrorExploreUrl);

      const transactionMessage = 'AElf.Sdk.CSharp.AssertionException: Not find transaction hash';

      messageHTML('', 'warning', transactionMessage);

      expect(isMobileDevices).toHaveBeenCalled();
      expect(message.warning).toHaveBeenCalled();
    });
  });

  describe('MessageTxToExplore', () => {
    afterEach(() => {
      // Clean up all messages after each test
      message.destroy();

      // Clear mocks before each test
      vi.clearAllMocks();
    });

    it('should call message.success when getTxResult succeeds', async () => {
      const status = 'mined';
      const txResult = { Status: status, TransactionId: successTxHash };

      // Modify the mock implementation of AElf.chain.getTxResult
      const aelfInstance = getAElf(chainId);
      aelfInstance.chain.getTxResult.mockImplementation(async () => {
        return txResult;
      });

      // Mock isMobileDevices and getExploreLink method
      (isMobileDevices as Mock).mockReturnValue(true);
      (getExploreLink as Mock).mockReturnValue(mainChainSuccessExploreUrl);

      await MessageTxToExplore(chainId, successTxHash, 'success');

      expect(message.success).toHaveBeenCalled();
    });

    it('should call message.error when getTxResult throws error', async () => {
      // Modify the mock implementation of AElf.chain.getTxResult
      const errorMessage = 'Transaction failed';
      const aelfInstance = getAElf(chainId);
      aelfInstance.chain.getTxResult.mockImplementation(async (txId: string) => {
        return {
          txId,
          status: 'failed',
          error: '500',
          errorMessage: {
            message: {
              error: errorMessage,
              TransactionId: successTxHash,
            },
          },
        };
      });

      // Mock isMobileDevices and getExploreLink method
      (isMobileDevices as Mock).mockReturnValue(false);
      (getExploreLink as Mock).mockReturnValue(mainChainErrorExploreUrl);

      await MessageTxToExplore(chainId, errorTxHash, 'error');

      expect(message.error).toHaveBeenCalled();
    });

    it('should call message.error when getTxResult throws undefined error', async () => {
      // Modify the mock implementation of AElf.chain.getTxResult
      const aelfInstance = getAElf(chainId);
      aelfInstance.chain.getTxResult.mockImplementation(async (txId: string) => {
        return {
          txId,
          status: 'failed',
          error: '500',
          errorMessage: {
            message: undefined,
          },
        };
      });

      // Mock isMobileDevices and getExploreLink method
      (isMobileDevices as Mock).mockReturnValue(false);
      (getExploreLink as Mock).mockReturnValue(mainChainErrorExploreUrl);

      await MessageTxToExplore(chainId, errorTxHash, 'error');

      expect(message.error).toHaveBeenCalled();
    });
  });
});

describe('approveELF', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test

    // Modify the mock implementation of AElf.chain.getTxResult
    const status = 'mined';
    const txResult = { Status: status, TransactionId: successTxHash };
    const aelfInstance = getAElf(chainId);
    aelfInstance.chain.getTxResult.mockImplementation(async () => {
      return txResult;
    });

    // Mock isMobileDevices and getExploreLink method
    (isMobileDevices as Mock).mockReturnValue(true);
    (getExploreLink as Mock).mockReturnValue(mainChainSuccessExploreUrl);
  });

  it('should return true when approve succeeds', async () => {
    const mockTokenContract = { callSendMethod: vi.fn().mockResolvedValue(TransactionId) } as any;

    const result = await approveELF('address', mockTokenContract, 'ELF', '100', chainId);

    expect(result).toBe(true);
    expect(message.success).toHaveBeenCalled();
  });

  it('should return true when approve succeeds with result.TransactionId property', async () => {
    const mockTokenContract = { callSendMethod: vi.fn().mockResolvedValue({ result: TransactionId }) } as any;

    // Mock isMobileDevices and getExploreLink method
    (isMobileDevices as Mock).mockReturnValue(true);
    (getExploreLink as Mock).mockReturnValue(mainChainSuccessExploreUrl);

    const result = await approveELF('address', mockTokenContract, 'ELF', '100', chainId);

    expect(result).toBe(true);
    expect(message.success).toHaveBeenCalled();
  });

  it('should return false when approve failed with error.message property', async () => {
    const mockTokenContract = {
      callSendMethod: vi.fn().mockResolvedValue({ error: { message: 'Approve Failed' } }),
    } as any;

    const result = await approveELF('address', mockTokenContract, 'ELF', '100', chainId);

    expect(result).toBe(false);
  });

  it('should return false when approve failed with errorMessage.message property', async () => {
    const mockTokenContract = {
      callSendMethod: vi.fn().mockResolvedValue({ error: '500', errorMessage: { message: 'Approve Failed' } }),
    } as any;

    const result = await approveELF('address', mockTokenContract, 'ELF', '100', chainId);

    expect(result).toBe(false);
  });

  it('should return false when approve failed with errorMessage property', async () => {
    const mockTokenContract = {
      callSendMethod: vi.fn().mockResolvedValue({ error: '500', errorMessage: 'Approve Failed' }),
    } as any;

    const result = await approveELF('address', mockTokenContract, 'ELF', '100', chainId);

    expect(result).toBe(false);
  });
});

describe('checkElfAllowanceAndApprove', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test

    // Modify the mock implementation of AElf.chain.getTxResult
    const status = 'mined';
    const txResult = { Status: status, TransactionId: successTxHash };
    const aelfInstance = getAElf(chainId);
    aelfInstance.chain.getTxResult.mockImplementation(async () => {
      return txResult;
    });

    // Mock isMobileDevices and getExploreLink method
    (isMobileDevices as Mock).mockReturnValue(true);
    (getExploreLink as Mock).mockReturnValue(mainChainSuccessExploreUrl);
  });

  it('should check allowance and approve successfully', async () => {
    const mockTokenContract = {
      callSendMethod: vi.fn().mockResolvedValue(TransactionId),
      callViewMethod: vi.fn().mockResolvedValue({ allowance: '100' }),
    } as any;

    (timesDecimals as Mock).mockReturnValue(new BigNumber(1000));

    const result = await checkElfAllowanceAndApprove(
      mockTokenContract,
      'ELF',
      'address',
      'approveTargetAddress',
      '100',
      chainId,
    );

    expect(result).toBe(true);
  });

  it('should check allowance and approve successfully if allowance is lt amount', async () => {
    const mockTokenContract = {
      callSendMethod: vi.fn().mockResolvedValue(TransactionId),
      callViewMethod: vi.fn().mockResolvedValue({ allowance: '10' }),
    } as any;

    (timesDecimals as Mock).mockReturnValue(new BigNumber(1));

    const result = await checkElfAllowanceAndApprove(
      mockTokenContract,
      'ELF',
      'address',
      'approveTargetAddress',
      '100',
      chainId,
    );

    expect(result).toBe(true);
  });

  it('should return false when GetAllowance failed with error.message property', async () => {
    const mockTokenContract = {
      callSendMethod: vi.fn().mockResolvedValue({ error: { message: 'Approve Failed' } }),
      callViewMethod: vi.fn().mockResolvedValue({ error: { message: 'GetAllowance Failed' } }),
    } as any;

    const result = await checkElfAllowanceAndApprove(
      mockTokenContract,
      'ELF',
      'address',
      'approveTargetAddress',
      '100',
      chainId,
    );

    expect(result).toBe(false);
  });

  it('should return false when GetAllowance failed with errorMessage.message property', async () => {
    const mockTokenContract = {
      callSendMethod: vi.fn().mockResolvedValue({ error: '500', errorMessage: { message: 'Approve failed' } }),
      callViewMethod: vi.fn().mockResolvedValue({ error: '500', errorMessage: { message: 'GetAllowance Failed' } }),
    } as any;

    const result = await checkElfAllowanceAndApprove(
      mockTokenContract,
      'ELF',
      'address',
      'approveTargetAddress',
      '100',
      chainId,
    );

    expect(result).toBe(false);
  });

  it('should return false when GetAllowance failed with errorMessage property', async () => {
    const mockTokenContract = {
      callSendMethod: vi.fn().mockResolvedValue({ error: '500', errorMessage: 'Approve failed' }),
      callViewMethod: vi.fn().mockResolvedValue({ error: '500', errorMessage: 'GetAllowance Failed' }),
    } as any;

    const result = await checkElfAllowanceAndApprove(
      mockTokenContract,
      'ELF',
      'address',
      'approveTargetAddress',
      '100',
      chainId,
    );

    expect(result).toBe(false);
  });
});

describe('getBlockHeight', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('should return block height', async () => {
    const aelfInstance = getAElf(chainId);
    const mockResult = {
      BlockHeight: 12345,
    };
    aelfInstance.chain.getBlockHeight.mockReturnValue(mockResult);

    const result = await getBlockHeight(chainId);

    expect(result).toEqual(mockResult);
  });
});

describe('getSerializedDataFromLog', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('should return serialized data', () => {
    // Mock AElf.pbUtils.getSerializedDataFromLog
    AElf.pbUtils.getSerializedDataFromLog.mockImplementation((log: any) => {
      return {
        data: log,
      };
    });

    const result = getSerializedDataFromLog(chainId);

    expect(result).toEqual({ data: 'AELF' });
  });
});

describe('getTxResult', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('if getAElf.chain.getTxResult return error, throw error', async () => {
    // Modify the mock implementation of AElf.chain.getTxResult
    const errorMessage = 'Transaction failed';
    const aelfInstance = getAElf(chainId);
    aelfInstance.chain.getTxResult.mockImplementationOnce(async (txId: string) => {
      return {
        txId,
        status: 'failed',
        error: '500',
        errorMessage: {
          message: errorMessage,
        },
      };
    });

    aelfInstance.chain.getTxResult.mockImplementationOnce(async (txId: string) => {
      return {
        txId,
        status: 'failed',
        error: '500',
        errorMessage: {
          Message: errorMessage,
        },
      };
    });

    // The first call reports an error message from errorMessage.message.
    await expect(getTxResult(chainId, TransactionId)).rejects.toThrow('Transaction failed');

    // The second call reports an error message from errorMessage.Message.
    await expect(getTxResult(chainId, TransactionId)).rejects.toThrow('Transaction failed');
  });

  it('if getAElf.chain.getTxResult return empty string, throw error', async () => {
    // Modify the mock implementation of AElf.chain.getTxResult
    const aelfInstance = getAElf(chainId);
    aelfInstance.chain.getTxResult.mockImplementation(async () => {
      return '';
    });

    await expect(getTxResult(chainId, TransactionId)).rejects.toThrow(`Can not get transaction result.`);
  });

  it('if status is NotExisted, throw error', async () => {
    const status = 'NotExisted';

    // Modify the mock implementation of AElf.chain.getTxResult
    const aelfInstance = getAElf(chainId);
    aelfInstance.chain.getTxResult.mockImplementation(async () => {
      return { Status: status };
    });

    const result = await getTxResult(chainId, TransactionId);

    expect(result).toEqual({ Status: status });
  });

  it('if status is always pending, throw error', async () => {
    const status = 'pending';

    // Modify the mock implementation of AElf.chain.getTxResult
    const aelfInstance = getAElf(chainId);
    aelfInstance.chain.getTxResult.mockImplementation(async () => {
      return { Status: status };
    });

    const result = await getTxResult(chainId, TransactionId);

    expect(result).toEqual({ Status: status });
  });

  it('if status is always pending_validation, throw error', async () => {
    const status = 'pending_validation';

    // Modify the mock implementation of AElf.chain.getTxResult
    const aelfInstance = getAElf(chainId);
    aelfInstance.chain.getTxResult.mockImplementation(async () => {
      return { Status: status };
    });

    const result = await getTxResult(chainId, TransactionId);

    expect(result).toEqual({ Status: status });
  });

  it('if status is mined, return correct tx result', async () => {
    const status = 'mined';
    const txResult = { Status: status };

    // Modify the mock implementation of AElf.chain.getTxResult
    const aelfInstance = getAElf(chainId);
    aelfInstance.chain.getTxResult.mockImplementation(async () => {
      return txResult;
    });

    const result = await getTxResult(chainId, TransactionId);

    expect(result).toEqual(txResult);
  });

  it('if status is unknown, throw error', async () => {
    const status = 'unknown';
    const txResult = { Status: status };

    // Modify the mock implementation of AElf.chain.getTxResult
    const aelfInstance = getAElf(chainId);
    aelfInstance.chain.getTxResult.mockImplementation(async () => {
      return txResult;
    });

    await expect(getTxResult(chainId, TransactionId)).rejects.toThrow(`Transaction: ${status}`);
  });
});

describe('encodedTransfer', () => {
  const correctAelfAddress = 'ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_AELF';

  const mockEncodeValue = 'mockEncodeValue';

  it('should return correct encoded transaction', () => {
    (AElf.utils.transform.transformMapToArray as Mock).mockReturnValue({
      name: 'mockTransformMapToArray',
    });
    (AElf.utils.transform.transform as Mock).mockImplementation(() => {
      return '';
    });

    const result = encodedTransfer({
      params: { symbol: 'ELF', to: correctAelfAddress, amount: '10', memo: '' },
      inputType: {
        fromObject: vi.fn().mockReturnValue('mockFromObject'),
        encode: vi.fn().mockImplementation(() => {
          return {
            finish: vi.fn().mockReturnValue(mockEncodeValue),
          };
        }),
      },
    });

    expect(result).toBe(mockEncodeValue);
  });
});

describe('encodeTransaction', () => {
  it('should return correct encoded transaction', () => {
    // Mock AElf.pbUtils.encodeTransaction
    AElf.pbUtils.encodeTransaction.mockReturnValue('1234');

    const result = encodeTransaction(TransactionId);

    expect(result).toEqual('1234');
  });
});

describe('uint8ArrayToHex', () => {
  it('should return correct encoded transaction', () => {
    const uint8Array = new Uint8Array([0, 1, 2, 3, 15, 16, 255]);
    const expectedHex = '000102030f10ff';

    // Mock AElf.utils.uint8ArrayToHex
    AElf.utils.uint8ArrayToHex.mockReturnValue(expectedHex);

    const result = uint8ArrayToHex(uint8Array);

    expect(result).toEqual(expectedHex);
  });
});

describe('getContractFileDescriptorSet', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('should return contract file descriptor set if with storage', async () => {
    // set localStorage
    const key = storages.contractsFileDescriptorBase64 + chainId;
    localStorageMock.setItem(key, JSON.stringify({ address: 'mockAddress' }));

    // Mock descriptor.FileDescriptorSet.decode
    const mockedFileDescriptorSetDecodeResult = 'mockedFileDescriptorSetDecodeValue';
    (descriptor.FileDescriptorSet.decode as Mock).mockReturnValue(mockedFileDescriptorSetDecodeResult);

    const result = await getContractFileDescriptorSet(chainId, 'address');

    expect(result).toEqual(mockedFileDescriptorSetDecodeResult);
  });

  it('should return contract file descriptor set if without storage', async () => {
    // remove localStorage
    localStorageMock.removeItem(storages.contractsFileDescriptorBase64 + chainId);

    // Mock baseRequest and descriptor.FileDescriptorSet.decode
    (baseRequest as Mock).mockResolvedValue('mockAddress');
    (descriptor.FileDescriptorSet.decode as Mock).mockReturnValue('mockedFileDescriptorSetDecodeValue');

    const result = await getContractFileDescriptorSet(chainId, 'address1');

    expect(baseRequest).toHaveBeenCalled();
    expect(result).toEqual('mockedFileDescriptorSetDecodeValue');
  });

  it('should return contract file descriptor set if without storage and fetch failed', async () => {
    localStorageMock.removeItem(storages.contractsFileDescriptorBase64 + chainId);

    (baseRequest as Mock).mockRejectedValue('Fetch Failed');

    const result = await getContractFileDescriptorSet(chainId, 'address');

    expect(result).toBeUndefined();
  });

  it('should return undefined if localStorage cache error', async () => {
    // set localStorage
    const key = storages.contractsFileDescriptorBase64 + chainId;
    localStorageMock.setItem(key, JSON.stringify({ address: { error: 'error' } }));

    // Mock descriptor.FileDescriptorSet.decode
    const mockedFileDescriptorSetDecodeResult = 'mockedFileDescriptorSetDecodeValue';
    (descriptor.FileDescriptorSet.decode as Mock).mockReturnValue(mockedFileDescriptorSetDecodeResult);

    const result = await getContractFileDescriptorSet(chainId, 'address');

    expect(result).toBeUndefined();
  });
});

describe('getServicesFromFileDescriptors', () => {
  it('should return correct value if input has not package date', async () => {
    // Mock AElf utils
    (AElf.pbjs.Root.fromDescriptor as Mock).mockImplementation(() => {
      return {
        resolveAll: vi.fn().mockReturnValue({
          lookupService: vi.fn().mockReturnValue('1234'),
        }),
      };
    });

    const result = await getServicesFromFileDescriptors({ file: [{ service: ['1', '2'] }] });

    expect(result).toEqual(['1234']);
  });

  it('should return correct value if input has package date', async () => {
    // Mock AElf utils
    (AElf.pbjs.Root.fromDescriptor as Mock).mockImplementation(() => {
      return {
        resolveAll: vi.fn().mockReturnValue({
          lookupService: vi.fn().mockReturnValue('service1'),
        }),
      };
    });

    const result = await getServicesFromFileDescriptors({
      file: [{ service: [{ name: 'service1' }], package: { service1: '' } }],
    });

    expect(result).toEqual(['service1']);
  });
});

describe('getContractMethods', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('should return correct value if input has package date', async () => {
    const tokenContractAddress = 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE';

    // set localStorage
    const key = storages.contractsFileDescriptorBase64 + chainId;
    localStorageMock.setItem(key, JSON.stringify({ [tokenContractAddress]: tokenContractAddress }));

    // Mock descriptor.FileDescriptorSet.decode to mock getContractFileDescriptorSet
    const mockedFileDescriptorSetDecodeResult = {
      file: [{ service: [{ name: 'service1' }], package: { service1: '' } }],
    };
    (descriptor.FileDescriptorSet.decode as Mock).mockReturnValue(mockedFileDescriptorSetDecodeResult);

    // Mock AElf utils to mock getServicesFromFileDescriptors
    (AElf.pbjs.Root.fromDescriptor as Mock).mockImplementation(() => {
      return {
        resolveAll: vi.fn().mockReturnValue({
          lookupService: vi.fn().mockReturnValue({
            1: 'services1',
            methods: [
              { resolve: vi.fn().mockReturnValue({ name: 'Transfer', resolvedRequestType: 'Transfer' }) },
              { resolve: vi.fn().mockReturnValue({ name: 'Approve', resolvedRequestType: 'Approve' }) },
            ],
          }),
        }),
      };
    });

    const result = await getContractMethods(chainId, tokenContractAddress);

    expect(result).toEqual({ Transfer: 'Transfer', Approve: 'Approve' });
  });
});

describe('initContracts', () => {
  const mockContracts = {
    contract1: 'address1',
    contract2: 'address2',
  };

  const mockAelfInstance = {
    chain: {
      contractAt: vi.fn(),
    },
  };

  const mockAccount = 'mock_account_address';

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockAelfInstance.chain.contractAt.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize contracts successfully without account', async () => {
    // Mock successful contract initialization
    mockAelfInstance.chain.contractAt
      .mockResolvedValueOnce({ address: 'address1' })
      .mockResolvedValueOnce({ address: 'address2' });

    const result = await initContracts(mockContracts, mockAelfInstance);

    // Verify the result
    expect(result).toEqual({
      address1: { address: 'address1' },
      address2: { address: 'address2' },
    });

    // Verify contractAt was called with the correct arguments
    expect(mockAelfInstance.chain.contractAt).toHaveBeenCalledWith('address1', {
      address: managerAddress,
    });
    expect(mockAelfInstance.chain.contractAt).toHaveBeenCalledWith('address2', {
      address: managerAddress,
    });
  });

  it('should initialize contracts successfully with account', async () => {
    // Mock successful contract initialization
    mockAelfInstance.chain.contractAt
      .mockResolvedValueOnce({ address: 'address1' })
      .mockResolvedValueOnce({ address: 'address2' });

    const result = await initContracts(mockContracts, mockAelfInstance, mockAccount);

    // Verify the result
    expect(result).toEqual({
      address1: { address: 'address1' },
      address2: { address: 'address2' },
    });

    // Verify contractAt was called with the correct arguments
    expect(mockAelfInstance.chain.contractAt).toHaveBeenCalledWith('address1', {
      address: mockAccount,
    });
    expect(mockAelfInstance.chain.contractAt).toHaveBeenCalledWith('address2', {
      address: mockAccount,
    });
  });

  it('should handle contract initialization failures', async () => {
    // Mock one successful and one failed contract initialization
    mockAelfInstance.chain.contractAt
      .mockResolvedValueOnce({ address: 'address1' })
      .mockRejectedValueOnce(new Error('Failed to initialize contract'));

    const result = await initContracts(mockContracts, mockAelfInstance);

    // Verify the result
    expect(result).toEqual({
      address1: { address: 'address1' },
      address2: undefined,
    });

    // Verify contractAt was called
    expect(mockAelfInstance.chain.contractAt).toHaveBeenCalledTimes(2);
  });

  it('should handle empty contracts object', async () => {
    const result = await initContracts({}, mockAelfInstance);

    // Verify the result
    expect(result).toEqual({});

    // Verify contractAt was not called
    expect(mockAelfInstance.chain.contractAt).not.toHaveBeenCalled();
  });

  it('should handle global error', async () => {
    // Mock global error
    mockAelfInstance.chain.contractAt.mockRejectedValue(new Error('Global error'));

    const result = await initContracts(mockContracts, mockAelfInstance);

    // Verify the result
    expect(result).toEqual({
      address1: undefined,
      address2: undefined,
    });

    // Verify contractAt was called
    expect(mockAelfInstance.chain.contractAt).toHaveBeenCalled();
  });

  it('should log errors when contract initialization fails', async () => {
    // Mock console.debug
    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    // Mock contract initialization failure
    mockAelfInstance.chain.contractAt.mockRejectedValue(new Error('Failed to initialize contract'));

    await initContracts(mockContracts, mockAelfInstance);

    // Verify console.debug was called
    expect(consoleDebugSpy).toHaveBeenCalledWith(expect.any(Error), mockAelfInstance, '=====contractAt');
  });

  it('should log global errors', async () => {
    // Mock Promise.all
    const promiseAllSpy = vi.spyOn(Promise, 'all').mockRejectedValue(new Error('Promise error'));

    // Mock console.log
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await initContracts(mockContracts, mockAelfInstance);

    // Verify Promise.all and console.log was called
    expect(promiseAllSpy).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error), 'initContracts');
  });
});
