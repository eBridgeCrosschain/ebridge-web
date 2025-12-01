/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import Web3 from 'web3';
import { REQ_CODE, MaxUint256 } from 'constants/misc';
import {
  checkErcApprove,
  checkAllowanceAndApprove,
  getContract,
  callERC20ViewMethod,
  createToken,
  createOfficialToken,
  getAllowance,
  getBalance,
  getTotalSupply,
} from 'contracts/ethereum';
import CommonMessage from 'components/CommonMessage';
import { ContractBasic } from 'utils/contract';
import { isUserDenied } from 'utils/provider';

// Mock dependencies
vi.mock('web3', async () => {
  const Web3Mock: any = vi.fn().mockImplementation(() => ({
    eth: {
      Contract: vi.fn(),
    },
    providers: {
      HttpProvider: vi.fn().mockImplementation((url: string) => ({
        url,
        options: { keepAlive: true, withCredentials: false, timeout: 20000 },
      })),
    },
  }));

  Web3Mock.eth = {
    Contract: vi.fn(),
  };
  Web3Mock.providers = {
    HttpProvider: vi.fn().mockImplementation((url: string) => ({
      url,
      options: { keepAlive: true, withCredentials: false, timeout: 20000 },
    })),
  };

  return {
    default: Web3Mock,
  };
});
vi.mock('web3-core');

// Define the controllable simulation object at the top of the file
const mockBehavior = {
  callViewMethod: vi.fn().mockResolvedValue({ error: { details: 'User denied transaction' } }),
  callSendMethod: vi.fn().mockResolvedValue({}),
};

vi.mock('utils/contract', () => {
  class MockContractBasic {
    callViewMethod = mockBehavior.callViewMethod;
    callSendMethod = mockBehavior.callSendMethod;
  }
  return { ContractBasic: MockContractBasic };
});

// vi.mock('utils/contract', () => {
//   // Mock ContractBasic
//   const error = { error: { details: 'User denied transaction' } };
//   class MockContractBasic {
//     callSendMethod = vi.fn().mockResolvedValue({});
//     callViewMethod = vi.fn().mockResolvedValueOnce(error);
//   }

//   return {
//     ContractBasic: MockContractBasic,
//   };
// });
vi.mock('utils/provider');
vi.mock('utils/error');
vi.mock('components/CommonMessage');

const mockProvider = {} as any;
const mockContract = {
  methods: {
    allowance: vi.fn().mockReturnThis(),
    balanceOf: vi.fn().mockReturnThis(),
    call: vi.fn(),
  },
} as any;

describe('checkErcApprove', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('should handle user denied error properly', async () => {
    // Mock console.log
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reassignment mockBehavior.callViewMethod
    mockBehavior.callViewMethod.mockResolvedValue({ error: { details: 'User denied transaction' } });
    mockBehavior.callSendMethod.mockResolvedValue({});

    vi.mocked(isUserDenied).mockReturnValue(true);

    const result = await checkErcApprove(1, '0x123', '0x456', '0x789', '0xabc');
    expect(CommonMessage.error).toHaveBeenCalledTimes(2);
    expect(result).toBe(REQ_CODE.UserDenied);
  });

  test('should handle Fail error properly', async () => {
    // Mock console.log
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reassignment mockBehavior.callViewMethod
    mockBehavior.callViewMethod.mockResolvedValue({ error: { details: 'User denied transaction' } });
    mockBehavior.callSendMethod.mockResolvedValue({});

    vi.mocked(isUserDenied).mockReturnValue(false);

    const result = await checkErcApprove(1, '0x123', '0x456', '0x789', '0xabc');
    expect(CommonMessage.error).toHaveBeenCalledTimes(2);
    expect(result).toBe(REQ_CODE.Fail);
  });

  test('should return success if approve is sufficient', async () => {
    // Mock console.log
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reassignment mockBehavior.callViewMethod
    mockBehavior.callViewMethod.mockResolvedValue({});
    mockBehavior.callSendMethod.mockResolvedValue({});

    vi.mocked(isUserDenied).mockReturnValue(false);

    const result = await checkErcApprove(1, '0x123', '0x456', '0x789', '0xabc');

    expect(result).toBe(REQ_CODE.Success);
  });
});

describe('getAllowance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const masterChefContract = { options: { address: '' } } as any;

  it('should return the allowance', async () => {
    const allowance = '100';
    const lpContract = {
      methods: {
        allowance: () => {
          return { call: vi.fn().mockResolvedValue(allowance) };
        },
      },
    } as any;

    const account = '0x123';

    const result = await getAllowance(lpContract, masterChefContract, account);

    expect(result).toBe(allowance);
  });

  it('should return "0" if an error occurs', async () => {
    const lpContract = {
      methods: {
        allowance: () => {
          return { call: vi.fn().mockRejectedValue(new Error('error')) };
        },
      },
    } as any;

    const account = '0x123';

    const result = await getAllowance(lpContract, masterChefContract, account);

    expect(result).toBe('0');
  });
});

describe('ERC20 Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Web3 as any).mockImplementation(() => ({
      eth: {
        Contract: vi.fn().mockReturnValue(mockContract),
      },
    }));
  });

  describe('getContract', () => {
    test('should create contract instance with correct parameters', () => {
      const contract = getContract(mockProvider, '0x123');
      expect(Web3).toHaveBeenCalledWith(mockProvider);
      expect(contract.methods).toBeDefined();
    });
  });

  describe('callERC20ViewMethod', () => {
    test('should call method with parameters when paramsOption exists', async () => {
      mockContract.methods.testMethod = vi.fn().mockReturnValueOnce({ call: vi.fn().mockResolvedValue('success') });
      const result = await callERC20ViewMethod('testMethod', mockProvider, '0x123', ['param1']);
      expect(result).toBe('success');
    });

    test('should return 0 on error', async () => {
      mockContract.methods.testMethod = vi.fn().mockReturnValueOnce({ call: vi.fn().mockRejectedValue(new Error()) });
      const result = await callERC20ViewMethod('testMethod', mockProvider, '0x123');
      expect(result).toBe('0');
    });
  });

  describe('getBalance', () => {
    test('should call method with parameters when paramsOption exists', async () => {
      mockContract.methods.balanceOf = vi.fn().mockReturnValueOnce({ call: vi.fn().mockResolvedValue(123) });
      const result = await getBalance(mockProvider, '0x123', 'mockUserAddress');
      expect(result).toBe(123);
    });

    test('should return 0 on error', async () => {
      mockContract.methods.balanceOf = vi.fn().mockReturnValueOnce({ call: vi.fn().mockRejectedValue(new Error()) });
      const result = await getBalance(mockProvider, '0x123', 'mockUserAddress');
      expect(result).toBe('0');
    });
  });

  describe('getTotalSupply', () => {
    test('should call method with parameters when paramsOption exists', async () => {
      mockContract.methods.totalSupply = vi.fn().mockReturnValueOnce({ call: vi.fn().mockResolvedValue(123) });
      const result = await getTotalSupply(mockProvider, '0x123');
      expect(result).toBe(123);
    });

    test('should return 0 on error', async () => {
      mockContract.methods.totalSupply = vi.fn().mockReturnValueOnce({ call: vi.fn().mockRejectedValue(new Error()) });
      const result = await getTotalSupply(mockProvider, '0x123');
      expect(result).toBe('0');
    });
  });

  describe('checkAllowanceAndApprove', () => {
    const mockERC20Contract = {
      callViewMethod: vi.fn(),
      callSendMethod: vi.fn(),
    } as unknown as ContractBasic;

    test('should return error when allowance check fails', async () => {
      vi.mocked(mockERC20Contract.callViewMethod).mockResolvedValueOnce({ error: 'INSUFFICIENT_BALANCE' });
      const result = await checkAllowanceAndApprove({
        erc20Contract: mockERC20Contract,
        approveTargetAddress: '0x456',
        account: '0x123',
      });
      expect(result.error).toBe('INSUFFICIENT_BALANCE');
    });

    test('should return error when allowance check fails', async () => {
      vi.mocked(mockERC20Contract.callViewMethod).mockResolvedValueOnce('100').mockResolvedValueOnce(18);
      vi.mocked(mockERC20Contract.callSendMethod).mockResolvedValue({ error: 'Failed to approve' });

      const result = await checkAllowanceAndApprove({
        erc20Contract: mockERC20Contract,
        approveTargetAddress: '0x456',
        account: '0x123',
      });
      expect(result.error).toBe('Failed to approve');
    });

    test('should trigger approval when allowance is insufficient', async () => {
      vi.mocked(mockERC20Contract.callViewMethod).mockResolvedValueOnce('100').mockResolvedValueOnce(18);
      vi.mocked(mockERC20Contract.callSendMethod).mockResolvedValue({ transactionHash: '0x789' });

      const result = await checkAllowanceAndApprove({
        erc20Contract: mockERC20Contract,
        approveTargetAddress: '0x456',
        account: '0x123',
      });

      expect(mockERC20Contract.callSendMethod).toHaveBeenCalledWith('approve', '0x123', ['0x456', MaxUint256]);
      expect(result.transactionHash).toBe('0x789');
    });

    test('should return true when allowance is insufficient', async () => {
      vi.mocked(mockERC20Contract.callViewMethod).mockResolvedValueOnce('100').mockResolvedValueOnce(18);
      vi.mocked(mockERC20Contract.callSendMethod).mockResolvedValue({ transactionHash: '0x789' });

      const result = await checkAllowanceAndApprove({
        erc20Contract: mockERC20Contract,
        approveTargetAddress: '0x456',
        account: '0x123',
        pivotBalance: 1,
        contractUseAmount: 1,
      });

      expect(result).toBe(true);
    });
  });

  describe('checkErcApprove', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    test('should handle user denied error properly', async () => {
      // Mock console.log
      vi.spyOn(console, 'error').mockImplementation(() => {});

      // Reassignment mockBehavior.callViewMethod
      mockBehavior.callViewMethod.mockResolvedValue({ error: { details: 'User denied transaction' } });
      mockBehavior.callSendMethod.mockResolvedValue({});

      vi.mocked(isUserDenied).mockReturnValue(true);

      const result = await checkErcApprove(1, '0x123', '0x456', '0x789', '0xabc');
      expect(CommonMessage.error).toHaveBeenCalledTimes(2);
      expect(result).toBe(REQ_CODE.UserDenied);
    });

    test('should handle Fail error properly', async () => {
      // Mock console.log
      vi.spyOn(console, 'error').mockImplementation(() => {});

      // Reassignment mockBehavior.callViewMethod
      mockBehavior.callViewMethod.mockResolvedValue({ error: { details: 'User denied transaction' } });
      mockBehavior.callSendMethod.mockResolvedValue({});

      ContractBasic.prototype.callViewMethod = vi.fn().mockResolvedValue({});

      vi.mocked(isUserDenied).mockReturnValue(false);

      const result = await checkErcApprove(1, '0x123', '0x456', '0x789', '0xabc');
      expect(CommonMessage.error).toHaveBeenCalledTimes(2);
      expect(result).toBe(REQ_CODE.Fail);
    });

    test('should return success if approve is sufficient', async () => {
      // Mock console.log
      vi.spyOn(console, 'error').mockImplementation(() => {});

      // Reassignment mockBehavior.callViewMethod
      mockBehavior.callViewMethod.mockResolvedValue({});
      mockBehavior.callSendMethod.mockResolvedValue({});

      vi.mocked(isUserDenied).mockReturnValue(false);

      const result = await checkErcApprove(1, '0x123', '0x456', '0x789', '0xabc');

      expect(result).toBe(REQ_CODE.Success);
    });
  });

  describe('createToken', () => {
    it('should create a token and return the transaction hash', async () => {
      const transactionHash = '0xabc';
      const mockCreateContract = {
        callSendMethod: vi.fn().mockResolvedValue({ transactionHash }),
      } as unknown as ContractBasic;
      const createTokenContract = mockCreateContract;
      const account = '0x123';
      const name = 'Test Token';
      const symbol = 'TTK';
      const initialSupply = '1000';

      const result = await createToken({
        createTokenContract,
        account,
        name,
        symbol,
        initialSupply,
      });
      expect(mockCreateContract.callSendMethod).toHaveBeenCalledWith(
        'createToken',
        account,
        [name, symbol, initialSupply],
        {
          onMethod: 'transactionHash',
        },
      );
      expect(result).toEqual({ transactionHash });
    });

    it('should return the error if an error occurs', async () => {
      const error = 'Create token error';
      const mockCreateContract = {
        callSendMethod: vi.fn().mockRejectedValue(new Error(error)),
      } as unknown as ContractBasic;

      const createTokenContract = mockCreateContract;
      const account = '0x123';
      const name = 'Test Token';
      const symbol = 'TTK';
      const initialSupply = '1000';

      await expect(
        createToken({
          createTokenContract,
          account,
          name,
          symbol,
          initialSupply,
        }),
      ).rejects.toThrow(Error(error));
      expect(mockCreateContract.callSendMethod).toHaveBeenCalledWith(
        'createToken',
        account,
        [name, symbol, initialSupply],
        {
          onMethod: 'transactionHash',
        },
      );
    });
  });

  describe('createOfficialToken', () => {
    it('should create a token and return the transaction hash', async () => {
      const transactionHash = '0xabc';
      const mockCreateContract = {
        callSendMethod: vi.fn().mockResolvedValue({ transactionHash }),
      } as unknown as ContractBasic;
      const createTokenContract = mockCreateContract;
      const account = '0x123';
      const name = 'Test Token';
      const symbol = 'TTK';
      const initialSupply = '1000';
      const officialAddress = 'mockOfficialAddress';
      const mintToAddress = 'mockMintToAddress';

      const result = await createOfficialToken({
        createTokenContract,
        account,
        name,
        symbol,
        initialSupply,
        officialAddress,
        mintToAddress,
      });
      expect(mockCreateContract.callSendMethod).toHaveBeenCalledWith(
        'createOfficialToken',
        account,
        [name, symbol, initialSupply, officialAddress, mintToAddress],
        {
          onMethod: 'transactionHash',
        },
      );
      expect(result).toEqual({ transactionHash });
    });

    it('should return the error if an error occurs', async () => {
      const error = 'Create token error';
      const mockCreateContract = {
        callSendMethod: vi.fn().mockRejectedValue(new Error(error)),
      } as unknown as ContractBasic;

      const createTokenContract = mockCreateContract;
      const account = '0x123';
      const name = 'Test Token';
      const symbol = 'TTK';
      const initialSupply = '1000';

      const officialAddress = 'mockOfficialAddress';
      const mintToAddress = 'mockMintToAddress';

      await expect(
        createOfficialToken({
          createTokenContract,
          account,
          name,
          symbol,
          initialSupply,
          officialAddress,
          mintToAddress,
        }),
      ).rejects.toThrow(Error(error));
      expect(mockCreateContract.callSendMethod).toHaveBeenCalledWith(
        'createOfficialToken',
        account,
        [name, symbol, initialSupply, officialAddress, mintToAddress],
        {
          onMethod: 'transactionHash',
        },
      );
    });
  });
});
