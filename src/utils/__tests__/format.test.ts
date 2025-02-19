import { describe, it, expect, Mock } from 'vitest';
import {
  AmountSign,
  formatListWithAnd,
  formatSymbolDisplay,
  formatWithCommas,
  parseWithCommas,
  parseWithStringCommas,
  replaceCharacter,
} from '../format';
import { divDecimals } from 'utils/calculate';

// Mock the `divDecimals` function (since it's external)
vi.mock('../calculate', () => ({
  divDecimals: vi.fn(),
}));

/**
 * Test `parseWithCommas`
 */
describe('parseWithCommas', () => {
  it('should parse a comma-separated value into plain numbers', () => {
    const result = parseWithCommas('12,345,678.90');

    expect(result).toBe('12345678.9');
  });

  it('should return an empty string when input is null or undefined', () => {
    expect(parseWithCommas(null)).toBe('');

    expect(parseWithCommas(undefined)).toBe('');
  });
});

/**
 * Test `parseWithStringCommas`
 */
describe('parseWithStringCommas', () => {
  it('should remove commas from a string', () => {
    const result = parseWithStringCommas('12,345,678.90');

    expect(result).toBe('12345678.90');
  });

  it('should return an empty string for empty input', () => {
    expect(parseWithStringCommas(null)).toBe('');

    expect(parseWithStringCommas('')).toBe('');
  });
});

/**
 * Test `replaceCharacter`
 */
describe('replaceCharacter', () => {
  it('should replace matched characters', () => {
    const result = replaceCharacter('abc-def', '-', '+');

    expect(result).toBe('abc+def');
  });

  it('should handle strings without matching characters', () => {
    const result = replaceCharacter('abcdef', '-', '+');

    expect(result).toBe('abcdef');
  });
});

/**
 * Test `formatSymbolDisplay`
 */
describe('formatSymbolDisplay', () => {
  it('should replace "-1" for "SGR-1"', () => {
    const result = formatSymbolDisplay('SGR-1');

    expect(result).toBe('SGR');
  });

  it('should return the input string if it does not contain "-1"', () => {
    const result = formatSymbolDisplay('ABC');

    expect(result).toBe('ABC');
  });

  it('should return an empty string for falsy input', () => {
    expect(formatSymbolDisplay('')).toBe('');
  });
});

/**
 * Test `formatListWithAnd`
 */
describe('formatListWithAnd', () => {
  it('should format a list with commas and "and"', () => {
    const result = formatListWithAnd(['Alice', 'Bob', 'Charlie']);

    expect(result).toBe('Alice, Bob and Charlie');
  });

  it('should format a list with one item correctly', () => {
    const result = formatListWithAnd(['Alice']);

    expect(result).toBe('Alice');
  });

  it('should return an empty string for an empty list', () => {
    expect(formatListWithAnd([])).toBe('');
  });
});

/**
 * Test `formatWithCommas`
 */
describe('formatWithCommas', () => {
  it('should format the amount with commas and decimal places', () => {
    (divDecimals as Mock).mockImplementation(() => {
      return {
        decimalPlaces: () => ({
          toFormat: vi.fn().mockReturnValue('123,456.78'),
        }),
      };
    });

    const result = formatWithCommas({
      amount: '12345678.1234',
      decimals: 2,
      digits: 2,
      sign: AmountSign.PLUS,
    });

    expect(result).toBe('+123,456.78.1234');
  });

  it('should handle zero amounts with the EMPTY sign', () => {
    (divDecimals as Mock).mockImplementation(() => {
      return {
        decimalPlaces: () => ({
          toFormat: vi.fn().mockReturnValue('0'),
        }),
      };
    });

    const result = formatWithCommas({ amount: 0, sign: AmountSign.EMPTY });

    expect(result).toBe('0');
  });

  it('should properly format negative amounts', () => {
    (divDecimals as Mock).mockImplementation(() => {
      return {
        decimalPlaces: () => ({
          toFormat: vi.fn().mockReturnValue('-12,345'),
        }),
      };
    });

    const result = formatWithCommas({ amount: '-12345.6', digits: 1, sign: AmountSign.MINUS });

    expect(result).toBe('--12,345.6');
  });

  it('should handle non-decimal amounts', () => {
    (divDecimals as Mock).mockImplementation(() => {
      return {
        decimalPlaces: () => ({
          toFormat: vi.fn().mockReturnValue('123,456'),
        }),
      };
    });

    const result = formatWithCommas({ amount: 123456, decimals: 0 });

    expect(result).toBe('123,456');
  });
});
