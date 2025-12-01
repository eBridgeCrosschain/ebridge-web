import BigNumber from 'bignumber.js';
import { ChainId } from 'types';

export const TokenFormat: { [key: string]: number } = {
  ETH: 6,
  BNB: 3,
  USDC: 0,
  USDT: 0,
  DAI: 0,
  ELF: 0,
};

export interface LimitDataProps {
  remain: BigNumber;
  maxCapcity: BigNumber;
  currentCapcity: BigNumber;
  fillRate: BigNumber;
  isEnable?: boolean;
  checkMaxCapcity?: boolean;
  checkCurrentCapcity?: boolean;
}

export interface ICrossInfo {
  fromChainId?: ChainId;
  toChainId?: ChainId;
  fromDecimals?: number;
  toDecimals?: number;
  symbol?: string;
  fromSymbol?: string;
  toSymbol?: string;
}
