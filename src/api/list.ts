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
  getTokenList: '/api/etransfer/application/tokens',
  commitTokenInfo: {
    target: '/api/etransfer/application/commit-basic-info',
    baseConfig: { method: 'POST' },
  },
  getTokenInfo: '/api/etransfer/application/user-token-access-info',
  getChainStatus: '/api/etransfer/application/check-chain-access-status',
  addChain: {
    target: '/api/etransfer/application/add-chain',
    baseConfig: { method: 'POST' },
  },
  prepareBindIssue: {
    target: '/api/etransfer/application/prepare-binding-issue',
    baseConfig: { method: 'POST' },
  },
  getIssue: {
    target: '/api/etransfer/application/issue-binding',
    baseConfig: { method: 'POST' },
  },
  getMyApplicationList: '/api/etransfer/application/list',
  getApplicationDetail: '/api/etransfer/application/detail',
  getTokenConfig: '/api/etransfer/application/token/config',
};

const CMSApiList = {
  getToggleResultOfMask: '/cms/items/home',
};
/**
 * api request extension configuration directory
 * @description object.key // The type of this object key comes from from @type {UrlObj}
 */
export const EXPAND_APIS = { cross: CrossApiList, cms: CMSApiList, application: ApplicationApiList };

export type BASE_REQ_TYPES = {
  [x in keyof typeof BASE_APIS]: API_REQ_FUNCTION;
};

export type EXPAND_REQ_TYPES = {
  [X in keyof typeof EXPAND_APIS]: {
    [K in keyof (typeof EXPAND_APIS)[X]]: API_REQ_FUNCTION;
  };
};
