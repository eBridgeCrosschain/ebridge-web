import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupportedChainId, SupportedELFChainId, SupportedTONChainId } from 'constants/chain';
import AElf from 'aelf-sdk';
import { getAddress } from '@ethersproject/address';
import {
  sleep,
  getExploreLink,
  shortenAddress,
  shortenString,
  unityTokenInfo,
  getTokenLogoURL,
  enumToMap,
  isERCAddress,
  isELFAddress,
  formatAddress,
  formatNativeToken,
  isIncludesChainId,
  isTonChain,
  isAddress,
  isChainAddress,
} from 'utils/index';
import { isELFChain } from '../aelfUtils';
import { isTonAddress } from 'utils/ton';

// Mock external dependencies
vi.mock('@ethersproject/address', () => ({
  getAddress: vi.fn((address: string) => address),
}));

vi.mock('aelf-sdk', () => {
  return {
    default: {
      utils: {
        decodeAddressRep: vi.fn((address: string) => address),
      },
    },
  };
});

vi.mock('../ton', () => ({
  isTonAddress: vi.fn((address: string) => address.startsWith('TON_')),
}));

vi.mock('../aelfUtils', () => {
  return {
    isELFChain: vi.fn(),
  };
});

// Mock ELFChainConstants and ERCChainConstants
vi.mock('constants/ChainConstants', () => {
  const mockExploreUrl = 'https://testnet.aelfscan.io/AELF/';
  const mockBaseScanUrl = 'https://basescan.org/';

  return {
    ELFChainConstants: {
      constants: {
        [SupportedELFChainId.AELF]: {
          CHAIN_INFO: {
            exploreUrl: mockExploreUrl,
          },
        },
      },
    },
    ERCChainConstants: {
      constants: {
        CHAIN_INFO: {
          exploreUrl: mockBaseScanUrl,
        },
      },
    },
  };
});

// Mock SupportedExternalChain
vi.mock('constants/index', async (importOriginal) => {
  const actual: any = await importOriginal();
  const mockEtherscanUrl = 'https://etherscan.io/';
  const mockTestnetTonViewerUrl = 'https://testnet.tonviewer.com/';

  return {
    ...actual,
    SupportedExternalChain: {
      [SupportedChainId.MAINNET]: {
        CHAIN_INFO: {
          exploreUrl: mockEtherscanUrl,
        },
      },
      [SupportedTONChainId.TESTNET]: {
        CHAIN_INFO: {
          exploreUrl: mockTestnetTonViewerUrl,
        },
      },
    },
  };
});

// Mock constants
const mockChainId = SupportedELFChainId.AELF;
const mockAELFExplorerUrl = 'https://testnet.aelfscan.io/AELF/';
const mockEtherscanUrl = 'https://etherscan.io/';
const mockBaseScanUrl = 'https://basescan.org/';
const mockTestnetTonViewerUrl = 'https://testnet.tonviewer.com/';
const mockTokenInfo = {
  decimals: 18,
  symbol: 'ELF',
  tokenName: 'AELF Token',
  address: 'ELF_address',
  issueChainId: 1,
  issuer: 'AELF',
  isBurnable: true,
  totalSupply: 1000000000,
};
const correctAelfAddress = 'ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_AELF';
const correctTDVVAddress = 'ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_tDVV';
const correctTDVWAddress = 'ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_tDVW';
const assetsUrl = 'https://raw.githubusercontent.com/eBridgeCrosschain/assets/master/blockchains/AELF/assets';

describe('Index Utils Functions', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('sleep', () => {
    it('should resolve after the specified time', async () => {
      const time = 1000;
      const result = await sleep(time);
      expect(result).toBe('sleep');
    });
  });

  describe('getExploreLink', () => {
    it('should return transaction link for ELF chain', () => {
      // Mock the isELFChain function return true
      vi.mocked(isELFChain).mockReturnValueOnce(true);

      const link = getExploreLink('tx_hash', 'transaction', mockChainId);
      expect(link).toBe(`${mockAELFExplorerUrl}tx/tx_hash`);
    });

    it('should return token link for ERC chain if type is token', () => {
      // Mock the isELFChain function return false
      vi.mocked(isELFChain).mockReturnValueOnce(false);

      const link = getExploreLink('erc_token_address', 'token', SupportedChainId.MAINNET);
      expect(link).toBe(`${mockEtherscanUrl}token/erc_token_address`);
    });

    it('should return token link for ERC chain if type is address', () => {
      // Mock the isELFChain function return false
      vi.mocked(isELFChain).mockReturnValueOnce(false);

      const link = getExploreLink('erc_token_address', 'address', SupportedChainId.MAINNET);
      expect(link).toBe(`${mockEtherscanUrl}address/erc_token_address`);
    });

    it('should return token link for BASE chain', () => {
      // Mock the isELFChain function return false
      vi.mocked(isELFChain).mockReturnValueOnce(false);

      const link = getExploreLink('base_token_address', 'token', SupportedChainId.BASE);
      expect(link).toBe(`${mockBaseScanUrl}token/base_token_address`);
    });

    it('should return address link for TON chain if type is address', () => {
      // Mock the isELFChain function return false
      vi.mocked(isELFChain).mockReturnValueOnce(false);

      const link = getExploreLink('TON_address', 'address', SupportedTONChainId.TESTNET);
      expect(link).toBe(`${mockTestnetTonViewerUrl}TON_address`);
    });

    it('should return address link for TON chain if type is transaction', () => {
      // Mock the isELFChain function return false
      vi.mocked(isELFChain).mockReturnValueOnce(false);

      const link = getExploreLink('TON_address', 'transaction', SupportedTONChainId.TESTNET);
      expect(link).toBe(`${mockTestnetTonViewerUrl}transaction/4ce37f69d76b7acb`);
    });

    it('should return block link for default chain', () => {
      // Mock the isELFChain function return false
      vi.mocked(isELFChain).mockReturnValueOnce(false);

      const link = getExploreLink('block_hash', 'block', SupportedChainId.MAINNET);
      expect(link).toBe(`${mockEtherscanUrl}block/block_hash`);
    });
  });

  describe('shortenAddress', () => {
    it('should shorten address correctly', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const shortened = shortenAddress(address, 6);
      expect(shortened).toBe('0x123456...567890');
    });

    it('should throw error for invalid address', () => {
      expect(() => shortenAddress(null, 4)).toThrow("Invalid 'address' parameter 'null'.");
    });
  });

  describe('shortenString', () => {
    it('should shorten string correctly', () => {
      const str = 'This is a long string';
      const shortened = shortenString(str, 5);
      expect(shortened).toBe('This ...tring');
    });

    it('should return empty string for invalid input', () => {
      expect(shortenString(null, 5)).toBe('');
    });
  });

  describe('unityTokenInfo', () => {
    it('should return unified token info', () => {
      const result = unityTokenInfo(mockTokenInfo);
      expect(result).toEqual(mockTokenInfo);
    });

    it('should return undefined for invalid input', () => {
      const result = unityTokenInfo(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('getTokenLogoURL', () => {
    it('should return token logo URL for aelf MainChain address', () => {
      const url = getTokenLogoURL(correctAelfAddress, mockChainId);
      expect(url).toBe(`${assetsUrl}/${correctAelfAddress}/logo.png`);
    });

    it('should return token logo URL for testnet aelf dappChain address', () => {
      const url = getTokenLogoURL(correctTDVWAddress, 'tDVV' as any);
      expect(url).toBe(`${assetsUrl}/${correctTDVWAddress}/logo.png`);
    });

    it('should return token logo URL for aelf dappChain address', () => {
      const url = getTokenLogoURL(correctTDVVAddress, 'tDVV' as any);
      expect(url).toBe(`${assetsUrl}/${correctTDVVAddress}/logo.png`);
    });

    it('should return token logo URL for KOVAN address', () => {
      const address = 'mock_kovan_address';
      const url = getTokenLogoURL(address, SupportedChainId.KOVAN);
      expect(url).toBe(`${assetsUrl}/${address}/logo.png`);
    });

    it('should return token logo URL for SEPOLIA address', () => {
      const address = 'mock_sepolia_address';
      const url = getTokenLogoURL(address, SupportedChainId.SEPOLIA);
      expect(url).toBe(`${assetsUrl}/${address}/logo.png`);
    });

    it('should return token logo URL for BSC_TESTNET address', () => {
      const address = 'mock_bsc_testnet_address';
      const url = getTokenLogoURL(address, SupportedChainId.BSC_TESTNET);
      expect(url).toBe(`${assetsUrl}/${address}/logo.png`);
    });

    it('should return token logo URL for default chain address', () => {
      const address = 'mock_default_address';
      const url = getTokenLogoURL(address);

      expect(url).toBe(`${assetsUrl}/${address}/logo.png`);
    });

    it('should return empty string for invalid address', () => {
      const result = getTokenLogoURL(undefined, mockChainId);
      expect(result).toBe('');
    });
  });

  describe('enumToMap', () => {
    it('should convert enum to map', () => {
      const enumObj = { A: 1, B: 2 };
      const map = enumToMap(enumObj);

      expect(map).toEqual({ A: 1, B: 2, 1: 'A', 2: 'B' });
    });
  });

  describe('isERCAddress', () => {
    it('should return true for valid ERC address', () => {
      const result = isERCAddress('0x123');
      expect(result).toBe(true);
    });

    it('should return false for invalid ERC address', () => {
      // Mock getAddress throw error
      vi.mocked(getAddress).mockImplementationOnce(() => {
        throw new Error('Invalid address');
      });

      const result = isERCAddress('invalid');
      expect(result).toBe(false);
    });
  });

  describe('isELFAddress', () => {
    it('should return true for valid ELF address', () => {
      const result = isELFAddress(correctAelfAddress);
      expect(result).toBe(true);
    });

    it('should return false for invalid ELF address only with prefix', () => {
      const result = isELFAddress('ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft');
      expect(result).toBe(true);
    });

    it('should return false for invalid ELF address only with suffix', () => {
      const result = isELFAddress('Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_AELF');
      expect(result).toBe(true);
    });

    it('should return false for invalid ELF address', () => {
      // Mock AElf.utils.decodeAddressRep throw error
      vi.mocked(AElf.utils.decodeAddressRep).mockImplementationOnce(() => {
        throw new Error('Invalid address');
      });
      const result = isELFAddress('invalidELFAddress');
      expect(result).toBe(false);
    });

    it('should return false for addresses containing Chinese characters', () => {
      const result = isELFAddress('invalid漢');
      expect(result).toBe(false);
    });
  });

  describe('isAddress', () => {
    it('should return true for valid ELF address', () => {
      const result = isAddress(correctAelfAddress, mockChainId);
      expect(result).toBe(true);
    });

    it('should return false for valid ERC address', () => {
      const result = isAddress('0x123', SupportedChainId.MAINNET);
      expect(result).toBe(true);
    });

    it('should return false for invalid address', () => {
      const result = isAddress('invalid', mockChainId);
      expect(result).toBe(true);
    });
  });

  describe('isChainAddress', () => {
    it('should return true for valid ELF address', () => {
      // Mock the isELFChain function return true
      vi.mocked(isELFChain).mockReturnValueOnce(true);

      const result = isChainAddress(correctAelfAddress, mockChainId);
      expect(result).toBe(true);
    });

    it('should return false for valid ERC address', () => {
      // Mock the isELFChain function return false
      vi.mocked(isELFChain).mockReturnValueOnce(false);

      const result = isChainAddress('0x123', SupportedChainId.MAINNET);
      expect(result).toBe(true);
    });

    it('should return false for valid TON address', () => {
      // Mock isTonAddress function return true
      vi.mocked(isTonAddress).mockReturnValueOnce(true);

      const result = isChainAddress('ton_address', SupportedTONChainId.TESTNET);
      expect(result).toBe(true);
    });

    it('should return false for not match aelf chain address', () => {
      // Mock the isELFChain function return true
      vi.mocked(isELFChain).mockReturnValueOnce(true);

      const result = isChainAddress(correctTDVWAddress, mockChainId);
      expect(result).toBe(false);
    });

    it('should return false for invalid address', () => {
      const result = isChainAddress('invalid', mockChainId);
      expect(result).toBe(true);
    });

    it('should return false if not params', () => {
      const result = isChainAddress();
      expect(result).toBe(false);
    });
  });

  describe('formatAddress', () => {
    it('should format address correctly', () => {
      const address = 'ELF_123_AELF';

      const result = formatAddress(address);
      expect(result).toBe('123');
    });
  });

  describe('formatNativeToken', () => {
    it('should format native token symbol', () => {
      expect(formatNativeToken('ELF')).toBe('ELF');
      expect(formatNativeToken('SGR-1')).toBe('SGR');
      expect(formatNativeToken('USDT')).toBe('USDT');
      expect(formatNativeToken('USDT-1')).toBe('USDT-1');
      expect(formatNativeToken('WETH')).toBe('ETH');
    });

    it('should return undefined for invalid input', () => {
      const result = formatNativeToken(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('isIncludesChainId', () => {
    it('should return true if chainId is included in list', () => {
      const result = isIncludesChainId([mockChainId], mockChainId);
      expect(result).toBe(true);
    });

    it('should return false if chainId is undefined', () => {
      const result = isIncludesChainId([mockChainId]);
      expect(result).toBe(false);
    });

    it('should return false if chainId is not included in list', () => {
      const result = isIncludesChainId([SupportedChainId.MAINNET], mockChainId);
      expect(result).toBe(false);
    });

    it('should return false if chainId !== list', () => {
      const result = isIncludesChainId(SupportedChainId.MAINNET, mockChainId);
      expect(result).toBe(false);
    });

    it('should return true if chainId === list', () => {
      const result = isIncludesChainId(SupportedChainId.MAINNET, SupportedChainId.MAINNET);
      expect(result).toBe(true);
    });
  });

  describe('isTonChain', () => {
    it('should return true for TON chainId', () => {
      const result = isTonChain(SupportedTONChainId.TESTNET);
      expect(result).toBe(true);
    });

    it('should return false for non-TON chainId', () => {
      const result = isTonChain(mockChainId);
      expect(result).toBe(false);
    });
  });
});
