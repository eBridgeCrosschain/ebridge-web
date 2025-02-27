import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import BigNumber from 'bignumber.js';
import { SupportedChainId, SupportedELFChainId } from 'constants/chain';
import { parseInputChange, parseMAXInputChange, sliceDecimals, getMaxAmount, handleInputFocus } from 'utils/input';
import { isAndroid } from '../isMobile';
import { TelegramPlatform } from '../telegram/telegram';
import { isELFChain } from '../aelfUtils';

vi.mock('../isMobile', () => ({
  isAndroid: vi.fn(() => true),
}));

vi.mock('../aelfUtils', () => {
  return {
    isELFChain: vi.fn(),
  };
});

vi.mock('../telegram/telegram', () => ({
  TelegramPlatform: {
    isTelegramPlatform: vi.fn(() => false),
  },
}));

vi.mock('../index', () => {
  return {
    sleep: vi.fn(),
  };
});

// Mock constants
const mockChainId = SupportedELFChainId.AELF;

// Attach the mock to the global document object
vi.mock('react-dom');

describe('Input Utils Functions', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('parseInputChange', () => {
    it('should parse input change correctly if input is greater than min', () => {
      const result = parseInputChange('123.456789', new BigNumber(100), 2);

      expect(result).toBe('123.45');
    });

    it('should parse input change correctly if input is not min', () => {
      const result = parseInputChange('123');

      expect(result).toBe('123');
    });

    it('should parse input change correctly if input is not maxLength', () => {
      const result = parseInputChange('123.456789', new BigNumber(100));

      expect(result).toBe('123.456789');
    });

    it('should parse input change correctly if input is negative', () => {
      const result = parseInputChange('-123.456789', new BigNumber(100));

      expect(result).toBe('-123.456789');
    });

    it('should parse input change correctly if input length is > 18 decimals', () => {
      const result = parseInputChange('123.12345678901234567890', new BigNumber(100));

      expect(result).toBe('123.123456789012345678');
    });

    it('should return min value if input is less than min', () => {
      const result = parseInputChange('50', new BigNumber(100));

      expect(result).toBe('100');
    });
  });

  describe('parseMAXInputChange', () => {
    it('should parse max input change correctly', () => {
      const result = parseMAXInputChange('123.456789', new BigNumber(200), new BigNumber(100), 2);

      expect(result).toBe('123.45');
    });

    it('should parse max input change correctly if input is not decimals', () => {
      const result = parseMAXInputChange('123', new BigNumber(200), new BigNumber(100), 2);

      expect(result).toBe('123');
    });

    it('should parse max input change correctly if input is negative', () => {
      const result = parseMAXInputChange('-123', new BigNumber(-100), new BigNumber(-200), 2);

      expect(result).toBe('-123');
    });

    it('should parse max input change correctly is input length is > 18 decimals', () => {
      const result = parseMAXInputChange('123.1234567890123456789', new BigNumber(200), new BigNumber(100));

      expect(result).toBe('123.123456789012345678');
    });

    it('should return max value if input is greater than max', () => {
      const result = parseMAXInputChange('300', new BigNumber(200));

      expect(result).toBe('200');
    });

    it('should return max value if input is greater than max and max is 0', () => {
      const result = parseMAXInputChange('300', new BigNumber(0));

      expect(result).toBe('0');
    });

    it('should return max value if input is less than min', () => {
      const result = parseMAXInputChange('100', new BigNumber(400), new BigNumber(200));

      expect(result).toBe('200');
    });
  });

  describe('sliceDecimals', () => {
    it('should slice decimals correctly', () => {
      const result = sliceDecimals('123.456789', 2);

      expect(result).toBe('123.45');
    });

    it('should slice decimals correctly', () => {
      const result = sliceDecimals('123', 2);

      expect(result).toBe('123');
    });

    it('should slice decimals correctly', () => {
      const result = sliceDecimals('-123');

      expect(result).toBe('-123');
    });

    it('should return empty string for invalid input', () => {
      const result = sliceDecimals(undefined, 2);

      expect(result).toBe('');
    });
  });

  describe('getMaxAmount', () => {
    it('should return max amount for ELF chain', () => {
      // Mock isELFChain return true
      (isELFChain as Mock).mockReturnValue(true);

      const result = getMaxAmount({
        chainId: mockChainId,
        symbol: 'ELF',
        balance: new BigNumber(100),
        crossFee: '0.1',
      });

      expect(result.toFixed()).toBe('99.8959');
    });

    it('should return max amount for ELF chain and not params', () => {
      // Mock isELFChain return true
      (isELFChain as Mock).mockReturnValue(true);

      const result = getMaxAmount({ symbol: 'ELF' });

      expect(result.toFixed()).toBe('0');
    });

    it('should return balance for non-ELF chain', () => {
      // Mock isELFChain return false
      (isELFChain as Mock).mockReturnValue(false);

      const result = getMaxAmount({
        chainId: SupportedChainId.MAINNET,
        symbol: 'ETH',
        balance: new BigNumber(100),
      });

      expect(result.toFixed()).toBe('100');
    });

    it('should return balance for non-ELF chain and not params', () => {
      // Mock isELFChain return false
      (isELFChain as Mock).mockReturnValue(false);

      const result = getMaxAmount({});

      expect(result.toFixed()).toBe('0');
    });
  });

  describe('handleInputFocus', () => {
    // Mock document object
    document.getElementById = vi.fn().mockImplementation(() => {
      return {
        scrollIntoView: vi.fn(),
      };
    });

    it('should scroll input into view on Android', async () => {
      // Mock TelegramPlatform.isTelegramPlatform and isAndroid method
      (TelegramPlatform.isTelegramPlatform as Mock).mockReturnValue(true);
      (isAndroid as Mock).mockReturnValue(true);

      await handleInputFocus('input-is-android');

      expect(isAndroid).toHaveBeenCalled();
    });

    it('should scroll input into view on Android', async () => {
      // Mock TelegramPlatform.isTelegramPlatform and isAndroid method
      (TelegramPlatform.isTelegramPlatform as Mock).mockReturnValue(true);
      (isAndroid as Mock).mockReturnValue(false);

      await handleInputFocus('input-not-android');

      expect(isAndroid).toHaveBeenCalled();
    });

    it('should scroll input into view on Android', async () => {
      // Mock TelegramPlatform.isTelegramPlatform and isAndroid method
      (TelegramPlatform.isTelegramPlatform as Mock).mockReturnValue(false);
      (isAndroid as Mock).mockReturnValue(true);

      await handleInputFocus('input-is-android');

      expect(isAndroid).toHaveBeenCalled();
    });

    it('should scroll input into view on Android', async () => {
      // Mock TelegramPlatform.isTelegramPlatform and isAndroid method
      (TelegramPlatform.isTelegramPlatform as Mock).mockReturnValue(false);
      (isAndroid as Mock).mockReturnValue(false);

      await handleInputFocus('input-not-android');

      expect(isAndroid).toHaveBeenCalled();
    });
  });
});
