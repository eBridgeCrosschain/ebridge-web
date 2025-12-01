import BigNumber from 'bignumber.js';
import {
  fixedDecimal,
  fixedDecimalToFormat,
  unitConverter,
  unitConverterToFormat,
  getShareOfPool,
  percentConverter,
  showUSDConverter,
} from 'utils/converter';
import { describe, it, expect } from 'vitest';

describe('Chain Utils', () => {
  describe('fixedDecimal', () => {
    it('should return fixed decimal value', () => {
      const result = fixedDecimal({ num: '123.456789', decimals: 2 });

      expect(result).toBe('123.45');
    });

    it('should return fixed decimal value if num is number', () => {
      const result = fixedDecimal({ num: 123, decimals: 2 });

      expect(result).toBe('123');
    });

    it('should return fixed decimal value if num is undefined', () => {
      const result = fixedDecimal({ num: undefined, decimals: 2 });

      expect(result).toBe('0');
    });

    it('should return fixed decimal value if num is negative', () => {
      const result = fixedDecimal({ num: -123, decimals: 2 });

      expect(result).toBe('-123');
    });

    it('should return "0" for invalid input', () => {
      const result = fixedDecimal({ num: 'invalid', decimals: 2 });

      expect(result).toBe('0');
    });
  });

  describe('fixedDecimalToFormat', () => {
    it('should return formatted decimal value', () => {
      const result = fixedDecimalToFormat({ num: '123.456789', decimals: 2 });

      expect(result).toBe('123.45');
    });

    it('should return formatted decimal value if num is undefined', () => {
      const result = fixedDecimalToFormat({ num: undefined, decimals: 2 });

      expect(result).toBe('0');
    });

    it('should return formatted decimal value if num is negative', () => {
      const result = fixedDecimalToFormat({ num: -123, decimals: 2 });

      expect(result).toBe('-123');
    });

    it('should return "0" for invalid input', () => {
      const result = fixedDecimalToFormat({ num: 'invalid', decimals: 2 });

      expect(result).toBe('0');
    });
  });

  describe('unitConverter', () => {
    it('should convert number to unit format', () => {
      const result = unitConverter({ num: '123456789', decimals: 2 });

      expect(result).toBe('123.45M');
    });

    it('should return formatted decimal value if num is negative string', () => {
      const result = unitConverter({ num: '-123456789', decimals: 2 });

      expect(result).toBe('-123.456789M');
    });

    it('should return formatted decimal value if num is negative', () => {
      const result = unitConverter({ num: -123, decimals: 2 });

      expect(result).toBe('-123');
    });

    it('should return formatted decimal value if num is undefined', () => {
      const result = unitConverter({ num: undefined, decimals: 2 });

      expect(result).toBe('0');
    });

    it('should return formatted decimal value if num is number', () => {
      const result = unitConverter(123);

      expect(result).toBe('123');
    });

    it('should return formatted decimal value if num is BigNumber', () => {
      const result = unitConverter(new BigNumber(123));

      expect(result).toBe('123');
    });

    it('should return formatted decimal value if num is > 1e3', () => {
      const result = unitConverter({ num: '123456789', skipConverterIndex: 10 });

      expect(result).toBe('123456789');
    });

    it('should return default value for invalid input', () => {
      const result = unitConverter({ num: 'invalid', decimals: 2 });
      expect(result).toBe('0');
    });
  });

  describe('unitConverterToFormat', () => {
    it('should convert number to formatted unit format', () => {
      const result = unitConverterToFormat({ num: '123456789', decimals: 2 });

      expect(result).toBe('123.45M');
    });

    it('should convert number to formatted unit format if num is negative number', () => {
      const result = unitConverterToFormat({ num: '-123456789', decimals: 2 });

      expect(result).toBe('-123.456789M');
    });

    it('should convert number to formatted unit format if num is negative', () => {
      const result = unitConverterToFormat({ num: -123, decimals: 2 });

      expect(result).toBe('-123');
    });

    it('should convert number to formatted unit format if num is undefined', () => {
      const result = unitConverterToFormat({ num: undefined, decimals: 2 });

      expect(result).toBe('0');
    });

    it('should convert number to formatted unit format if num is number', () => {
      const result = unitConverterToFormat(123);

      expect(result).toBe('123');
    });

    it('should convert number to formatted unit format if num is BigNumber', () => {
      const result = unitConverterToFormat(new BigNumber(123));

      expect(result).toBe('123');
    });

    it('should return default value for invalid input', () => {
      const result = unitConverterToFormat({ num: 'invalid', decimals: 2 });

      expect(result).toBe('0');
    });
  });

  describe('getShareOfPool', () => {
    it('should return share of pool', () => {
      const result = getShareOfPool('100', '200');

      expect(result).toBe('33.33');
    });

    it('should return share of pool if input is Bignumber', () => {
      const result = getShareOfPool(new BigNumber(100), '200');

      expect(result).toBe('33.33');
    });

    it('should return share of pool if input is undefined', () => {
      const result = getShareOfPool(undefined, '200');

      expect(result).toBe('0.00');
    });

    it('should return share of pool if not input total', () => {
      const result = getShareOfPool(undefined);

      expect(result).toBe('0.00');
    });

    it('should return "0.00" for invalid input', () => {
      const result = getShareOfPool('invalid', '200');

      expect(result).toBe('0.00');
    });
  });

  describe('percentConverter', () => {
    it('should convert number to percentage', () => {
      const result = percentConverter('0.5');

      expect(result).toBe('50.00');
    });

    it('should convert number to percentage if input is a negative number', () => {
      const result = percentConverter(-0.5);

      expect(result).toBe('0.00');
    });

    it('should convert number to percentage if input is a BigNumber', () => {
      const result = percentConverter(new BigNumber('0.5'));

      expect(result).toBe('50.00');
    });

    it('should convert number to percentage if input is > 100', () => {
      const result = percentConverter(new BigNumber(10000));

      expect(result).toBe('100.00');
    });

    it('should convert number to percentage if input is undefined', () => {
      const result = percentConverter(undefined as any);

      expect(result).toBe('0.00');
    });

    it('should return "0.00" for invalid input', () => {
      const result = percentConverter('invalid');

      expect(result).toBe('0.00');
    });
  });

  describe('showUSDConverter', () => {
    it('should convert number to USD format', () => {
      const result = showUSDConverter({ num: '123456789', decimals: 2 });

      expect(result).toBe('$123.45M');
    });

    it('should convert number to USD format if input is a BigNumber', () => {
      const result = showUSDConverter({ num: new BigNumber('123456789'), decimals: 2 });

      expect(result).toBe('$123.45M');
    });

    it('should convert number to USD format if input is a undefined', () => {
      const result = showUSDConverter({ num: undefined, decimals: 2 });

      expect(result).toBe('--');
    });

    it('should convert number to USD format if input is a string', () => {
      const result = showUSDConverter('123456');

      expect(result).toBe('$123456');
    });

    it('should return default value for invalid input', () => {
      const result = showUSDConverter({ num: 'invalid', decimals: 2 });
      expect(result).toBe('--');
    });
  });
});
