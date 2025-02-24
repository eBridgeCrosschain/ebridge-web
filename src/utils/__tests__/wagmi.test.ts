import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTransactionReceiptAutoRetry, getBalanceByWagmi, readContractByWagmi } from '../wagmi';
import { getTransactionReceipt, getBalance, readContract } from '@wagmi/core';
import { EVMProviderConfig } from 'constants/evm';

// Mock external dependencies
vi.mock('@wagmi/core', () => ({
  getTransactionReceipt: vi.fn(),
  getBalance: vi.fn(),
  readContract: vi.fn(),
}));

vi.mock('utils', () => ({
  sleep: vi.fn(),
}));

vi.mock('../error', () => ({
  handleErrorMessage: vi.fn((error: Error) => error.message),
}));

type TEVMStatus = 'success' | 'reverted';

describe('EVM Utils', () => {
  const sepoliaChainId = 11155111;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('getTransactionReceiptAutoRetry', () => {
    const mockParams = {
      hash: '0x2c37286396fe853d91cb7ebb21a8e4fb0e10ccc057cc153e7fda88ebba7a5651' as `0x${string}`,
      chainId: sepoliaChainId,
    };
    const mockReceipt = {
      status: 'success' as TEVMStatus,
      blockNumber: 7517556n,
      blockHash: '0xd8c6d51e04cfa34f2a5cf41b8a38925af273d33c97298c29545a8d46a8262bd3' as `0x${string}`,
      contractAddress: null,
      cumulativeGasUsed: 8720366n,
      effectiveGasPrice: 3945136086n,
      from: '0x08915f275100dfec26f63624eeacdd41e4040cc0' as `0x${string}`,
      gasUsed: 1317262n,
      logs: [],
      logsBloom:
        '0x00400000000000000000000008000000000000000000002000800000000000000000000002000004200000000000044000000000000000000000000000200000000080000000000000000008000000000001000000000000000000000000200000000000020020020000000000000808000002000200000040000418000200400400000000000000000000000000000000000000000000000000400000000008020004000001800020000000000000000000000000000000000000000000000000000002000000001000000000000000000000000000000000000000000020000010080400000000000000040000000000c00200000000000008000108000000' as `0x${string}`,
      to: '0xbec2bbcb0fa594544c79bbc31d6fd58f55b6dc30' as `0x${string}`,
      transactionHash: '0x2c37286396fe853d91cb7ebb21a8e4fb0e10ccc057cc153e7fda88ebba7a5651' as `0x${string}`,
      transactionIndex: 63,
      type: 'eip1559',
      chainId: sepoliaChainId,
    };

    const PENDING_ERROR_MESSAGE = new Error('Transaction pending');

    it('should return receipt immediately when status is success', async () => {
      // Mock successful receipt on first attempt
      vi.mocked(getTransactionReceipt).mockResolvedValueOnce(mockReceipt);

      const result = await getTransactionReceiptAutoRetry(mockParams);
      expect(result).toEqual(mockReceipt);
      expect(getTransactionReceipt).toHaveBeenCalledTimes(1);
    });

    it('should throw error immediately when status is reverted', async () => {
      // Mock reverted receipt
      vi.mocked(getTransactionReceipt).mockResolvedValueOnce({ ...mockReceipt, status: 'reverted' });

      await expect(getTransactionReceiptAutoRetry(mockParams)).rejects.toThrow('Transaction is reverted');
      expect(getTransactionReceipt).toHaveBeenCalledTimes(1);
    });

    it('should retry when getTransactionReceipt is pending and then is success', async () => {
      // Mock sequence: pending error -> success
      vi.mocked(getTransactionReceipt)
        .mockResolvedValueOnce({ ...mockReceipt, status: 'pending' as any })
        .mockResolvedValueOnce(mockReceipt);

      const result = await getTransactionReceiptAutoRetry(mockParams);
      expect(result).toEqual(mockReceipt);
      expect(getTransactionReceipt).toHaveBeenCalledTimes(2);
    });

    it('should retry when getTransactionReceipt is error and then is pending', async () => {
      // Mock sequence: pending error -> success
      const error = 'The Transaction may not be processed on a block yet.';
      vi.mocked(getTransactionReceipt).mockRejectedValueOnce(new Error(error)).mockResolvedValueOnce(mockReceipt);

      const result = await getTransactionReceiptAutoRetry(mockParams);
      expect(result).toEqual(mockReceipt);
      expect(getTransactionReceipt).toHaveBeenCalledTimes(2);
    });

    it('should catch eror when getTransactionReceipt is throw error', async () => {
      // Mock sequence: pending error -> success
      const error = 'The Transaction may not be processed on a block yet.';
      vi.mocked(getTransactionReceipt).mockRejectedValue(new Error(error));

      await expect(getTransactionReceiptAutoRetry(mockParams, 10, 300)).rejects.toThrow(error);
      expect(getTransactionReceipt).toHaveBeenCalledTimes(1);
    });

    it('should stop retrying after 200 attempts for pending transactions', async () => {
      // Mock permanent pending error
      vi.mocked(getTransactionReceipt).mockRejectedValue(PENDING_ERROR_MESSAGE);

      await expect(getTransactionReceiptAutoRetry(mockParams)).rejects.toThrow(PENDING_ERROR_MESSAGE);
      expect(getTransactionReceipt).toHaveBeenCalled();
    });

    it('should propagate non-pending errors immediately', async () => {
      // Mock non-pending error
      const criticalError = new Error('Critical error');
      vi.mocked(getTransactionReceipt).mockRejectedValue(criticalError);

      await expect(getTransactionReceiptAutoRetry(mockParams)).rejects.toThrow('Critical error');
      expect(getTransactionReceipt).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBalanceByWagmi', () => {
    it('should call wagmi getBalance with correct parameters', async () => {
      const mockBalance = { value: 100n, decimals: 18, formatted: '', symbol: 'ETH' };
      vi.mocked(getBalance).mockResolvedValue(mockBalance);

      const params = { address: '0x123' as `0x${string}`, chainId: sepoliaChainId };
      const result = await getBalanceByWagmi(params);

      expect(result).toEqual(mockBalance);
      expect(getBalance).toHaveBeenCalledWith(EVMProviderConfig, params);
    });
  });

  describe('readContractByWagmi', () => {
    it('should call wagmi readContract with formatted parameters', async () => {
      const mockResult = { data: 'result' };
      vi.mocked(readContract).mockResolvedValue(mockResult);

      const params = {
        address: '0x123',
        abi: ['mockABI'],
        functionName: 'balanceOf',
        args: ['0x456'],
        chainId: sepoliaChainId,
      };
      const result = await readContractByWagmi(params);

      expect(result).toEqual(mockResult);
      expect(readContract).toHaveBeenCalledWith(EVMProviderConfig, params);
    });

    it('should handle missing optional parameters', async () => {
      const mockResult = { data: 'empty' };
      vi.mocked(readContract).mockResolvedValue(mockResult);

      const params = {
        address: '0x123',
        functionName: 'totalSupply',
      };
      const result = await readContractByWagmi(params as any);

      expect(result).toEqual(mockResult);
      expect(readContract).toHaveBeenCalledWith(EVMProviderConfig, params);
    });
  });
});
