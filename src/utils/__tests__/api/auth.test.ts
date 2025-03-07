import { describe, expect, test, vi, Mock } from 'vitest';
import { queryAuthApi } from '../../api/auth';
import axios from 'axios';
import { BASE_AUTH_URL } from 'constants/index';
import { service } from 'api/utils';
import { AuthTokenSource } from 'utils/aelfAuthToken';

vi.mock('axios', () => {
  const postConfig = {
    url: '/test',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return {
    default: {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn().mockImplementation((config: any) => {
              config();
            }),
          },
          response: {
            use: vi.fn().mockImplementation((response: any) => {
              response({ data: { code: '200' } });
            }),
          },
        },
        post: vi.fn().mockResolvedValue(postConfig as never),
      }),
      post: vi.fn().mockResolvedValue(postConfig as never),
    },
  };
});

vi.mock('api/utils', async (importOriginal) => {
  const originalModule: any = await importOriginal();
  return {
    ...originalModule,
    service: {
      defaults: {
        headers: {
          common: {},
        },
      },
    },
  };
});

vi.mock('utils/eBridgeEventBus');

// Mock localStorage
export const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Attach the mock to the global window object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('queryAuthApi', () => {
  const config = {
    ca_hash: 'mockCaHash',
    managerAddress: 'mockManagerAddress',
    pubkey: 'mockPubkey',
    signature: 'mockSignature',
    plain_text: 'mockPlainText',
    source: AuthTokenSource.EVM,
  };

  const mockResponse = {
    data: {
      token_type: 'Bearer',
      access_token: 'mockAccessToken',
    },
  };

  test('should return the correct authorization token', async () => {
    (axios.post as Mock).mockResolvedValue(mockResponse);

    const result = await queryAuthApi(config);

    expect(axios.post).toHaveBeenCalledWith(`${BASE_AUTH_URL}/connect/token`, expect.any(String), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(result).toBe('Bearer mockAccessToken');
  });

  test('should set the authorization header in the service', async () => {
    (axios.post as Mock).mockResolvedValue(mockResponse);

    const authTokenResult = await queryAuthApi(config);

    expect(authTokenResult).toBe('Bearer mockAccessToken');

    expect(service.defaults.headers.common['Authorization']).toBe('Bearer mockAccessToken');
  });

  test('should return the correct authorization token and set into storage if not ca_hash', async () => {
    const config = {
      ca_hash: '',
      managerAddress: 'mockManagerAddress',
      pubkey: 'mockPubkey',
      signature: 'mockSignature',
      plain_text: 'mockPlainText',
      source: AuthTokenSource.Portkey,
    };

    (axios.post as Mock).mockResolvedValue(mockResponse);

    const authTokenResult = await queryAuthApi(config);

    expect(authTokenResult).toBe('Bearer mockAccessToken');

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should throw error if axios.post is failed', async () => {
    (axios.post as Mock).mockRejectedValue('Failed to fetch');

    await expect(queryAuthApi(config)).rejects.toThrow('Failed to fetch');
  });
});
