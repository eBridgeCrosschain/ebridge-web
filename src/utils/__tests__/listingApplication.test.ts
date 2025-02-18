import { describe, it, expect } from 'vitest';
import queryString from 'query-string';
import { ListingStep } from 'constants/listingApplication';
import { getListingUrl } from 'utils/listingApplication';

describe('getListingUrl', () => {
  it('should generate the correct URL for TOKEN_INFORMATION with a symbol param', () => {
    const step = ListingStep.TOKEN_INFORMATION;
    const params = { symbol: 'ABC' };

    const result = getListingUrl(step, params);
    const expectedSearch = queryString.stringify({ symbol: 'ABC' });

    expect(result).toBe(`/listing-application/token-information?${expectedSearch}`);
  });

  it('should generate the correct URL for SELECT_CHAIN with a symbol param', () => {
    const step = ListingStep.SELECT_CHAIN;
    const params = { symbol: 'XYZ' };

    const result = getListingUrl(step, params);
    const expectedSearch = queryString.stringify({ symbol: 'XYZ' });

    expect(result).toBe(`/listing-application/select-chain?${expectedSearch}`);
  });

  it('should return the correct base path when no params are provided for TOKEN_INFORMATION', () => {
    const step = ListingStep.TOKEN_INFORMATION;

    const result = getListingUrl(step);

    expect(result).toBe('/listing-application/token-information');
  });

  it('should return the correct base path when no params are provided for SELECT_CHAIN', () => {
    const step = ListingStep.SELECT_CHAIN;

    const result = getListingUrl(step);

    expect(result).toBe('/listing-application/select-chain');
  });
});
