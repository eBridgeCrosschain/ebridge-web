import BigNumber from 'bignumber.js';
import { isEffectiveNumber, ZERO } from 'constants/misc';
export function timesDecimals(a?: BigNumber.Value, decimals: string | number = 18) {
  if (!a) return ZERO;
  const bigA = ZERO.plus(a);
  if (bigA.isNaN()) return ZERO;
  if (typeof decimals === 'string' && decimals.length > 10) return bigA.times(decimals);
  return bigA.times(`1e${decimals}`);
}
export function divDecimals(a?: BigNumber.Value, decimals: string | number = 18) {
  if (!a) return ZERO;
  const bigA = ZERO.plus(a);
  if (bigA.isNaN()) return ZERO;
  if (typeof decimals === 'string' && decimals.length > 10) return bigA.div(decimals);
  return bigA.div(`1e${decimals}`);
}

export function divDecimalsStr(a?: BigNumber.Value, decimals: string | number = 8, defaultVal = '--') {
  const n = divDecimals(a, decimals);
  return isEffectiveNumber(n) ? n.toFormat() : defaultVal;
}

export function bigNumberToWeb3Input(input: BigNumber): string {
  return BigNumber.isBigNumber(input) ? input.toFixed(0) : new BigNumber(input).toFixed(0);
}
export function valueToPercentage(input?: BigNumber.Value) {
  return BigNumber.isBigNumber(input) ? input.times(100) : timesDecimals(input, 2);
}

export enum AmountSign {
  PLUS = '+',
  MINUS = '-',
  USD = '$ ',
  EMPTY = '',
}

export interface IFormatWithCommasProps {
  amount?: string | number;
  decimals?: string | number;
  digits?: number;
  sign?: AmountSign;
}
export const DEFAULT_AMOUNT = 0;
export const DEFAULT_DECIMAL = 6;
export const DEFAULT_DIGITS = 6;
/**
 * formatAmount with prefix and thousand mark, not unit
 * @example $11.1  +11.1  -11.1  9,999.9
 */
export function formatWithCommas({
  amount = DEFAULT_AMOUNT,
  decimals,
  digits = DEFAULT_DIGITS,
  sign = AmountSign.EMPTY,
}: IFormatWithCommasProps): string {
  const decimal = decimals || 0;
  const splitList = (typeof amount === 'number' ? amount.toString() : amount).split('.');

  const afterPoint = splitList[1];
  const amountTrans =
    `${divDecimals(ZERO.plus(splitList[0]), decimal).decimalPlaces(digits).toFormat()}` +
    `${afterPoint ? '.' + afterPoint : ''}`;

  if (sign && amountTrans !== '0') {
    return `${sign}${amountTrans}`;
  }
  return amountTrans;
}
