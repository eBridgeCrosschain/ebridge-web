import BigNumber from 'bignumber.js';

export enum REQ_CODE {
  UserDenied = -1,
  Fail = -2,
  Success = 1,
}

export const LANG_MAX = new BigNumber('9223372036854774784');

export const ZERO = new BigNumber(0);
export const ONE = new BigNumber(1);

export const isEffectiveNumber = (v: any) => {
  const val = new BigNumber(v);
  return !val.isNaN() && !val.lte(0);
};

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'AppName';
export const prefixCls = process.env.NEXT_PUBLIC_PREFIX;

export const MaxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export const CrossFeeToken = 'ELF';
export const CrossFeeTokenDecimals = 8;

export const crossTokenMin: any = {
  ELF: 0,
  WBNB: 0,
  WETH: 0,
  USDT: 0,
};

export const SYMBOL_FORMAT_MAP: Record<string, string> = {
  'SGR-1': 'SGR',
};

export const WEBSITE_NAME = 'eBridge';

export const IS_ONLY_SIDE_CHAIN_LIST: string[] = [];
