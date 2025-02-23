import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addLiquidity, removeLiquidity, getTotalLiquidity, getMyLiquidity } from '../pools';
import { ChainId, TokenInfo } from 'types';
import { ContractBasic } from '../contract';
import { checkApprove } from 'contracts';
import { provider } from 'web3-core';
import { REQ_CODE } from 'constants/misc';
import { getBalanceByWagmi, readContractByWagmi } from '../wagmi';
import { POOLS_ABI } from 'constants/abis';
import { isELFChain } from '../aelfUtils';
import { getTokenInfoByWhitelist } from '../whitelist';

// Mock external dependencies
vi.mock('../whitelist', () => ({
  getTokenInfoByWhitelist: vi.fn(),
}));

vi.mock('../calculate', () => ({
  timesDecimals: vi.fn((amount: string, decimals?: number) => ({
    toFixed: () => (decimals ? amount.padEnd(decimals, '0') : amount),
  })),
}));

vi.mock('../aelfUtils', () => ({
  isELFChain: vi.fn(),
}));

vi.mock('contracts', () => ({
  checkApprove: vi.fn(),
}));

vi.mock('../contract');
// vi.mock('../contract', () => ({
//   ContractBasic: vi.fn(() => ({
//     callSendMethod: vi.fn(),
//     callViewMethod: vi.fn(),
//     address: '0xPoolContract',
//     contractType: 'ELF',
//     chainId: 1,
//   })),
// }));

vi.mock('../wagmi', () => ({
  getBalanceByWagmi: vi.fn(),
  readContractByWagmi: vi.fn(),
}));

const mockProvider = {} as provider;
const mockTokenInfo: TokenInfo = {
  symbol: 'ELF',
  decimals: 8,
  isNativeToken: false,
  address: '0xToken',
};

describe('Liquidity Functions', () => {
  const mockAccount = '0xAccount';
  const mockAmount = '100';
  const mockChainId = 1 as ChainId;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(checkApprove).mockResolvedValue(REQ_CODE.Success);
  });

  describe('addLiquidity', () => {
    it('should handle aelf chain native token flow', async () => {
      // Setup aelf chain environment
      vi.mocked(isELFChain).mockReturnValue(true);
      vi.mocked(getTokenInfoByWhitelist).mockReturnValue({
        ...mockTokenInfo,
        isNativeToken: true,
      });

      const mockCallSendMethod = vi.fn().mockResolvedValue({ status: 'success', transactionHash: '0xTxHash' });

      // Execute function
      const result = await addLiquidity({
        account: mockAccount,
        amount: mockAmount,
        chainId: mockChainId,
        poolContract: { callSendMethod: mockCallSendMethod } as unknown as ContractBasic,
        library: mockProvider,
      });

      // Verify native token handling
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('transactionHash', '0xTxHash');
      expect(mockCallSendMethod).toHaveBeenCalledWith('addLiquidity', mockAccount, {
        tokenSymbol: 'ELF',
        amount: '10000000',
      });
      expect(checkApprove).not.toHaveBeenCalled();
    });

    it('should handle aelf chain non-native token flow', async () => {
      // Setup aelf chain environment
      vi.mocked(isELFChain).mockReturnValue(true);
      vi.mocked(getTokenInfoByWhitelist).mockReturnValue({
        ...mockTokenInfo,
        symbol: 'USDT',
      });

      const mockCallSendMethod = vi.fn().mockResolvedValue({ status: 'success', transactionHash: '0xTxHash' });

      // Execute function
      const result = await addLiquidity({
        account: mockAccount,
        amount: mockAmount,
        chainId: mockChainId,
        poolContract: { callSendMethod: mockCallSendMethod } as unknown as ContractBasic,
        library: mockProvider,
      });

      // Verify native token handling
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('transactionHash', '0xTxHash');
      expect(mockCallSendMethod).toHaveBeenCalledWith('addLiquidity', mockAccount, {
        tokenSymbol: 'USDT',
        amount: '10000000',
      });
    });

    it('should handle EVM chain ERC20 token flow', async () => {
      // Setup EVM environment
      vi.mocked(isELFChain).mockReturnValue(false);
      vi.mocked(getTokenInfoByWhitelist).mockReturnValue(mockTokenInfo);

      const mockCallSendMethod = vi.fn().mockResolvedValue({ status: 'success', transactionHash: '0xTxHash' });

      // Execute function
      const result = await addLiquidity({
        account: mockAccount,
        amount: mockAmount,
        chainId: mockChainId,
        poolContract: { callSendMethod: mockCallSendMethod } as unknown as ContractBasic,
        library: mockProvider,
      });

      expect(result.status).toBe('success');
      expect(result.transactionHash).toBe('0xTxHash');
      // Verify ERC20 approval check
      expect(checkApprove).toHaveBeenCalledWith(
        mockProvider,
        '0xToken',
        mockAccount,
        '',
        '10000000',
        undefined,
        undefined,
      );
    });

    it('should handle EVM chain ERC20 native token flow', async () => {
      // Setup EVM environment
      vi.mocked(isELFChain).mockReturnValue(false);
      vi.mocked(getTokenInfoByWhitelist).mockReturnValue({ ...mockTokenInfo, symbol: 'ETH', isNativeToken: true });

      const mockCallSendMethod = vi.fn().mockResolvedValue({ status: 'success', transactionHash: '0xTxHash' });

      // Execute function
      const result = await addLiquidity({
        account: mockAccount,
        amount: mockAmount,
        chainId: mockChainId,
        poolContract: { callSendMethod: mockCallSendMethod } as unknown as ContractBasic,
        library: mockProvider,
      });

      expect(result.status).toBe('success');
      expect(result.transactionHash).toBe('0xTxHash');
    });

    it('should return correctly if input empty tokenInfo', async () => {
      vi.mocked(isELFChain).mockReturnValue(false);
      vi.mocked(getTokenInfoByWhitelist).mockReturnValue(mockTokenInfo);

      const mockCallSendMethod = vi.fn().mockResolvedValue({ status: 'success', transactionHash: '0xTxHash' });

      // Execute function
      const result = await addLiquidity({
        account: mockAccount,
        amount: mockAmount,
        chainId: mockChainId,
        poolContract: { callSendMethod: mockCallSendMethod } as unknown as ContractBasic,
        library: mockProvider,
        tokenInfo: {} as any,
      });

      expect(result.status).toBe('success');
      expect(result.transactionHash).toBe('0xTxHash');
      // Verify ERC20 approval check
      expect(checkApprove).toHaveBeenCalledWith(
        mockProvider,
        '0xToken',
        mockAccount,
        '',
        '10000000',
        undefined,
        undefined,
      );
      expect(checkApprove).toHaveBeenCalled();
    });

    it('should throw error when approval fails', async () => {
      // Setup failed approval
      vi.mocked(checkApprove).mockResolvedValue(REQ_CODE.Fail);
      vi.mocked(isELFChain).mockReturnValue(false);

      const mockCallSendMethod = vi.fn().mockResolvedValue({ status: 'error', transactionHash: '' });

      // Verify error throwing
      await expect(
        addLiquidity({
          account: mockAccount,
          amount: mockAmount,
          chainId: mockChainId,
          poolContract: { callSendMethod: mockCallSendMethod } as unknown as ContractBasic,
          library: mockProvider,
        }),
      ).rejects.toThrow('Failed to add liquidity');
    });

    it('should handle missing token info', async () => {
      // Test missing token info scenario
      vi.mocked(getTokenInfoByWhitelist).mockReturnValue(undefined);

      const mockCallSendMethod = vi.fn().mockRejectedValue({ status: 'error', transactionHash: '' });

      await expect(
        addLiquidity({
          symbol: 'UNKNOWN',
          account: mockAccount,
          amount: mockAmount,
          chainId: mockChainId,
          poolContract: { callSendMethod: mockCallSendMethod } as unknown as ContractBasic,
          library: mockProvider,
        }),
      ).rejects.toThrow();
    });
  });

  describe('removeLiquidity', () => {
    const mockCallSendMethod = vi.fn().mockResolvedValue({ status: 'success', transactionHash: '0xTxHash' });

    it('should handle aelf chain removal', async () => {
      // Setup aelf chain environment
      vi.mocked(isELFChain).mockReturnValue(true);
      vi.mocked(getTokenInfoByWhitelist).mockReturnValue({
        ...mockTokenInfo,
        isNativeToken: true,
      });

      // Execute function
      const result = await removeLiquidity({
        account: mockAccount,
        amount: mockAmount,
        chainId: mockChainId,
        poolContract: { callSendMethod: mockCallSendMethod } as unknown as ContractBasic,
      });

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('transactionHash', '0xTxHash');

      // Verify ELF-specific call
      expect(mockCallSendMethod).toHaveBeenCalledWith('removeLiquidity', mockAccount, {
        tokenSymbol: 'ELF',
        amount: '10000000',
      });
    });

    it('should handle EVM chain removal', async () => {
      // Setup EVM environment
      vi.mocked(isELFChain).mockReturnValue(false);
      vi.mocked(getTokenInfoByWhitelist).mockReturnValue({
        ...mockTokenInfo,
        isNativeToken: false,
      });

      // Execute function
      const result = await removeLiquidity({
        account: mockAccount,
        amount: mockAmount,
        chainId: mockChainId,
        poolContract: { callSendMethod: mockCallSendMethod } as unknown as ContractBasic,
        tokenInfo: mockTokenInfo,
      });

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('transactionHash', '0xTxHash');

      // Verify EVM-specific call
      expect(mockCallSendMethod).toHaveBeenCalledWith('removeLiquidity', mockAccount, ['0xToken', '10000000']);
    });
  });

  describe('getTotalLiquidity', () => {
    it('should handle aelf chain total liquidity', async () => {
      // Setup aelf chain environment
      const elfContract = {
        contractType: 'ELF',
        callViewMethod: vi.fn().mockResolvedValue({ totalSupply: '1000' }),
      } as unknown as ContractBasic;

      // Execute function
      const result = await getTotalLiquidity({
        poolContract: elfContract,
        symbol: 'ELF',
      });

      // Verify view method call
      expect(elfContract.callViewMethod).toHaveBeenCalledWith('GetTokenPoolInfo', { tokenSymbol: 'ELF' });
      expect(result).toBeUndefined();
    });

    it('should handle EVM chain total liquidity', async () => {
      // Setup EVM environment
      const evmContract = {
        contractType: 'EVM',
        callViewMethod: vi.fn().mockResolvedValue({ totalSupply: '1000' }),
      } as unknown as ContractBasic;

      // Mock balance response
      vi.mocked(getBalanceByWagmi).mockResolvedValue({
        value: BigInt(9007199254740991),
        decimals: 6,
        formatted: '',
        symbol: 'ETH',
      });

      // Execute function
      const result = await getTotalLiquidity({
        poolContract: evmContract,
        tokenContract: { address: '0xToken', chainId: 1 },
      });

      // Verify wagmi call
      expect(getBalanceByWagmi).toHaveBeenCalled();
      expect(result).toBe('9007199254740991');
    });

    it('should catch error if callViewMethod rejected', async () => {
      // Setup aelf chain environment
      const elfContract = {
        contractType: 'ELF',
        callViewMethod: vi.fn().mockRejectedValue('Failed to get token pool info'),
      } as unknown as ContractBasic;

      // Execute function
      await expect(
        getTotalLiquidity({
          poolContract: elfContract,
          symbol: 'ELF',
        }),
      ).rejects.toThrow('Failed to get token pool info');

      // Verify view method call
      expect(elfContract.callViewMethod).toHaveBeenCalledWith('GetTokenPoolInfo', { tokenSymbol: 'ELF' });
    });

    it('should catch error if callViewMethod return error', async () => {
      // Setup aelf chain environment
      const elfContract = {
        contractType: 'ELF',
        callViewMethod: vi.fn().mockResolvedValue({ error: 'Failed to get token pool info' }),
      } as unknown as ContractBasic;

      // Execute function
      await expect(
        getTotalLiquidity({
          poolContract: elfContract,
          symbol: 'ELF',
        }),
      ).rejects.toThrow('Failed to get token pool info');

      // Verify view method call
      expect(elfContract.callViewMethod).toHaveBeenCalledWith('GetTokenPoolInfo', { tokenSymbol: 'ELF' });
    });
  });

  describe('getMyLiquidity', () => {
    it('should handle aelf chain user liquidity', async () => {
      // Setup aelf chain environment
      const elfContract = {
        contractType: 'ELF',
        callViewMethod: vi.fn().mockResolvedValue({ value: { Liquidity: '1000' } }),
      } as unknown as ContractBasic;

      // Execute function
      const result = await getMyLiquidity({
        poolContract: elfContract,
        account: mockAccount,
        tokenInfo: mockTokenInfo,
      });

      // Verify view method call
      expect(elfContract.callViewMethod).toHaveBeenCalledWith('GetLiquidity', {
        tokenSymbol: 'ELF',
        provider: mockAccount,
      });
      expect(result).toHaveProperty('Liquidity', '1000');
    });

    it('should throw error if callViewMethod return errro', async () => {
      // Setup aelf chain environment
      const elfContract = {
        contractType: 'ELF',
        callViewMethod: vi.fn().mockResolvedValue({ error: 'Failed to get liquidity' }),
      } as unknown as ContractBasic;

      // Execute function
      await expect(
        getMyLiquidity({
          poolContract: elfContract,
          account: mockAccount,
          tokenInfo: mockTokenInfo,
        }),
      ).rejects.toThrow('Failed to get liquidity');

      // Verify view method call
      expect(elfContract.callViewMethod).toHaveBeenCalledWith('GetLiquidity', {
        tokenSymbol: 'ELF',
        provider: mockAccount,
      });
    });

    it('should handle EVM chain user liquidity', async () => {
      // Setup EVM environment
      const evmContract = {
        contractType: 'EVM',
      } as unknown as ContractBasic;

      // Mock contract response
      vi.mocked(readContractByWagmi).mockResolvedValue(200);

      // Execute function
      const result = await getMyLiquidity({
        poolContract: evmContract,
        account: mockAccount,
        tokenInfo: mockTokenInfo,
      });

      // Verify contract call
      expect(readContractByWagmi).toHaveBeenCalledWith({
        abi: POOLS_ABI,
        functionName: 'getUserLiquidity',
        address: undefined,
        chainId: undefined,
        args: [mockAccount, '0xToken'],
      });
      expect(result).toBe('200');
    });
  });
});
