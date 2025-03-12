import { describe, expect, test, vi, beforeEach } from 'vitest';
import { REQ_CODE } from 'constants/misc';
import CommonMessage from 'components/CommonMessage';
import { ContractBasic } from 'utils/contract';
import { checkELFApprove, checkElfChainAllowanceAndApprove, getELFChainBalance } from 'contracts/elf';
import { isUserDenied } from 'utils/provider';

// Mock dependencies
vi.mock('components/CommonMessage');
vi.mock('utils/calculate');
vi.mock('utils/provider');

const mockTokenContract = {
  callViewMethod: vi.fn(),
  callSendMethod: vi.fn(),
} as unknown as ContractBasic;

describe('getELFChainBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return balance when exists', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValue({ balance: 100 });

    const result = await getELFChainBalance(mockTokenContract, 'ELF', '0x123');

    expect(result).toBe(100);
    expect(mockTokenContract.callViewMethod).toHaveBeenCalledWith('GetBalance', {
      symbol: 'ELF',
      owner: '0x123',
    });
  });

  test('should return amount when balance not exists', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValue({ amount: 50 });

    const result = await getELFChainBalance(mockTokenContract, 'ELF', '0x123');

    expect(result).toBe(50);
  });

  test('should return 0 when no balance/amount', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValue({});

    const result = await getELFChainBalance(mockTokenContract, 'ELF', '0x123');

    expect(result).toBe(0);
  });
});

describe('checkElfChainAllowanceAndApprove', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseParams = {
    tokenContract: mockTokenContract,
    approveTargetAddress: '0x456',
    account: '0x123',
    symbol: 'ELF',
  };

  test('should return allowance error', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({ error: 'ERROR' });

    const result = await checkElfChainAllowanceAndApprove(baseParams);

    expect(result).toEqual({ error: 'ERROR' });
  });

  test('should return true when allowance is sufficient', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({ allowance: 1000 });
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({ decimals: 8 });

    const result = await checkElfChainAllowanceAndApprove({
      ...baseParams,
      pivotBalance: 1,
    });

    expect(result).toBe(true);
  });

  test('should return true when allowance is sufficient and callViewMethod return amount', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({ amount: 100 });
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({ decimals: 8 });

    const result = await checkElfChainAllowanceAndApprove({
      ...baseParams,
      pivotBalance: 1,
    });

    expect(result).toBe(true);
  });

  test('should call approve when allowance insufficient and callViewMethod return undefined', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({});
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({});

    const result = await checkElfChainAllowanceAndApprove({
      ...baseParams,
      pivotBalance: 1,
    });

    expect(result).toBe(true);
  });

  test('should call approve when allowance insufficient', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({ allowance: 100 });
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({ decimals: 8 });
    vi.mocked(mockTokenContract.callSendMethod).mockResolvedValue({ transactionId: '0x789' });

    const result = await checkElfChainAllowanceAndApprove({
      ...baseParams,
      contractUseAmount: 200,
    });

    expect(mockTokenContract.callSendMethod).toHaveBeenCalledWith('approve', '0x123', ['0x456', 'ELF', '200']);
    expect(result).toEqual({ transactionId: '0x789' });
  });

  test('should catch error when approve failed', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({ allowance: 100 });
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({ decimals: 8 });
    const error = { error: 'Approve failed' };
    vi.mocked(mockTokenContract.callSendMethod).mockResolvedValue(error);

    const result = await checkElfChainAllowanceAndApprove({
      ...baseParams,
      contractUseAmount: 200,
    });

    expect(mockTokenContract.callSendMethod).toHaveBeenCalledWith('approve', '0x123', ['0x456', 'ELF', '200']);
    expect(result).toEqual(error);
  });
});

describe('checkELFApprove', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return Success when approved', async () => {
    // Mock
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValue({ allowance: 1000 });

    const result = await checkELFApprove('ELF', '0x123', '0x456', mockTokenContract);

    expect(result).toBe(REQ_CODE.Success);
  });

  test('should handle user denied error', async () => {
    // Mock
    const error = { error: { message: 'User rejected request' } };
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({});
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({});
    vi.mocked(mockTokenContract.callSendMethod).mockResolvedValue(error);
    vi.mocked(isUserDenied).mockReturnValue(true);

    const result = await checkELFApprove('ELF', '0x123', '0x456', mockTokenContract, 100);

    expect(CommonMessage.error).toHaveBeenCalledTimes(2);
    expect(result).toBe(REQ_CODE.UserDenied);
  });

  test('should handle general error', async () => {
    // Mock
    const error = { error: { message: 'Other error' } };
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({});
    vi.mocked(mockTokenContract.callViewMethod).mockResolvedValueOnce({});
    vi.mocked(mockTokenContract.callSendMethod).mockResolvedValue(error);
    vi.mocked(isUserDenied).mockReturnValue(false);

    const result = await checkELFApprove('ELF', '0x123', '0x456', mockTokenContract, 100);

    expect(result).toBe(REQ_CODE.Fail);
  });
});
