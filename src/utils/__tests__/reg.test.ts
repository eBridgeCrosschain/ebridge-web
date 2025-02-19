import { describe, it, expect } from 'vitest';
import { isSymbol, isUrl, isValidNumber, isValidPositiveNumber } from '../reg';

describe('Validation Utilities', () => {
  /**
   * Test `isUrl`
   */
  describe('isUrl', () => {
    it('should return false for non-string inputs', () => {
      expect(isUrl(123 as any)).toBe(false); // number
      expect(isUrl(null as any)).toBe(false); // null
      expect(isUrl(undefined as any)).toBe(false); // undefined
      expect(isUrl({} as any)).toBe(false); // object
      expect(isUrl([] as any)).toBe(false); // array
      expect(isUrl(true as any)).toBe(false); // boolean
    });

    it('should return false for invalid URLs', () => {
      expect(isUrl('')).toBe(false); // empty string
      expect(isUrl('not a url')).toBe(false); // string
      expect(isUrl('http://')).toBe(false); // only protocol
      expect(isUrl('://example.com')).toBe(false); // not protocol
    });

    it('should return true for valid localhost URLs', () => {
      expect(isUrl('http://localhost')).toBe(true);
      expect(isUrl('https://localhost:8080')).toBe(true);
      expect(isUrl('http://localhost/path')).toBe(true);
      expect(isUrl('http://localhost:3000/path')).toBe(true);
    });

    it('should return true for valid non-localhost URLs', () => {
      expect(isUrl('http://example.com')).toBe(true);
      expect(isUrl('https://example.com')).toBe(true);
      expect(isUrl('http://sub.example.com')).toBe(true);
      expect(isUrl('https://example.com/path')).toBe(true);
      expect(isUrl('http://example.com:8080')).toBe(true);
      expect(isUrl('https://example.com/path?query=param')).toBe(true);
      expect(isUrl('http://example.com/path#fragment')).toBe(true);
    });

    it('should return false for invalid domain formats', () => {
      expect(isUrl('http://.com')).toBe(false); // Invalid domain name
      expect(isUrl('http://example.')).toBe(false); // Invalid domain name
      expect(isUrl('http://example.c')).toBe(false); // The domain name is too short
    });

    it('should handle edge cases', () => {
      expect(isUrl('http://localhost:')).toBe(true); // The port number is empty
      expect(isUrl('http://localhost:3000')).toBe(true); // With port number
      expect(isUrl('http://localhost/path/to/resource')).toBe(true); // With Path
      expect(isUrl('http://localhost?query=param')).toBe(true); // With query parameters
      expect(isUrl('http://localhost#fragment')).toBe(true); // With fragment
    });
  });

  /**
   * Test `isSymbol`
   */
  describe('isSymbol', () => {
    it('should return true for valid symbols', () => {
      expect(isSymbol('BTC')).toBe(true);
      expect(isSymbol('123')).toBe(true);
      expect(isSymbol('TestSymbol')).toBe(true);
    });

    it('should return false for invalid symbols', () => {
      expect(isSymbol(undefined)).toBe(false);
      expect(isSymbol('')).toBe(false);
      expect(isSymbol('BTC/USD')).toBe(false); // Contains special characters
      expect(isSymbol('BTC@')).toBe(false);
      expect(isSymbol('#SYMBOL')).toBe(false);
    });
  });

  /**
   * Test `isValidNumber`
   */
  describe('isValidNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidNumber('123')).toBe(true);
      expect(isValidNumber('123.45')).toBe(true);
      expect(isValidNumber('-123')).toBe(true);
      expect(isValidNumber('-123.45')).toBe(true);
      expect(isValidNumber('-')).toBe(true); // Special case
    });

    it('should return false for invalid numbers', () => {
      expect(isValidNumber('')).toBe(false);
      expect(isValidNumber('.')).toBe(false);
      expect(isValidNumber('abc')).toBe(false);
      expect(isValidNumber('12abc34')).toBe(false);
      expect(isValidNumber('.45')).toBe(false);
      expect(isValidNumber('12.34.56')).toBe(false);
      expect(isValidNumber('--123')).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
    });
  });

  /**
   * Test `isValidPositiveNumber`
   */
  describe('isValidPositiveNumber', () => {
    it('should return true for valid positive numbers', () => {
      expect(isValidPositiveNumber('123')).toBe(true);
      expect(isValidPositiveNumber('0')).toBe(true);
      expect(isValidPositiveNumber('123.45')).toBe(true);
    });

    it('should return false for invalid or negative numbers', () => {
      expect(isValidPositiveNumber('')).toBe(false);
      expect(isValidPositiveNumber('abc')).toBe(false);
      expect(isValidPositiveNumber('.45')).toBe(false);
      expect(isValidPositiveNumber('-123')).toBe(false);
      expect(isValidPositiveNumber('-123.45')).toBe(false);
      expect(isValidPositiveNumber('--123')).toBe(false);
      expect(isValidPositiveNumber(undefined)).toBe(false);
    });
  });
});
