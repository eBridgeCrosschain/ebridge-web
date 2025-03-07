import { CHAIN_ID_MAP, SupportedChainId, SupportedTONChainId } from 'constants/chain';
import { SupportedELFChainList } from 'constants/index';
import { getPortkeySDKAccount, isEVMChain, isTONChain } from 'utils/wallet';
import { describe, it, expect } from 'vitest';

describe('getPortkeySDKAccount', () => {
  it('should generate ELF addresses for all supported chains', () => {
    const accounts = getPortkeySDKAccount({ main: '0x123' });
    SupportedELFChainList.forEach((chain) => {
      const chainId = chain.CHAIN_INFO.chainId;
      expect(accounts[chainId][0]).toMatch(/ELF_0x123_/);
    });
  });

  it('should generate incorrect ELF addresses if input is empty', () => {
    const accounts = getPortkeySDKAccount({});
    expect(accounts);

    SupportedELFChainList.forEach((chain) => {
      const chainId = chain.CHAIN_INFO.chainId;
      expect(accounts[chainId][0]).toBe(`ELF__${chainId}`);
    });
  });

  it('should throw error for invalid input', () => {
    expect(() => getPortkeySDKAccount()).toThrow('accounts invalid');
  });
});

describe('isEVMChain', () => {
  it('should return true if input is EVM chains', () => {
    const result = isEVMChain(CHAIN_ID_MAP[SupportedChainId.MAINNET]);
    expect(result).toBe(true);
  });

  it('should return false if input is not EVM chains', () => {
    const result = isEVMChain('AELF');
    expect(result).toBe(false);
  });
});

describe('isTONChain', () => {
  it('should return true if input is TON chains', () => {
    const result = isTONChain(CHAIN_ID_MAP[SupportedTONChainId.TESTNET]);
    expect(result).toBe(true);
  });

  it('should return true if input is not TON chains', () => {
    const result = isTONChain('AELF');
    expect(result).toBe(false);
  });
});
