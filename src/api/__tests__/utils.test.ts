/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, expect, test, vi } from 'vitest';
import { service, spliceUrl, getRequestConfig, isDeniedRequest } from 'api/utils';

// Mock eBridgeEventBus and axios
vi.mock('utils/eBridgeEventBus');

vi.mock('axios', () => {
  const BASE_URL = 'https://ebridge.exchange';
  return {
    default: {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn().mockImplementation((config: any) => {
              config();
            }),
            handlers: [
              {
                fulfilled: vi.fn().mockImplementation((config: any) => {
                  return config;
                }),
                rejected: vi.fn(),
              },
            ],
          },
          response: {
            use: vi.fn().mockImplementation((response: any) => {
              response({ data: { code: '200' } });
            }),
          },
        },
        post: vi.fn().mockImplementation((config: any) => {
          return config;
        }),
        get: vi.fn().mockImplementation((config: any) => {
          return config;
        }),
        defaults: {
          baseURL: BASE_URL,
          timeout: 50000,
        },
      }),
    },
  };
});

const BASE_URL = 'https://ebridge.exchange';

describe('service', () => {
  test('should create axios instance with correct baseURL and timeout', () => {
    expect(service.defaults.baseURL).toBe(BASE_URL);
    expect(service.defaults.timeout).toBe(50000);
  });

  test('should pass configuration through the GET request', async () => {
    const config = {
      url: '/test',
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await service.get(config.url);
    expect(response).toEqual('/test');
  });

  test('should pass configuration through the POST request', async () => {
    const config = {
      url: '/test',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await service.post(config.url);
    expect(response).toEqual('/test');
  });
});

describe('isDeniedRequest', () => {
  test('returns true if error message contains "401"', () => {
    const error = { message: 'Request failed with status code 401' };
    const result = isDeniedRequest(error);
    expect(result).toBe(true);
  });

  test('returns false if error message does not contain "401"', () => {
    const error = { message: 'Request failed with status code 404' };
    const result = isDeniedRequest(error);
    expect(result).toBe(false);
  });

  test('handles errors without message property', () => {
    // @ts-ignore
    const error = {};
    const result = isDeniedRequest(error as any);
    expect(result).toBe(false);
  });

  test('logs warnings if an error occurs within isDeniedRequest', () => {
    // Mock console.log
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // @ts-ignore
    isDeniedRequest(null);
    expect(console.log).toHaveBeenCalled();
  });
});

describe('spliceUrl', () => {
  test('should return baseUrl when extendArg is not provided', () => {
    const baseUrl = 'https://example.com';
    const result = spliceUrl(baseUrl);

    expect(result).toBe(baseUrl);
  });

  test('should return baseUrl with extendArg appended', () => {
    const baseUrl = 'https://example.com';
    const extendArg = 'test';
    const result = spliceUrl(baseUrl, extendArg);

    expect(result).toBe(`${baseUrl}/${extendArg}`);
  });
});

describe('getRequestConfig', () => {
  test('should return config when base is a string', () => {
    const base = 'https://example.com';
    const config = { method: 'GET', params: { id: 1 } };
    const result = getRequestConfig(base, config);

    expect(result).toEqual(config);
  });

  test('should merge baseConfig and config correctly', () => {
    const base = {
      target: '',
      baseConfig: {
        method: 'POST',
        params: { page: 1 },
        data: { key: 'value' },
        query: '?sort=asc',
      },
    };
    const config = {
      method: 'GET',
      params: { id: 1 },
      data: { newKey: 'newValue' },
      query: '&filter=true',
    };
    const result = getRequestConfig(base, config);

    expect(result).toEqual({
      ...config,
      ...base.baseConfig,
      query: `${base.baseConfig.query}${config.query}`,
      method: config.method,
      params: { ...base.baseConfig.params, ...config.params },
      data: { ...base.baseConfig.data, ...config.data },
    });
  });

  test('should handle undefined base and config', () => {
    const result = getRequestConfig(undefined as any, undefined);

    expect(result).toEqual({
      data: {},
      method: undefined,
      params: {},
      query: '',
    });
  });

  test('should handle undefined baseConfig', () => {
    const base = { target: '/test', baseConfig: {} };
    const config = { method: 'GET', params: { id: 1 } };
    const result = getRequestConfig(base, config);

    expect(result).toEqual({
      data: {},
      ...config,
      query: '',
    });
  });

  test('should handle undefined config', () => {
    const base = {
      target: '/test',
      baseConfig: {
        method: 'POST',
        params: { page: 1 },
        data: { key: 'value' },
        query: '?sort=asc',
      },
    };
    const result = getRequestConfig(base);

    expect(result).toEqual(base.baseConfig);
  });
});
