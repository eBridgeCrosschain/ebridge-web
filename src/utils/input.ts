import BigNumber from 'bignumber.js';
import { sleep } from 'utils';
import { TelegramPlatform } from 'utils/telegram/telegram';
import { isAndroid } from 'utils/isMobile';
import { isELFChain } from 'utils/aelfUtils';
import { ZERO } from 'constants/misc';
import { ChainId } from 'types';

export function parseInputChange(value: string, min?: BigNumber, maxLength?: number) {
  const pivot = new BigNumber(value);
  if (pivot.gt(0)) {
    if (min && min.gt(pivot)) return min.toFixed();
    const [, dec] = value.split('.');
    return (dec?.length || 0) >= (maxLength || 18) ? pivot.toFixed(maxLength || 18, 1) : value;
  }
  return value;
}

export function parseMAXInputChange(value: string, max?: BigNumber, min?: BigNumber, maxLength?: number) {
  const pivot = new BigNumber(value);
  if (max && max.lt(pivot)) {
    return max.toFixed() || '';
  } else if (pivot.gt(0)) {
    if (min && min.gt(pivot)) return min.toFixed();
    const [, dec] = value.split('.');
    return (dec?.length || 0) >= (maxLength || 18) ? pivot.toFixed(maxLength || 18, 1) : value;
  }
  return value;
}

export function sliceDecimals(value?: string, decimals?: number) {
  if (!value) return '';
  const [integer, dec] = value.split('.');
  return integer + (value.includes('.') ? '.' : '') + (dec ? dec.slice(0, decimals) : '');
}

export function getMaxAmount({
  chainId,
  symbol,
  balance,
  crossFee,
}: {
  chainId?: ChainId;
  symbol?: string;
  balance?: BigNumber;
  crossFee?: string;
}) {
  let value = ZERO;
  const isELF = isELFChain(chainId);
  if (!isELF || symbol !== 'ELF') {
    value = ZERO.plus(balance || '0');
  } else {
    value = BigNumber.max(
      ZERO.plus(balance || '0')
        .minus(crossFee || '0')
        .minus(0.0041),
      0,
    );
  }
  return value;
}

export const handleInputFocus = async (id: string) => {
  const _isAndroid = isAndroid();
  if (!TelegramPlatform.isTelegramPlatform() && _isAndroid) {
    // The keyboard does not block the input box
    await sleep(200);
    document.getElementById(id)?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  }
};
