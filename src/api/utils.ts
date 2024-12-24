import axios from 'axios';
import { BaseConfig, RequestConfig } from './types';
import { BASE_URL } from 'constants/index';
import eBridgeEventBus from 'utils/eBridgeEventBus';

const isDeniedRequest = (error: { message: string }) => {
  try {
    const message: string = error.message;
    if (message?.includes('401')) return true;
  } catch (error) {
    console.log(error);
  }
  return false;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    const res = response.data;
    return res;
  },
  (error) => {
    console.log('api error', error, isDeniedRequest(error));
    if (isDeniedRequest(error)) {
      eBridgeEventBus.Unauthorized.emit();
    }
    return Promise.reject(error);
  },
);

export const service = axiosInstance;

export function spliceUrl(baseUrl: string, extendArg?: string) {
  return extendArg ? baseUrl + '/' + extendArg : baseUrl;
}

export function getRequestConfig(base: BaseConfig, config?: RequestConfig) {
  if (typeof base === 'string') {
    return config;
  } else {
    const { baseConfig } = base || {};
    const { query, method, params, data } = config || {};
    return {
      ...config,
      ...baseConfig,
      query: (baseConfig.query || '') + (query || ''),
      method: method ? method : baseConfig.method,
      params: Object.assign({}, baseConfig.params, params),
      data: Object.assign({}, baseConfig.data, data),
    };
  }
}
