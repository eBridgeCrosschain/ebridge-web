import { describe, it, expect } from 'vitest';
import {
  formatListWithAnd,
  formatSymbolDisplay,
  parseWithCommas,
  parseWithStringCommas,
  replaceCharacter,
} from '../format';

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
