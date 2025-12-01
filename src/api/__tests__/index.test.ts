import { describe, expect, test, vi } from 'vitest';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { baseRequest, request, requestGql } from 'api/index';
import { service, spliceUrl } from 'api/utils';
import myServer from 'api/server';
import { IBaseRequest } from 'api/types';

// Mock dependencies
vi.mock('api/utils', () => ({
  service: vi.fn(),
  spliceUrl: vi.fn(),
}));

vi.mock('api/server', () => {
  return {
    default: {
      parseRouter: vi.fn(),
      base: {},
    },
  };
});

vi.mock('api/list', () => ({
  BASE_APIS: { test: 'test' },
  BASE_REQ_TYPES: {},
  DEFAULT_METHOD: 'GET',
  EXPAND_APIS: { expand: 'expand' },
  EXPAND_REQ_TYPES: {},
}));

// Mock @apollo/client
vi.mock('@apollo/client', () => ({
  ApolloClient: vi.fn(),
  HttpLink: vi.fn(),
  InMemoryCache: vi.fn(),
}));

describe('baseRequest', () => {
  test('should call service with correct parameters', async () => {
    const mockResponse = { data: 'success' };
    (service as any).mockResolvedValue(mockResponse);

    const config: IBaseRequest = {
      url: 'https://example.com',
      method: 'POST',
      query: 'test=1',
      headers: { 'Content-Type': 'application/json' },
    };

    const result = await baseRequest(config);

    expect(spliceUrl).toHaveBeenCalledWith(config.url, config.query);
    expect(service).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  test('should use default method if method is not provided', async () => {
    const mockResponse = { data: 'success' };
    (service as any).mockResolvedValue(mockResponse);

    const config: IBaseRequest = {
      url: 'https://example.com',
      query: 'test=1',
      headers: { 'Content-Type': 'application/json' },
    };

    const result = await baseRequest(config);

    expect(spliceUrl).toHaveBeenCalledWith(config.url, config.query);
    expect(service).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });
});

describe('request', () => {
  test('should assign base and expand requests correctly', () => {
    const baseRequestMock = { test: vi.fn() };
    const expandRequestMock = { expand: vi.fn() };

    vi.mocked(myServer).base = baseRequestMock;
    vi.mocked(myServer).expand = expandRequestMock;

    expect(request).toHaveProperty('parseRouter');
    expect(request).toHaveProperty('base');
  });
});

describe('requestGql', () => {
  test('should create ApolloClient with correct configuration', () => {
    const uri = 'https://example.com/graphql';
    const client = requestGql({ uri });

    expect(ApolloClient).toHaveBeenCalledWith({
      cache: new (InMemoryCache as any)(),
      queryDeduplication: false,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
        query: {
          fetchPolicy: 'network-only',
        },
      },
      link: new (HttpLink as any)({ uri }),
    });

    expect(client).toBeInstanceOf(ApolloClient);
  });
});
