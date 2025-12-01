import { describe, expect, test, vi } from 'vitest';
import myServer from 'api/server';
import { DEFAULT_METHOD } from 'api/list';
import { BaseConfig, UrlObj, RequestConfig } from 'api/types';
import { service, getRequestConfig } from 'api/utils';

// Mock dependencies
vi.mock('api/utils', () => ({
  service: vi.fn(),
  spliceUrl: vi.fn(),
  getRequestConfig: vi.fn(),
}));

vi.mock('api/list', () => ({
  DEFAULT_METHOD: 'GET',
}));

describe('myServer', () => {
  let serverInstance: any;

  beforeEach(() => {
    serverInstance = Object.create(myServer);
    vi.clearAllMocks();
  });

  describe('parseRouter', () => {
    test('should create methods on the server instance', () => {
      const name = 'test';
      const urlObj: UrlObj = {
        method1: { target: 'https://example.com/method1', baseConfig: {} },
        method2: { target: 'https://example.com/method2', baseConfig: {} },
      };

      serverInstance.parseRouter(name, urlObj);

      expect(serverInstance[name]).toBeDefined();
      expect(serverInstance[name].method1).toBeInstanceOf(Function);
      expect(serverInstance[name].method2).toBeInstanceOf(Function);
    });

    test('should bind send method with correct base config', () => {
      const name = 'test';
      const urlObj: UrlObj = {
        method1: { target: 'https://example.com/method1', baseConfig: {} },
      };

      serverInstance.parseRouter(name, urlObj);

      expect(serverInstance[name].method1).toBeInstanceOf(Function);
    });
  });

  describe('send', () => {
    test('should call service with correct parameters', async () => {
      const base: BaseConfig = { target: 'https://example.com', baseConfig: {} };
      const config: RequestConfig = {
        method: 'POST',
        query: 'test=1',
        headers: { 'Content-Type': 'application/json' },
      };
      const mockResponse = { data: 'success' };

      (getRequestConfig as any).mockReturnValue({
        method: 'POST',
        query: 'test=1',
        url: 'https://example.com',
        headers: { 'Content-Type': 'application/json' },
      });

      (service as any).mockResolvedValue(mockResponse);

      const result = await serverInstance.send(base, config);

      expect(getRequestConfig).toHaveBeenCalledWith(base, config);
      expect(service).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://example.com',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    test('should use default method if method is not provided', async () => {
      const base: BaseConfig = { target: 'https://example.com', baseConfig: {} };
      const config: RequestConfig = { query: 'test=1', headers: { 'Content-Type': 'application/json' } };
      const mockResponse = { data: 'success' };

      (getRequestConfig as any).mockReturnValue({
        method: DEFAULT_METHOD,
        query: 'test=1',
        url: 'https://example.com',
        headers: { 'Content-Type': 'application/json' },
      });

      (service as any).mockResolvedValue(mockResponse);

      const result = await serverInstance.send(base, config);

      expect(getRequestConfig).toHaveBeenCalledWith(base, config);
      expect(service).toHaveBeenCalledWith({
        method: DEFAULT_METHOD,
        url: 'https://example.com',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    test('should handle string base correctly', async () => {
      const base: BaseConfig = 'https://example.com';
      const config: RequestConfig = {
        method: 'POST',
        query: 'test=1',
        headers: { 'Content-Type': 'application/json' },
      };
      const mockResponse = { data: 'success' };

      (getRequestConfig as any).mockReturnValue({
        method: 'POST',
        query: 'test=1',
        url: 'https://example.com',
        headers: { 'Content-Type': 'application/json' },
      });

      (service as any).mockResolvedValue(mockResponse);

      const result = await serverInstance.send(base, config);

      expect(getRequestConfig).toHaveBeenCalledWith(base, config);
      expect(service).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://example.com',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    test('should executes successfully when the config not have url and base is string', async () => {
      const base: BaseConfig = 'https://example.com';
      const config: RequestConfig = {
        method: 'POST',
        query: 'test=1',
        headers: { 'Content-Type': 'application/json' },
      };
      const mockResponse = { data: 'success' };

      (getRequestConfig as any).mockReturnValue({
        method: 'POST',
        query: 'test=1',
        headers: { 'Content-Type': 'application/json' },
      });

      (service as any).mockResolvedValue(mockResponse);

      const result = await serverInstance.send(base, config);

      expect(getRequestConfig).toHaveBeenCalledWith(base, config);
      expect(service).toHaveBeenCalledWith({
        method: 'POST',
        url: undefined,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    test('should executes successfully when the config not have url and base have target', async () => {
      const base: BaseConfig = { target: 'https://example.com', baseConfig: {} };
      const config: RequestConfig = {
        method: 'POST',
        query: 'test=1',
        headers: { 'Content-Type': 'application/json' },
      };
      const mockResponse = { data: 'success' };

      (getRequestConfig as any).mockReturnValue({
        method: 'POST',
        query: 'test=1',
        headers: { 'Content-Type': 'application/json' },
      });

      (service as any).mockResolvedValue(mockResponse);

      const result = await serverInstance.send(base, config);

      expect(getRequestConfig).toHaveBeenCalledWith(base, config);
      expect(service).toHaveBeenCalledWith({
        method: 'POST',
        url: undefined,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    test('should executes successfully when the getRequestConfig method returns undefined', async () => {
      const base: BaseConfig = { target: 'https://example.com', baseConfig: {} };
      const config: RequestConfig = {
        method: 'POST',
        query: 'test=1',
        headers: { 'Content-Type': 'application/json' },
      };
      const mockResponse = { data: 'success' };

      (getRequestConfig as any).mockReturnValue(undefined);

      (service as any).mockResolvedValue(mockResponse);

      const result = await serverInstance.send(base, config);

      expect(getRequestConfig).toHaveBeenCalledWith(base, config);
      expect(service).toHaveBeenCalledWith({
        method: 'GET',
        url: undefined,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
