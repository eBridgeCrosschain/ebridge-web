import { describe, it, expect, test } from 'vitest';
import BigNumber from 'bignumber.js';
import { timesDecimals, divDecimals, divDecimalsStr, bigNumberToWeb3Input, valueToPercentage } from '../calculate';

describe('timesDecimals', () => {
  test('amount is undefined, and return ZERO', () => {
    const result = timesDecimals(undefined);
    expect(result).toBeInstanceOf(BigNumber);
  });
  test('amount is USDT, and return ZERO', () => {
    const result = timesDecimals('USDT');
    expect(result).toBeInstanceOf(BigNumber);
  });
  test('amount is 1.2345678 and decimals is 10000000000, and return 12345678000', () => {
    const result = timesDecimals('1.2345678', '10000000000').toFixed();
    expect(result).toBe('12345678000');
  });
  test('amount is 1.2345678 and decimals is 6, return 1234567.8', () => {
    const result = timesDecimals('1.2345678', 6).toFixed();
    expect(result).toBe('1234567.8');
  });
});

describe('divDecimals', () => {
  test('amount is undefined, and return ZERO', () => {
    const result = divDecimals(undefined);
    expect(result).toBeInstanceOf(BigNumber);
  });
  test('amount is USDT, and return ZERO', () => {
    const result = divDecimals('USDT');
    expect(result).toBeInstanceOf(BigNumber);
  });
  test('amount is 12345678 and decimals is 10000000000, and return 12345678000', () => {
    const result = divDecimals('12345678', '10000000000').toFixed();
    expect(result).toBe('0.0012345678');
  });
  test('amount is 12345678 and decimals is 6, and return 12.345678', () => {
    const result = divDecimals('12345678', 6).toFixed();
    expect(result).toBe('12.345678');
  });
});

describe('divDecimalsStr', () => {
  it('should return formatted number if effective', () => {
    const value = new BigNumber(1);
    const decimals = 2;

    const result = divDecimalsStr(value, decimals);

    expect(result).toBe('0.01');
  });

  it('should return default value if not effective and with decimals', () => {
    const value = new BigNumber(0);
    const decimals = 2;

    const result = divDecimalsStr(value, decimals, 'DEFAULT');

    expect(result).toBe('DEFAULT');
  });

  it('should return default value if not effective and without decimals', () => {
    const value = new BigNumber(0);

    const result = divDecimalsStr(value, undefined, 'DEFAULT');

    expect(result).toBe('DEFAULT');
  });
});

describe('bigNumberToWeb3Input', () => {
  it('should return a string of the number with no decimals', () => {
    const num = new BigNumber(123.456);
    const result = bigNumberToWeb3Input(num);

    expect(result).toBe('123');
  });

  it('should create a new BigNumber if input is not a BigNumber', () => {
    const result = bigNumberToWeb3Input(123.456 as any);
    expect(result).toBe('123');
  });
});

describe('valueToPercentage', () => {
  it('should return correct percentage when input is a BigNumber', () => {
    const num = new BigNumber(0.5);

    const result = valueToPercentage(num);

    expect(result).toEqual(new BigNumber(50));
  });

  it('should convert non-BigNumber input using timesDecimals', () => {
    const num = '0.5';

    const result = valueToPercentage(num);

    expect(result).toEqual(new BigNumber(50));
  });
});
