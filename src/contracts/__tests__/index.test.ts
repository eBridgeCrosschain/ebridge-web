import { checkApprove } from 'contracts/index';
import { checkErcApprove } from 'contracts/ethereum';
import { checkELFApprove } from 'contracts/elf';
import { ContractBasic } from 'utils/contract';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock external dependencies
vi.mock('contracts/ethereum', () => ({
  checkErcApprove: vi.fn().mockResolvedValue(false),
}));

vi.mock('contracts/elf', () => ({
  checkELFApprove: vi.fn().mockResolvedValue(true),
}));

const mockTokenContract = {
  callSendMethod: vi.fn(),
} as unknown as ContractBasic;

describe('checkApprove', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('When tokenContract exists', () => {
    it('checkELFApprove should be called and return the correct value', async () => {
      const result = await checkApprove(
        1,
        'ELF_TOKEN_ADDRESS',
        'ACCOUNT_ADDRESS',
        'TARGET_ADDRESS',
        '100',
        '500',
        mockTokenContract,
      );

      expect(checkELFApprove).toHaveBeenCalledWith(
        'ELF_TOKEN_ADDRESS',
        'ACCOUNT_ADDRESS',
        'TARGET_ADDRESS',
        mockTokenContract,
        '100',
        '500',
      );
      expect(result).toBe(true);
    });

    it('optional parameters should be handled by default', async () => {
      await checkApprove(
        1,
        'ELF_TOKEN_ADDRESS',
        'ACCOUNT_ADDRESS',
        'TARGET_ADDRESS',
        undefined,
        undefined,
        mockTokenContract,
      );

      expect(checkELFApprove).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        undefined,
        undefined,
      );
    });
  });

  describe('When tokenContract does not exist', () => {
    it('checkErcApprove should be called and return the correct value', async () => {
      const result = await checkApprove(1, 'ERC20_TOKEN_ADDRESS', 'ACCOUNT_ADDRESS', 'TARGET_ADDRESS', '200');

      expect(checkErcApprove).toHaveBeenCalledWith(
        1,
        'ERC20_TOKEN_ADDRESS',
        'ACCOUNT_ADDRESS',
        'TARGET_ADDRESS',
        '200',
        undefined,
      );
      expect(result).toBe(false);
    });
  });

  describe('Exception handling', () => {
    it('should catch exceptions from checkELFApprove and return an error object', async () => {
      // Mock checkELFApprove to throw an error
      (checkELFApprove as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('approve error'));

      await expect(
        checkApprove(1, 'ELF_TOKEN_ADDRESS', 'ACCOUNT_ADDRESS', 'TARGET_ADDRESS', '100', '500', mockTokenContract),
      ).rejects.toThrow(Error('approve error'));
    });
  });
});
