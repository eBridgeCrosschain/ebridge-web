import { describe, it, expect, vi, Mock } from 'vitest';
import { request } from 'api';
import { getTokenPrice, getTokenWhiteList } from '../../api/common';

vi.mock('api', () => ({
  request: {
    common: {
      getTokenPrice: vi.fn(),
      getTokenWhiteList: vi.fn(),
    },
  },
}));

// Mock API failure
const mockError = new Error('API request failed');

describe('getTokenPrice', () => {
  const params = {
    symbol: 'USDT',
    amount: '100',
  };

  // Mock API success
  const mockResponse = {
    data: {
      symbol: 'USDT',
      tokenAmountInUsd: '100.00',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.common.getTokenPrice as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTokenPrice(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenPrice mock was called
    expect(request.common.getTokenPrice).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.common.getTokenPrice as Mock).mockRejectedValue(mockError);

    // Assert the function throws the formatted error
    await expect(getTokenPrice(params)).rejects.toThrow('API request failed');

    // Ensure the mocks were called
    expect(request.common.getTokenPrice).toHaveBeenCalledOnce();
  });
});

describe('getTokenWhiteList', () => {
  // Mock API success
  const mockResponse = {
    data: {
      AELF: {
        USDT: { symbol: 'USDT', decimals: 6 },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.common.getTokenWhiteList as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTokenWhiteList();

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenWhiteList mock was called
    expect(request.common.getTokenWhiteList).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.common.getTokenWhiteList as Mock).mockRejectedValue(mockError);

    // Assert the function throws the formatted error
    await expect(getTokenWhiteList()).rejects.toThrow('API request failed');

    // Ensure the mocks were called
    expect(request.common.getTokenWhiteList).toHaveBeenCalledOnce();
  });
});
