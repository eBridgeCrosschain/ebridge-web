import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { SupportedELFChainId } from 'constants/chain';
import {
  getIconByChainId,
  getNameByChainId,
  getShortNameByChainId,
  getNativeTokenByChainId,
  getChainIdByAPI,
  getIconByAPIChainId,
  getChainIdToMap,
  base58ToChainId,
  chainIdToBase58,
  formatRestoreAddress,
  shortenAddressByAPI,
  formatNetworkName,
  getBridgeChainInfo,
  getChainName,
  getChainType,
  formatAddress,
} from 'utils/chain';
import { CHAIN_ICON, CHAIN_NAME } from 'constants/index';
import { isELFChain } from '../aelfUtils';
import { isTonChain, shortenAddress } from 'utils';

// Mock AElf
vi.mock('aelf-sdk', () => {
  // Mock AElf.utils.chainIdConvertor
  const mockChainIdConvertor = {
    base58ToChainId: vi.fn((chainId: string) => `base58_${chainId}`),
    chainIdToBase58: vi.fn((chainId: number) => `chainId_${chainId}`),
  };
  return {
    default: {
      utils: {
        chainIdConvertor: mockChainIdConvertor,
      },
    },
  };
});

vi.mock('utils', () => {
  return {
    enumToMap: vi.fn().mockReturnValue({ AELF: 'MainChain_AELF', MainChain_AELF: 'AELF', TonTest: '1100' }),
    isTonChain: vi.fn(),
    shortenAddress: vi.fn(),
  };
});

vi.mock('../aelfUtils', () => {
  return {
    isELFChain: vi.fn(),
  };
});

// Mock constants
const mockChainId = SupportedELFChainId.AELF;
const MainChain_AELF = 'MainChain_AELF';
const mockInvalidChainId = 'invalid_chain_id' as any;
const mockChainName = 'AELF';
const mockChainShortName = 'AELF';
const correctAelfAddress = 'ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_AELF';

describe('Chain Utils', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('getIconByChainId', () => {
    it('should return the correct icon for a valid chainId', () => {
      const result = getIconByChainId(mockChainId);

      expect(result).toEqual(CHAIN_ICON[mockChainId]);
    });

    it('should return undefined for an invalid chainId', () => {
      const result = getIconByChainId(mockInvalidChainId);

      expect(result).toBeUndefined();
    });
  });

  describe('getNameByChainId', () => {
    it('should return the correct name for a valid chainId', () => {
      const result = getNameByChainId(mockChainId);

      expect(result).toBe(CHAIN_NAME[mockChainId]);
    });

    it('should return "unknown chain" for an invalid chainId', () => {
      const result = getNameByChainId(undefined);

      expect(result).toBe('unknown chain');
    });
  });

  describe('getShortNameByChainId', () => {
    it('should return the correct short name for a valid chainId', () => {
      const result = getShortNameByChainId(mockChainId);

      expect(result).toBe(mockChainShortName);
    });

    it('should return "unknown chain" for an invalid chainId', () => {
      const result = getShortNameByChainId(undefined);

      expect(result).toBe('unknown chain');
    });

    it('should return chainId for not chainName', () => {
      const result = getShortNameByChainId('ETH' as any);

      expect(result).toBe('ETH');
    });
  });

  describe('getNativeTokenByChainId', () => {
    it('should return the correct native token for a valid chainId', () => {
      const result = getNativeTokenByChainId(mockChainId);

      expect(result).toBe(mockChainShortName);
    });

    it('should return "unknown chain" for an invalid chainId', () => {
      const result = getNativeTokenByChainId(undefined);

      expect(result).toBe('unknown chain');
    });

    it('should return chainId for not chainName', () => {
      const result = getNativeTokenByChainId('ETH' as any);

      expect(result).toBe('ETH');
    });
  });

  describe('getChainIdByAPI', () => {
    it('should return the correct chainId for a valid API chainId', () => {
      const result = getChainIdByAPI(mockChainId);

      expect(result).toBe('MainChain_AELF');
    });

    it('should return the number chainId for an number input', () => {
      const result = getChainIdByAPI('TonTest' as any);

      expect(result).toBe(1100);
    });

    it('should return the input chainId for an invalid API chainId', () => {
      const result = getChainIdByAPI(mockInvalidChainId);

      expect(result).toBe('invalid_chain_id');
    });
  });

  describe('getIconByAPIChainId', () => {
    it('should return the correct icon for a valid API chainId', () => {
      const result = getIconByAPIChainId(MainChain_AELF);

      expect(result).toEqual({ type: 'AELF-CHAIN' });
    });

    it('should return undefined for an invalid API chainId', () => {
      const result = getIconByAPIChainId(mockInvalidChainId);

      expect(result).toBeUndefined();
    });
  });

  describe('getChainIdToMap', () => {
    it('should return the correct chainId for a valid chainId', () => {
      const result = getChainIdToMap(mockChainId);

      expect(result).toBe(MainChain_AELF);
    });

    it('should return the input chainId for an invalid chainId', () => {
      const result = getChainIdToMap(mockInvalidChainId);

      expect(result).toBe('invalid_chain_id');
    });
  });

  describe('base58ToChainId', () => {
    it('should convert base58 to chainId', () => {
      const result = base58ToChainId('base58_chain_id' as any);

      expect(result).toBe('base58_base58_chain_id');
    });
  });

  describe('chainIdToBase58', () => {
    it('should convert chainId to base58', () => {
      const result = chainIdToBase58(123);

      expect(result).toBe('chainId_123');
    });
  });

  describe('formatRestoreAddress', () => {
    it('should format restore address correctly', () => {
      const result = formatRestoreAddress(mockChainId, 'ELF_address_123_AELF');

      expect(result).toBe('address_123');
    });

    it('should return empty string for invalid address', () => {
      const result = formatRestoreAddress(mockChainId, undefined);

      expect(result).toBe('');
    });
  });

  describe('formatAddress', () => {
    it('should format address correctly', () => {
      const result = formatAddress(mockChainId, 'address_123');

      expect(result).toBe('ELF_address_123_AELF');
    });

    it('should return empty string for invalid address or chainId', () => {
      const result1 = formatAddress(undefined, 'address_123');

      expect(result1).toBe('');

      const result2 = formatAddress(mockChainId, undefined);

      expect(result2).toBe('');
    });
  });

  describe('shortenAddressByAPI', () => {
    it('should shorten address correctly for ELF chain', () => {
      // Mock isELFChain and shortenAddress method
      (isELFChain as Mock).mockReturnValue(true);
      (shortenAddress as Mock).mockReturnValue('ELF_Py2T...AELF');

      const result = shortenAddressByAPI(correctAelfAddress, mockChainId, 6);

      expect(result).toBe('ELF_Py2T...AELF');
    });

    it('should shorten address correctly for non-ELF chain', () => {
      // Mock isELFChain and shortenAddress method
      (isELFChain as Mock).mockReturnValue(false);
      (shortenAddress as Mock).mockReturnValue('0x1234...');

      const result = shortenAddressByAPI('0x12345678', 'ETH' as any, 4);

      expect(result).toBe('0x1234...');
    });

    it('should return empty string for invalid address or chainId', () => {
      const result1 = shortenAddressByAPI(undefined, mockChainId, 4);

      expect(result1).toBe('');

      const result2 = shortenAddressByAPI('address_123', undefined, 4);

      expect(result2).toBe('');
    });
  });

  describe('formatNetworkName', () => {
    it('should format network name correctly for AELF', () => {
      const result = formatNetworkName(mockChainId);

      expect(result).toBe(CHAIN_NAME[mockChainId]);
    });

    it('should format network name correctly for tDVV', () => {
      const result = formatNetworkName('tDVV');

      expect(result).toBe(CHAIN_NAME['tDVV']);
    });

    it('should format network name correctly  for tDVW', () => {
      const result = formatNetworkName('tDVW');

      expect(result).toBe(CHAIN_NAME['tDVW']);
    });

    it('should return the input item for unsupported chainId', () => {
      const result = formatNetworkName('unsupported_chain_id');

      expect(result).toBe('unsupported_chain_id');
    });
  });

  describe('getBridgeChainInfo', () => {
    it('should return ELF chain info for ELF chainId', () => {
      // Mock isELFChain  method
      (isELFChain as Mock).mockReturnValue(true);

      const result = getBridgeChainInfo(mockChainId);

      expect(result).toBeDefined();
    });

    it('should return TON chain info for TON chainId', () => {
      // Mock isELFChain and isTonChain method
      (isELFChain as Mock).mockReturnValue(false);
      (isTonChain as unknown as Mock).mockReturnValue(true);

      const result = getBridgeChainInfo(1100 as any);

      expect(result).toBeDefined();
    });

    it('should return ERC chain info for ERC chainId', () => {
      // Mock isELFChain and isTonChain method
      (isELFChain as Mock).mockReturnValue(false);
      (isTonChain as unknown as Mock).mockReturnValue(false);

      const result = getBridgeChainInfo(1 as any);

      expect(result).toBeDefined();
    });
  });

  describe('getChainName', () => {
    it('should return the correct chain name', () => {
      const result = getChainName(mockChainId);

      expect(result).toBe(CHAIN_NAME[mockChainName]);
    });
  });

  describe('getChainType', () => {
    it('should return "ELF" for ELF chainId', () => {
      // Mock isELFChain method
      (isELFChain as Mock).mockReturnValue(true);

      const result = getChainType(mockChainId);

      expect(result).toBe('ELF');
    });

    it('should return "TON" for TON chainId', () => {
      // Mock isELFChain and isTonChain method
      (isELFChain as Mock).mockReturnValue(false);
      (isTonChain as unknown as Mock).mockReturnValue(true);

      const result = getChainType(1100 as any);

      expect(result).toBe('TON');
    });

    it('should return "ERC" for ERC chainId', () => {
      // Mock isELFChain and isTonChain method
      (isELFChain as Mock).mockReturnValue(false);
      (isTonChain as unknown as Mock).mockReturnValue(false);

      const result = getChainType(1 as any);

      expect(result).toBe('ERC');
    });
  });
});
