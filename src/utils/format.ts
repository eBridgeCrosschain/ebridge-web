import BigNumber from 'bignumber.js';
import { divDecimals } from './calculate';
import { ZERO } from 'constants/misc';

export const parseWithCommas = (value?: string | null) => {
  return value ? new BigNumber(value.replace(/,/g, '')).toFixed() : '';
};

export const parseWithStringCommas = (value?: string | null) => {
  return value ? value.replace(/,/g, '') : '';
};

export const replaceCharacter = (str: string, replaced: string, replacedBy: string) => {
  return str?.replace(replaced, replacedBy);
};

export const formatSymbolDisplay = (str: string) => {
  if (!str) return '';

  // Prevent malicious tampering of the token display issued by users
  if (str?.includes('SGR-1')) return replaceCharacter(str, '-1', '');

  return str;
};

export const formatListWithAnd = (items: string[]): string => {
  if (items.length > 1) {
    const lastItem = items.pop();
    return `${items.join(', ')} and ${lastItem}`;
  }
  return items.join(', ');
};

export enum AmountSign {
  PLUS = '+',
  MINUS = '-',
  USD = '$',
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
