// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { API_REQ_FUNCTION, UrlObj } from './types';

export const DEFAULT_METHOD = 'GET';

/**
 * api request configuration directory
 * @example
 *    upload: {
 *      target: '/api/file-management/file-descriptor/upload',
 *      baseConfig: { method: 'POST', },
 *    },
 * or:
 *    upload:'/api/file-management/file-descriptor/upload'
 *
 * @description api configuration default method is from DEFAULT_METHOD
 * @type {UrlObj}  // The type of this object from UrlObj.
 */
export const BASE_APIS = {
  getCurrentBlockHeight: '',
};

const CrossApiList = {
  getCrossChainTransfers: '/api/app/cross-chain-transfers',
  getCrossChainIndexing: '/api/app/cross-chain-indexing/progress',
  getDailyLimits: 'api/app/limiter/dailyLimits',
  getRateLimits: 'api/app/limiter/rateLimits',
};

const ApplicationApiList = {
  getTokenList: '/api/ebridge/application/tokens',
  commitTokenInfo: {
    target: '/api/ebridge/application/commit-basic-info',
    baseConfig: { method: 'POST' },
  },
  getTokenInfo: '/api/ebridge/application/user-token-access-info',
  getChainStatus: '/api/ebridge/application/check-chain-access-status',
  addChain: {
    target: '/api/ebridge/application/add-chain',
    baseConfig: { method: 'POST' },
  },
  prepareBindIssue: {
    target: '/api/ebridge/application/prepare-binding-issue',
    baseConfig: { method: 'POST' },
  },
  getIssue: {
    target: '/api/ebridge/application/issue-binding',
    baseConfig: { method: 'POST' },
  },
  getMyApplicationList: '/api/ebridge/application/list',
  getApplicationDetail: '/api/ebridge/application/detail',
  getTokenConfig: '/api/ebridge/application/token/config',
  changeAddLiquidityStatus: {
    target: '/api/ebridge/application/add-liquidity',
    baseConfig: { method: 'POST' },
  },
};

const CommonApiList = {
  getTokenWhiteList: '/api/ebridge/application/token-white-list',
  getTokenPrice: '/api/ebridge/application/token/price',
};

const CMSApiList = {
  getToggleResultOfMask: '/cms/items/home',
};
/**
 * api request extension configuration directory
 * @description object.key // The type of this object key comes from from @type {UrlObj}
 */
export const EXPAND_APIS = {
  cross: CrossApiList,
  cms: CMSApiList,
  application: ApplicationApiList,
  common: CommonApiList,
};

export type BASE_REQ_TYPES = {
  [x in keyof typeof BASE_APIS]: API_REQ_FUNCTION;
};

export type EXPAND_REQ_TYPES = {
  [X in keyof typeof EXPAND_APIS]: {
    [K in keyof (typeof EXPAND_APIS)[X]]: API_REQ_FUNCTION;
  };
};
