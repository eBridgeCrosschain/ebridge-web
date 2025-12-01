import { formatTime, getCrossChainTime, getFullYear, getMillisecond } from 'utils/time';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChainId } from 'types';
import { isIncludesChainId } from 'utils';

// Mock Moment.js
vi.mock('moment', () => ({
  default: vi.fn((time: string | number | Date) => ({
    format: (format: string) => `Formatted: ${time} as ${format}`,
  })),
}));

vi.mock('utils', () => ({
  isIncludesChainId: vi.fn(),
}));

const mockMainChainId = 'AELF' as ChainId;
const mockEthId = 'ETH' as ChainId;
const mockBaseId = 'BASE' as ChainId;

describe('getMillisecond', () => {
  it('should return milliseconds when the time is a number less than or equal to 10 digits', () => {
    const result = getMillisecond(1234567890); // 10 digits
    expect(result).toBe(1234567890000);
  });

  it('should return milliseconds when time is a string less than or equal to 10 digits', () => {
    const result = getMillisecond('1234567890'); // 10 digits
    expect(result).toBe(1234567890000);
  });

  it('should return milliseconds when the time is a string with more than 10 digits', () => {
    const result = getMillisecond('1234567890123456'); // More than 10 digits
    expect(result).toBe(1234567890123456);
  });

  it('should return the input number when it is greater than 10 digits', () => {
    const result = getMillisecond(1234567890123456); // More than 10 digits
    expect(result).toBe(1234567890123456);
  });

  it('should return NaN if the time is not a valid number or string', () => {
    const result = getMillisecond('invalid');
    expect(result).toBeNaN();
  });

  it('should return NaN if the time is undefined', () => {
    const result = getMillisecond(undefined);
    expect(result).toBeNaN();
  });
});

describe('formatTime', () => {
  it('should format time correctly for timestamp strings', () => {
    const result = formatTime('1633072800');

    expect(result).toBe('Formatted: 1633072800000 as YYYY MMM DD, HH:mm:ss');
  });

  it('should format time correctly for Date objects', () => {
    const date = new Date();

    const result = formatTime(date);

    expect(result).toBe(`Formatted: ${date} as YYYY MMM DD, HH:mm:ss`);
  });

  it('should format time correctly for number timestamps', () => {
    const result = formatTime(1633072800000);

    expect(result).toBe('Formatted: 1633072800000 as YYYY MMM DD, HH:mm:ss');
  });

  it('should return null if time is invalid (undefined)', () => {
    const result = formatTime(undefined as any);
    expect(result).toBe('Formatted: undefined as YYYY MMM DD, HH:mm:ss');
  });

  it('should handle edge case with string containing "T" or "-" correctly', () => {
    const result = formatTime('2025-01-01T12:00:00');
    expect(result).toBe('Formatted: 2025-01-01T12:00:00 as YYYY MMM DD, HH:mm:ss');
  });
});

describe('getCrossChainTime', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should return cross-chain time if matching chain IDs are found', () => {
    // Mock isIncludesChainId return true
    vi.mocked(isIncludesChainId).mockReturnValue(true);

    const result = getCrossChainTime(mockMainChainId, mockEthId);

    expect(result).toBe('8');
  });

  it('should return default time if no matching chain IDs are found', () => {
    // Mock isIncludesChainId return false
    vi.mocked(isIncludesChainId).mockReturnValue(false);

    const result = getCrossChainTime(mockMainChainId, mockBaseId);

    expect(result).toBe('10');
  });
});

describe('getFullYear', () => {
  it('should return the current year', () => {
    const currentYear = new Date().getFullYear();

    const result = getFullYear();

    expect(result).toBe(currentYear);
  });
});
