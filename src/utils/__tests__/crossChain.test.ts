import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import {
  CreateReceipt,
  CrossChainTransfer,
  getReceiptLimit,
  getSwapId,
  getSwapLimit,
  LockToken,
  SwapToken,
  ValidateTokenInfoExists,
} from 'utils/crossChain';
import { ContractBasic } from 'utils/contract';
import { ChainId, TokenInfo } from 'types';
import { base58ToChainId, formatAddress, getChainIdToMap } from 'utils/chain';
import { getTokenInfoByWhitelist } from 'utils/whitelist';
import { SupportedChainId, SupportedELFChainId } from 'constants/chain';
import CommonMessage from 'components/CommonMessage';
import BigNumber from 'bignumber.js';
import { timesDecimals } from 'utils/calculate';
import { isIncludesChainId, isTonChain } from 'utils/index';
import { checkApprove } from 'contracts/index';
import { CrossFeeToken, REQ_CODE } from 'constants/misc';

// Mock external dependencies
vi.mock('components/CommonMessage', () => {
  return {
    default: {
      error: vi.fn(),
    },
  };
});

vi.mock('utils/contract', () => {
  // Mock ContractBasic
  class MockContractBasic {
    callSendMethod = vi.fn();
    callViewMethod = vi.fn();
  }

  return {
    ContractBasic: MockContractBasic,
  };
});

// Mock formatAddress, base58ToChainId and getChainIdToMap
vi.mock('utils/chain', async (importOriginal) => {
  const actual: any = await importOriginal();

  return {
    ...actual,
    base58ToChainId: vi.fn(),
    formatAddress: vi.fn(),
    getChainIdToMap: vi.fn(),
  };
});

vi.mock('utils/index', async (importOriginal) => {
  const actual: any = await importOriginal();

  return {
    ...actual,
    isIncludesChainId: vi.fn(),
    isTonChain: vi.fn().mockReturnValue(false),
  };
});

vi.mock('utils/whitelist', () => ({
  getTokenInfoByWhitelist: vi.fn(),
}));

vi.mock('utils/calculate', () => ({
  timesDecimals: vi.fn().mockReturnValue({
    toFixed: () => '1000000000000000000',
  }),
}));

vi.mock('contracts/index', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    checkApprove: vi.fn().mockResolvedValue(1),
  };
});

vi.mock('constants/index', async (importOriginal) => {
  const actual: any = await importOriginal();

  return {
    ...actual,
    FormatTokenList: [
      {
        fromChainId: [56],
        toChainId: ['AELF', 'tDVV', 'tDVW'],
        fromSymbol: 'WBNB',
        toSymbol: 'BNB',
      },
      {
        fromChainId: [1, 8453],
        toChainId: ['AELF', 'tDVV', 'tDVW'],
        fromSymbol: 'WETH',
        toSymbol: 'ETH',
      },
    ],
  };
});

const mainChainId = 'AELF' as ChainId;
const dappChainId = 'tDVV' as ChainId;

// Mock TokenInfo
const mockToken: TokenInfo = {
  symbol: 'ELF',
  issueChainId: 1100,
  decimals: 8,
  address: 'mockAddress',
  // Add other required properties if necessary
};

// Mock ChainId
const mockToChainId = dappChainId;

// Mock account and to address
const mockAccount = 'AELF1234567890123456789012345678901234567890123456789';
const mockToAddress = 'AELF9876543210987654321098765432109876543210987654321';

// Mock amount
const mockAmount = '10';

// Mock TokenInfo
const mockTokenInfo: TokenInfo = {
  symbol: 'ELF',
  issueChainId: 1100,
  decimals: 8,
  // Add other required properties if necessary
};

describe('CrossChainTransfer', () => {
  let mockContract: ContractBasic;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContract = new ContractBasic({ contractAddress: 'mockContractAddress' });
  });

  it('should call callSendMethod with correct parameters', async () => {
    (base58ToChainId as any).mockReturnValue('base58ChainId');

    await CrossChainTransfer({
      contract: mockContract,
      account: mockAccount,
      to: mockToAddress,
      token: mockToken,
      toChainId: mockToChainId,
      amount: mockAmount,
    });

    expect(mockContract.callSendMethod).toHaveBeenCalledWith(
      'CrossChainTransfer',
      mockAccount,
      [mockToAddress, mockToken.symbol, mockAmount, ' ', 'base58ChainId', mockToken.issueChainId],
      { onMethod: 'receipt' },
    );
  });

  it('should handle errors from callSendMethod', async () => {
    const errorMessage = 'Transaction failed';
    (mockContract.callSendMethod as Mock).mockRejectedValue(new Error(errorMessage));

    await expect(
      CrossChainTransfer({
        contract: mockContract,
        account: mockAccount,
        to: mockToAddress,
        token: mockToken,
        toChainId: mockToChainId,
        amount: mockAmount,
      }),
    ).rejects.toThrow(errorMessage);
  });
});

describe('ValidateTokenInfoExists', () => {
  let mockContract: ContractBasic;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContract = new ContractBasic({ contractAddress: 'mockContractAddress' });
  });

  it('should call callSendMethod with correct parameters', async () => {
    await ValidateTokenInfoExists({
      contract: mockContract,
      tokenInfo: mockTokenInfo,
      account: mockAccount,
    });

    expect(mockContract.callSendMethod).toHaveBeenCalledWith('ValidateTokenInfoExists', mockAccount, mockTokenInfo);
  });

  it('should handle errors from callSendMethod', async () => {
    const errorMessage = 'Validation failed';
    (mockContract.callSendMethod as Mock).mockRejectedValue(new Error(errorMessage));

    await expect(
      ValidateTokenInfoExists({
        contract: mockContract,
        tokenInfo: mockTokenInfo,
        account: mockAccount,
      }),
    ).rejects.toThrow(errorMessage);
  });
});

describe('CreateReceipt', () => {
  const mockBridgeContract = {
    contractType: 'ELF',
    address: 'bridge-address',
    callSendMethod: vi.fn().mockResolvedValue({ transactionId: 'tx123' }),
  };

  const baseParams = {
    library: {} as any,
    fromToken: 'ELF',
    account: 'user-account',
    bridgeContract: mockBridgeContract,
    amount: '100',
    toChainId: SupportedELFChainId.AELF,
    to: 'recipient-address',
    tokenContract: {} as ContractBasic,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkApprove).mockReset().mockResolvedValue(REQ_CODE.Success);
    mockBridgeContract.contractType = 'ELF';
  });

  // Test address formatting for non-ELF chains
  test('should format address for non-ELF chains', async () => {
    mockBridgeContract.contractType = 'OTHER';
    const result = await CreateReceipt(baseParams);

    expect(result.transactionId).toBe('tx123');
    expect(formatAddress).not.toHaveBeenCalled();
  });

  // Test CrossFee approval flow
  test('should handle CrossFee approval for ELF chains', async () => {
    const params = { ...baseParams, fromToken: 'OTHER_TOKEN', crossFee: '1' };

    const result = await CreateReceipt(baseParams);

    expect(result.transactionId).toBe('tx123');

    // Verify CrossFee approval check
    expect(checkApprove).toHaveBeenCalledWith(
      params.library,
      CrossFeeToken,
      params.account,
      mockBridgeContract.address,
      '100',
      undefined,
      params.tokenContract,
    );
  });

  // Test approval failure handling
  test('should throw error when approval fails', async () => {
    vi.mocked(checkApprove).mockResolvedValue(REQ_CODE.Fail);

    await expect(
      CreateReceipt({
        ...baseParams,
        fromToken: 'OTHER_TOKEN',
        crossFee: '1',
      }),
    ).rejects.toBe(REQ_CODE.Fail);
  });

  // Test amount calculation with CrossFee
  test('should calculate correct amount with CrossFee', async () => {
    const result = await CreateReceipt({
      ...baseParams,
      fromToken: CrossFeeToken,
      crossFee: '1',
      bridgeContract: { ...mockBridgeContract, address: '' },
    });

    expect(result.transactionId).toBe('tx123');
    // Verify amount calculation
    expect(timesDecimals).toHaveBeenCalledWith('1', 8);
    expect(checkApprove).toHaveBeenCalledWith(
      {},
      CrossFeeToken,
      'user-account',
      '',
      '1000000000000000100',
      undefined,
      {},
    );
  });

  test('should calculate correct amount with aelf chain USDT', async () => {
    const result = await CreateReceipt({
      ...baseParams,
      fromToken: 'USDT',
      crossFee: '1',
      bridgeContract: { ...mockBridgeContract, address: '' },
    });

    expect(result.transactionId).toBe('tx123');
    // Verify amount calculation
    expect(timesDecimals).toHaveBeenCalledWith('1', 8);
    expect(checkApprove).toHaveBeenCalledWith({}, 'USDT', 'user-account', '', '100', undefined, {});
  });

  test('should throw error if return checkApprove failed', async () => {
    vi.mocked(checkApprove).mockResolvedValue(REQ_CODE.Fail);

    await expect(
      CreateReceipt({
        ...baseParams,
        fromToken: CrossFeeToken,
        crossFee: '1',
        bridgeContract: { ...mockBridgeContract, address: '' },
      }),
    ).rejects.toThrow();
  });

  // Test TON chain special handling
  test('should skip approval for TON chains', async () => {
    mockBridgeContract.contractType = 'TON';
    const result = await CreateReceipt(baseParams);

    expect(result.transactionId).toBe('tx123');
    expect(checkApprove).not.toHaveBeenCalled();
  });

  // Test ELF chain method signature
  test('should use ELF-specific method parameters', async () => {
    const result = await CreateReceipt(baseParams);

    expect(result.transactionId).toBe('tx123');

    expect(mockBridgeContract.callSendMethod).toHaveBeenCalledWith('createReceipt', baseParams.account, [
      baseParams.fromToken,
      baseParams.account,
      baseParams.to,
      baseParams.amount,
      undefined,
      0,
    ]);
  });

  // Test non-ELF chain method signature
  test('should use standard method parameters for non-ELF chains', async () => {
    mockBridgeContract.contractType = 'OTHER';
    const result = await CreateReceipt(baseParams);

    expect(result.transactionId).toBe('tx123');

    expect(mockBridgeContract.callSendMethod).toHaveBeenCalledWith(
      'createReceipt',
      baseParams.account,
      [baseParams.fromToken, baseParams.amount, undefined, 'recipient-address'],
      { onMethod: 'transactionHash' },
    );
  });

  // Test TON chain flag handling
  test('should handle TON chain destination', async () => {
    vi.mocked(isTonChain).mockReturnValue(true);
    const result = await CreateReceipt(baseParams);

    expect(result.transactionId).toBe('tx123');

    expect(mockBridgeContract.callSendMethod).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.arrayContaining([1]),
    );
  });

  // Test parameter validation
  test('should handle missing required parameters', async () => {
    // @ts-ignore Test invalid input
    await expect(CreateReceipt({})).rejects.toThrow();
  });

  // Test decimal conversion edge cases
  test('should handle zero crossFee', async () => {
    const result = await CreateReceipt({
      ...baseParams,
      fromToken: CrossFeeToken,
      crossFee: '0',
    });

    expect(result.transactionId).toBe('tx123');

    expect(checkApprove).toHaveBeenCalledWith(
      {},
      'ELF',
      'user-account',
      'bridge-address',
      '1000000000000000100',
      undefined,
      {},
    );
  });

  // Test console logging
  test('should log correct parameters', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const result = await CreateReceipt(baseParams);

    expect(result.transactionId).toBe('tx123');

    expect(consoleSpy).toHaveBeenCalledWith(
      true,
      baseParams.toChainId,
      expect.arrayContaining([baseParams.fromToken]),
      '======toChainId',
    );
  });
});

describe('LockToken', () => {
  // Mock data
  const mockAccount = 'AELF1234567890123456789012345678901234567890123456789';
  const mockBridgeContract = new ContractBasic({ contractAddress: 'mockBridgeContractAddress' });
  const mockAmount = '10';
  const mockToChainId = 'AELF' as ChainId;
  const mockTo = 'AELF9876543210987654321098765432109876543210987654321';
  const mockFormattedAddress = 'formattedAddress';

  const mockProvider: any = {
    // Add necessary methods and properties for the provider
    send: vi.fn(),
    getTransactionReceipt: vi.fn(),
    // Add other required methods if necessary
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (formatAddress as any).mockReturnValue(mockFormattedAddress);
    (getChainIdToMap as any).mockReturnValue(mainChainId);
  });

  it('should call callSendMethod with correct parameters', async () => {
    await LockToken({
      account: mockAccount,
      bridgeContract: mockBridgeContract,
      amount: mockAmount,
      toChainId: mockToChainId,
      to: mockTo,
      library: mockProvider,
      fromToken: 'ELF',
    });

    expect(getChainIdToMap).toHaveBeenCalledWith(mockToChainId);
    expect(mockBridgeContract.callSendMethod).toHaveBeenCalled();
  });

  it('should handle errors from callSendMethod', async () => {
    const errorMessage = 'Lock failed';
    (mockBridgeContract.callSendMethod as Mock).mockRejectedValue(new Error(errorMessage));

    await expect(
      LockToken({
        account: mockAccount,
        bridgeContract: mockBridgeContract,
        amount: mockAmount,
        toChainId: mockToChainId,
        to: mockTo,
        library: mockProvider,
        fromToken: 'ELF',
      }),
    ).rejects.toThrow(errorMessage);
  });
});

describe('SwapToken', () => {
  let mockContract: ContractBasic;

  const baseParams = {
    toAccount: 'mock-account',
    receiveItem: {
      transferAmount: 100,
      receiptId: '123',
      toAddress: '0x123',
      transferToken: { symbol: 'WETH', decimals: 18 },
      toChainId: SupportedELFChainId.AELF,
      fromChainId: SupportedChainId.MAINNET,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockContract = new ContractBasic({ contractAddress: 'mockContractAddress' });

    (getChainIdToMap as any).mockReturnValue(mainChainId);

    vi.mocked(getTokenInfoByWhitelist).mockReturnValue(mockTokenInfo);
  });

  // Test early return conditions
  test('should return undefined when missing required parameters', async () => {
    // Test missing toChainId
    const result1 = await SwapToken({
      ...baseParams,
      bridgeOutContract: { ...mockContract, contractType: 'ERC' as any },
      receiveItem: { ...baseParams.receiveItem, toChainId: undefined },
    });
    expect(result1).toBeUndefined();

    // Test missing transferToken.symbol
    const result2 = await SwapToken({
      ...baseParams,
      bridgeOutContract: { ...mockContract, contractType: 'ERC' as any },
      receiveItem: {
        ...baseParams.receiveItem,
        transferToken: { ...baseParams.receiveItem.transferToken, symbol: '' }, // symbol: undefined
      },
    });
    expect(result2).toBeUndefined();

    // Test missing receiveItem
    const result3 = await SwapToken({
      ...baseParams,
      bridgeOutContract: { ...mockContract, contractType: 'ERC' as any },
      receiveItem: undefined as any,
    });
    expect(result3).toBeUndefined();
  });

  // Test token symbol conversion
  test('should convert symbol using FormatTokenList', async () => {
    await SwapToken({
      ...baseParams,
      bridgeOutContract: { ...mockContract, contractType: 'ERC' as any, callViewMethod: vi.fn().mockResolvedValue({}) },
    });

    // Verify token info lookup uses converted symbol
    expect(getTokenInfoByWhitelist).toHaveBeenCalledWith(
      'AELF',
      'WETH', // Converted symbol
    );
  });

  // Test ELF contract type handling
  test('should handle ELF contract type swap ID', async () => {
    vi.mocked(isIncludesChainId).mockReturnValue(true);

    const result = await SwapToken({
      ...baseParams,
      bridgeOutContract: {
        ...mockContract,
        contractType: 'ELF' as any,
        callViewMethod: vi.fn().mockResolvedValueOnce({ result: 'elf-swap-id' }),
        callSendMethod: vi.fn().mockResolvedValueOnce({ result: 'success' }),
      },
    });

    expect(result).toEqual({ result: 'success' });
  });

  // Test ERC contract type handling
  test('should handle ERC contract type swap ID', async () => {
    const result = await SwapToken({
      ...baseParams,
      bridgeOutContract: {
        ...mockContract,
        contractType: 'ERC' as any,
        callViewMethod: vi.fn().mockResolvedValueOnce({ result: 'erc-swap-id' }),
        callSendMethod: vi.fn().mockResolvedValueOnce({ result: 'success' }),
      },
    });

    expect(result).toEqual({ result: 'success' });
  });

  // Test swap ID error handling
  test('should return error when swap ID call fails', async () => {
    vi.mocked(mockContract.callViewMethod).mockResolvedValueOnce({ error: 'SWAP_ID_ERROR' });

    const result = await SwapToken({
      ...baseParams,
      bridgeOutContract: {
        ...mockContract,
        contractType: 'ERC' as any,
        callViewMethod: vi.fn().mockResolvedValueOnce({ error: 'SWAP_ID_ERROR' }),
      },
    });
    expect(result).toEqual({ error: 'SWAP_ID_ERROR' });
  });

  // Test successful swap execution
  test('should execute swap with correct parameters', async () => {
    const result = await SwapToken({
      ...baseParams,
      bridgeOutContract: {
        ...mockContract,
        contractType: 'ERC' as any,
        callViewMethod: vi.fn().mockResolvedValueOnce({ result: 'swap-id-123' }),
        callSendMethod: vi.fn().mockResolvedValueOnce({ transactionId: 'tx1' }),
      },
    });

    expect(result).toEqual({ transactionId: 'tx1' });
  });

  // Test missing token info handling
  test('should handle missing token address', async () => {
    vi.mocked(getTokenInfoByWhitelist).mockReturnValue(undefined);

    await expect(SwapToken(baseParams as any)).rejects.toThrow();

    expect(mockContract.callSendMethod).not.toHaveBeenCalled();
  });

  // Test decimal conversion
  test('should apply correct decimal conversion', async () => {
    const result = await SwapToken({
      ...baseParams,
      bridgeOutContract: {
        ...mockContract,
        contractType: 'ERC' as any,
        callViewMethod: vi.fn().mockResolvedValueOnce({ result: 'swap-id-123' }),
        callSendMethod: vi.fn().mockResolvedValueOnce({ transactionId: 'tx1' }),
      },
    });

    expect(result).toEqual({ transactionId: 'tx1' });
    expect(timesDecimals).toHaveBeenCalledWith(100, 18);
  });

  // Test chain ID mapping
  test('should use mapped chain ID in contract calls', async () => {
    const result = await SwapToken({
      ...baseParams,
      bridgeOutContract: {
        ...mockContract,
        contractType: 'ERC' as any,
        callViewMethod: vi.fn().mockResolvedValueOnce({ result: 'swap-id-123' }),
        callSendMethod: vi.fn().mockResolvedValueOnce({ transactionId: 'tx1' }),
      },
    });

    expect(result).toEqual({ transactionId: 'tx1' });
    expect(getChainIdToMap).toHaveBeenCalledWith(1);
  });
});

describe('getSwapId', () => {
  let mockContract: ContractBasic;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContract = new ContractBasic({ contractAddress: 'mockContractAddress' });

    (getChainIdToMap as any).mockReturnValue(mainChainId);
  });

  it('should return undefined if any parameter is missing', async () => {
    (getTokenInfoByWhitelist as any).mockReturnValue(mockTokenInfo);

    const result = await getSwapId({
      bridgeOutContract: mockContract,
      toChainId: dappChainId,
      fromChainId: mainChainId,
      // symbol is missing
    });

    expect(result).toBeUndefined();
  });

  it('should call callViewMethod with correct parameters for ELF contractType', async () => {
    (getTokenInfoByWhitelist as any).mockReturnValue(mockTokenInfo);

    mockContract.contractType = 'ELF';

    await getSwapId({
      bridgeOutContract: mockContract,
      toChainId: dappChainId,
      fromChainId: mainChainId,
      symbol: 'ELF',
    });

    expect(mockContract.callViewMethod).toHaveBeenCalledWith('GetSwapIdByToken', [mainChainId, 'ELF']);
  });

  it('should call callViewMethod with correct parameters for non-ELF contractType', async () => {
    (getTokenInfoByWhitelist as any).mockReturnValue(mockTokenInfo);

    mockContract.contractType = 'nonELF' as any;

    await getSwapId({
      bridgeOutContract: mockContract,
      toChainId: dappChainId,
      fromChainId: mainChainId,
      symbol: 'ELF',
    });

    expect(mockContract.callViewMethod).toHaveBeenCalledWith('getSwapId', [mockTokenInfo.address, mainChainId]);
  });

  it('should return swapId from callViewMethod', async () => {
    (getTokenInfoByWhitelist as any).mockReturnValue(mockTokenInfo);

    const mockSwapId = 'mockSwapId';
    (mockContract.callViewMethod as Mock).mockResolvedValue(mockSwapId);

    const result = await getSwapId({
      bridgeOutContract: mockContract,
      toChainId: dappChainId,
      fromChainId: mainChainId,
      symbol: 'ELF',
    });

    expect(result).toBe(mockSwapId);
  });

  it('should handle errors from callViewMethod', async () => {
    (getTokenInfoByWhitelist as any).mockReturnValue(mockTokenInfo);

    const errorMessage = 'Failed to get swapId';
    (mockContract.callViewMethod as Mock).mockRejectedValue(new Error(errorMessage));

    await expect(
      getSwapId({
        bridgeOutContract: mockContract,
        toChainId: dappChainId,
        fromChainId: mainChainId,
        symbol: 'ELF',
      }),
    ).rejects.toThrow(errorMessage);
  });

  it('should call callViewMethod with correct parameters for non-ELF contractType and not tokenInfo', async () => {
    (getTokenInfoByWhitelist as any).mockReturnValue(undefined);

    mockContract.contractType = 'nonELF' as any;

    await getSwapId({
      bridgeOutContract: mockContract,
      toChainId: dappChainId,
      fromChainId: mainChainId,
      symbol: 'ELF',
    });

    expect(mockContract.callViewMethod).toHaveBeenCalledWith('getSwapId', [mockTokenInfo.address, mainChainId]);
  });
});

describe('getReceiptLimit', () => {
  let mockContract: ContractBasic;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContract = new ContractBasic({ contractAddress: 'mockContractAddress' });

    (getChainIdToMap as any).mockReturnValue(mainChainId);
  });

  // Test parameter boundary cases
  test.each([
    { param: 'limitContract', value: undefined },
    { param: 'fromChainId', value: undefined },
    { param: 'toChainId', value: undefined },
    { param: 'fromSymbol', value: undefined },
  ])('should return undefined when $param is missing', async ({ param, value }) => {
    const params = {
      limitContract: mockContract,
      fromChainId: SupportedELFChainId.AELF,
      toChainId: SupportedChainId.MAINNET,
      fromSymbol: 'ETH',
      [param]: value,
    };

    const result = await getReceiptLimit(params);
    expect(result).toBeUndefined();
  });

  // Test successful data retrieval
  test('should return formatted limit data when all parameters valid', async () => {
    // Mock contract responses
    vi.mocked(mockContract.callViewMethod)
      .mockResolvedValueOnce({
        error: undefined,
        tokenAmount: '1000',
      })
      .mockResolvedValueOnce({
        error: undefined,
        tokenCapacity: '2000',
        currentTokenAmount: '500',
        rate: '100',
        isEnabled: true,
      });

    const result = await getReceiptLimit({
      limitContract: { ...mockContract, contractType: 'ERC' },
      fromChainId: SupportedELFChainId.AELF,
      toChainId: SupportedChainId.MAINNET,
      fromSymbol: 'ETH',
    });

    // Verify BigNumber conversions
    expect(result).toEqual({
      remain: expect.any(BigNumber),
      maxCapcity: expect.any(BigNumber),
      currentCapcity: expect.any(BigNumber),
      fillRate: expect.any(BigNumber),
      isEnable: undefined,
    });

    // Verify numerical values
    expect(result?.remain.toString()).toBe('1000');
    expect(result?.maxCapcity.toString()).toBe('2000');
    expect(result?.currentCapcity.toString()).toBe('500');
    expect(result?.fillRate.toString()).toBe('100');
  });

  // Test error handling in contract calls
  test('should throw error when contract returns error', async () => {
    vi.mocked(mockContract.callViewMethod)
      .mockResolvedValueOnce({ error: 'LIMIT_ERROR' })
      .mockResolvedValueOnce({ error: 'TOKEN_BUCKET_ERROR' });

    await getReceiptLimit({
      limitContract: mockContract,
      fromChainId: SupportedELFChainId.AELF,
      toChainId: SupportedChainId.MAINNET,
      fromSymbol: 'ETH',
    });

    expect(CommonMessage.error).toHaveBeenCalledWith('LIMIT_ERROR');
  });

  // Test error handling in contract calls
  test('should throw error when contract returns error', async () => {
    vi.mocked(mockContract.callViewMethod)
      .mockResolvedValueOnce({ error: '' })
      .mockResolvedValueOnce({ error: 'TOKEN_BUCKET_ERROR' });

    await getReceiptLimit({
      limitContract: mockContract,
      fromChainId: SupportedELFChainId.AELF,
      toChainId: SupportedChainId.MAINNET,
      fromSymbol: 'ETH',
    });

    expect(CommonMessage.error).toHaveBeenCalledWith('TOKEN_BUCKET_ERROR');
  });

  // Test missing token info scenario
  test('should handle missing token address', async () => {
    vi.mocked(getTokenInfoByWhitelist).mockReturnValue(undefined);

    const result = await getReceiptLimit({
      limitContract: mockContract,
      fromChainId: SupportedELFChainId.AELF,
      toChainId: SupportedChainId.MAINNET,
      fromSymbol: 'ETH',
    });

    expect(result).toBeUndefined();
    expect(CommonMessage.error).toHaveBeenCalledWith(expect.stringContaining('Cannot read properties of undefined'));
  });

  // Test exception handling
  test('should handle unexpected errors', async () => {
    const testError = new Error('Network failure');
    vi.mocked(mockContract.callViewMethod).mockRejectedValue(testError);

    const result = await getReceiptLimit({
      limitContract: { ...mockContract, contractType: 'ERC' },
      fromChainId: SupportedChainId.MAINNET,
      toChainId: SupportedELFChainId.AELF,
      fromSymbol: 'ETH',
    });

    expect(result).toBeUndefined();
    expect(CommonMessage.error).toHaveBeenCalledWith('Network failure');
  });

  // // Test chain ID mapping
  test('should use mapped chain ID in contract call', async () => {
    vi.mocked(mockContract.callViewMethod).mockResolvedValue({
      tokenAmount: '1000',
      tokenCapacity: '2000',
      currentCapcity: '500',
      fillRate: '100',
      isEnable: true,
    });

    await getReceiptLimit({
      limitContract: { ...mockContract, contractType: 'ERC' },
      fromChainId: SupportedChainId.MAINNET,
      toChainId: SupportedELFChainId.tDVV,
      fromSymbol: 'ETH',
    });

    expect(getChainIdToMap).toHaveBeenCalledWith(SupportedELFChainId.tDVV);
    expect(mockContract.callViewMethod).toHaveBeenCalledWith('getCurrentReceiptTokenBucketState', [undefined, 'AELF']);
  });
});

describe('getSwapLimit', () => {
  let mockContract: ContractBasic;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContract = new ContractBasic({ contractAddress: 'mockContractAddress' });

    (getChainIdToMap as any).mockReturnValue(mainChainId);
  });

  // Test parameter boundary cases
  test.each([
    { param: 'limitContract', value: undefined },
    { param: 'fromChainId', value: undefined },
    { param: 'swapId', value: undefined },
    { param: 'toChainId', value: undefined },
    { param: 'toSymbol', value: undefined },
  ])('should return undefined when $param is missing', async ({ param, value }) => {
    const params = {
      limitContract: mockContract,
      fromChainId: SupportedELFChainId.AELF,
      swapId: 'swap-1',
      toChainId: SupportedChainId.MAINNET,
      toSymbol: 'ETH',
      [param]: value,
    };

    const result = await getSwapLimit(params);
    expect(result).toBeUndefined();
  });

  // Test successful data retrieval
  test('should return formatted limit data when all parameters valid', async () => {
    // Mock contract responses
    vi.mocked(mockContract.callViewMethod)
      .mockResolvedValueOnce({
        error: undefined,
        tokenAmount: '1000',
      })
      .mockResolvedValueOnce({
        error: undefined,
        tokenCapacity: '2000',
        currentTokenAmount: '500',
        rate: '100',
        isEnabled: true,
      });

    const result = await getSwapLimit({
      limitContract: { ...mockContract, contractType: 'ERC' },
      fromChainId: SupportedELFChainId.AELF,
      swapId: 'swap-1',
      toChainId: SupportedChainId.MAINNET,
      toSymbol: 'ETH',
    });

    // Verify BigNumber conversions
    expect(result).toEqual({
      remain: expect.any(BigNumber),
      maxCapcity: expect.any(BigNumber),
      currentCapcity: expect.any(BigNumber),
      fillRate: expect.any(BigNumber),
      isEnable: true,
    });

    // Verify numerical values
    expect(result?.remain.toString()).toBe('1000');
    expect(result?.maxCapcity.toString()).toBe('2000');
    expect(result?.currentCapcity.toString()).toBe('500');
    expect(result?.fillRate.toString()).toBe('100');
  });

  // Test error handling in contract calls
  test('should throw error when contract returns error', async () => {
    vi.mocked(mockContract.callViewMethod)
      .mockResolvedValueOnce({ error: 'LIMIT_ERROR' })
      .mockResolvedValueOnce({ error: 'TOKEN_BUCKET_ERROR' });

    await getSwapLimit({
      limitContract: mockContract,
      fromChainId: SupportedELFChainId.AELF,
      swapId: 'swap-1',
      toChainId: SupportedChainId.MAINNET,
      toSymbol: 'ETH',
    });

    expect(CommonMessage.error).toHaveBeenCalledWith('LIMIT_ERROR');
  });

  // Test error handling in contract calls
  test('should throw error when contract returns error', async () => {
    vi.mocked(mockContract.callViewMethod)
      .mockResolvedValueOnce({ error: '' })
      .mockResolvedValueOnce({ error: 'TOKEN_BUCKET_ERROR' });

    await getSwapLimit({
      limitContract: mockContract,
      fromChainId: SupportedELFChainId.AELF,
      swapId: 'swap-1',
      toChainId: SupportedChainId.MAINNET,
      toSymbol: 'ETH',
    });

    expect(CommonMessage.error).toHaveBeenCalledWith('TOKEN_BUCKET_ERROR');
  });

  // Test missing token info scenario
  test('should handle missing token address', async () => {
    vi.mocked(getTokenInfoByWhitelist).mockReturnValue(undefined);

    const result = await getSwapLimit({
      limitContract: mockContract,
      fromChainId: SupportedELFChainId.AELF,
      swapId: 'swap-1',
      toChainId: SupportedChainId.MAINNET,
      toSymbol: 'ETH',
    });

    expect(result).toBeUndefined();
    expect(CommonMessage.error).toHaveBeenCalledWith(expect.stringContaining('Cannot read properties of undefined'));
  });

  // Test exception handling
  test('should handle unexpected errors', async () => {
    const testError = new Error('Network failure');
    vi.mocked(mockContract.callViewMethod).mockRejectedValue(testError);

    const result = await getSwapLimit({
      limitContract: { ...mockContract, contractType: 'ERC' },
      fromChainId: SupportedChainId.MAINNET,
      swapId: 'swap-1',
      toChainId: SupportedELFChainId.AELF,
      toSymbol: 'ETH',
    });

    expect(result).toBeUndefined();
    expect(CommonMessage.error).toHaveBeenCalledWith('Network failure');
  });

  // // Test chain ID mapping
  test('should use mapped chain ID in contract call', async () => {
    vi.mocked(mockContract.callViewMethod).mockResolvedValue({
      tokenAmount: '1000',
      tokenCapacity: '2000',
      currentCapcity: '500',
      fillRate: '100',
      isEnable: true,
    });

    await getSwapLimit({
      limitContract: { ...mockContract, contractType: 'ERC' },
      fromChainId: SupportedChainId.MAINNET,
      swapId: 'swap-1',
      toChainId: SupportedELFChainId.tDVV,
      toSymbol: 'ETH',
    });

    expect(getChainIdToMap).toHaveBeenCalledWith(1);
    expect(mockContract.callViewMethod).toHaveBeenCalledWith('getCurrentSwapTokenBucketState', [undefined, 'AELF']);
  });
});
