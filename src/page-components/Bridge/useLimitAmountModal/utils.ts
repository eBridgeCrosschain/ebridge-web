import BigNumber from 'bignumber.js';
import { ICrossInfo, LimitDataProps, TokenFormat } from './constants';
import { getLimitData } from './api';
import { divDecimals } from 'utils/calculate';

export const calculateMinValue = (
  input1: LimitDataProps | undefined,
  input2?: LimitDataProps | undefined,
): LimitDataProps | undefined => {
  if (!input1) {
    return;
  }

  if (!input2) {
    if (input1.isEnable) {
      input1.checkMaxCapcity = true;
      input1.checkCurrentCapcity = true;
    }
    return input1;
  }

  input1.checkMaxCapcity = true;
  input1.checkCurrentCapcity = true;

  if (input1.remain.gt(input2.remain)) {
    input1.remain = input2.remain;
  }

  if (input1.isEnable && input2.isEnable) {
    if (input1.maxCapcity.gt(input2.maxCapcity)) {
      input1.maxCapcity = input2.maxCapcity;
    }
  } else if (input2.isEnable) {
    input1.maxCapcity = input2.maxCapcity;
    input1.checkCurrentCapcity = false;
  } else if (!input1.isEnable) {
    input1.checkMaxCapcity = false;
    input1.checkCurrentCapcity = false;
  }

  return input1;
};

export const formatToken = (input: BigNumber, symbol?: string): string => {
  if (!symbol || !TokenFormat[symbol]) {
    return input.dp(2, BigNumber.ROUND_DOWN).toFormat();
  }
  return input.dp(TokenFormat[symbol], BigNumber.ROUND_DOWN).toFormat();
};

export const calculateTime = (input: BigNumber, currentCapcity: BigNumber, fillRate: BigNumber): string =>
  input.minus(currentCapcity).div(fillRate).idiv(60).plus(1).toFormat();

export const getLimitDataByGQL = async (
  crossInfo: ICrossInfo,
  decimals?: number,
): Promise<LimitDataProps | undefined> => {
  const response = await getLimitData(crossInfo);

  if (!response) {
    return;
  }

  return {
    remain: divDecimals(response.remain, decimals),
    maxCapcity: divDecimals(response.maxCapcity, decimals),
    currentCapcity: divDecimals(response.currentCapcity, decimals),
    fillRate: divDecimals(response.fillRate, decimals),
    isEnable: response.isEnable,
  };
};
