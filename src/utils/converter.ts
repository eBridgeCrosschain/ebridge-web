import BigNumber from 'bignumber.js';

const options = {
  zh: {
    list: [
      { value: 1e12, symbol: '萬億' },
      { value: 1e8, symbol: '億' },
      { value: 1e4, symbol: '萬' },
    ],
    lastValue: 1e4,
  },
  en: {
    list: [
      { value: 1e12, symbol: 'T' },
      { value: 1e9, symbol: 'B' },
      { value: 1e6, symbol: 'M' },
      // { value: 1e3, symbol: 'K' },
    ],
    lastValue: 1e3,
  },
};
export const fixedDecimal = ({
  num,
  decimals = 4,
  minDecimals = 8,
}: {
  num?: number | BigNumber | string;
  decimals?: number;
  minDecimals?: number;
}) => {
  const bigCount = BigNumber.isBigNumber(num) ? num : new BigNumber(num || '');
  if (bigCount.isNaN()) return '0';
  const dpCount = bigCount.dp(decimals, BigNumber.ROUND_DOWN);
  if (dpCount.gt(0)) return dpCount.toFixed();
  return bigCount.dp(minDecimals, BigNumber.ROUND_DOWN).toFixed();
};

export const fixedDecimalToFormat = ({
  num,
  decimals = 4,
  minDecimals = 8,
}: {
  num?: number | BigNumber | string;
  decimals?: number;
  minDecimals?: number;
}) => {
  const bigCount = BigNumber.isBigNumber(num) ? num : new BigNumber(num || '');
  if (bigCount.isNaN()) return '0';
  const dpCount = bigCount.dp(decimals, BigNumber.ROUND_DOWN);
  if (dpCount.gt(0)) return dpCount.toFormat();
  return bigCount.dp(minDecimals, BigNumber.ROUND_DOWN).toFormat();
};

type Num = number | BigNumber | string;
export const unitConverter = (
  ags:
    | {
        num?: Num;
        decimals?: number;
        defaultVal?: string;
        minDecimals?: number;
        skipConverterIndex?: number;
      }
    | Num
    | undefined,
) => {
  let obj: any = {};
  if (!BigNumber.isBigNumber(ags) && typeof ags === 'object') {
    obj = ags;
  } else {
    obj.num = ags;
  }
  const { num, decimals = 4, defaultVal = '0', minDecimals = 8, skipConverterIndex = 0 } = obj;
  const bigNum = BigNumber.isBigNumber(num) ? num : new BigNumber(num || '');
  if (bigNum.isNaN() || bigNum.eq(0)) return defaultVal;
  const abs = bigNum.abs();
  const { list, lastValue } = options.en;
  if (abs.gt(lastValue)) {
    for (let i = 0; i < list.length - skipConverterIndex; i++) {
      const { value, symbol } = list[i];
      if (abs.gt(value))
        return (
          fixedDecimal({
            num: bigNum.div(value),
            decimals,
            minDecimals,
          }) + symbol
        );
    }
  }
  return fixedDecimal({
    num: bigNum,
    decimals,
    minDecimals,
  });
};
export const unitConverterToFormat = (
  ags:
    | {
        num?: Num;
        decimals?: number;
        defaultVal?: string;
        minDecimals?: number;
      }
    | Num
    | undefined,
) => {
  let obj: any = {};
  if (!BigNumber.isBigNumber(ags) && typeof ags === 'object') {
    obj = ags;
  } else {
    obj.num = ags;
  }
  const { num, decimals = 4, defaultVal = '0', minDecimals = 8 } = obj;
  const bigNum = BigNumber.isBigNumber(num) ? num : new BigNumber(num || '');
  if (bigNum.isNaN() || bigNum.eq(0)) return defaultVal;
  const abs = bigNum.abs();
  const { list, lastValue } = options.en;
  if (abs.gt(lastValue)) {
    for (let i = 0; i < list.length; i++) {
      const { value, symbol } = list[i];
      if (abs.gt(value))
        return (
          fixedDecimalToFormat({
            num: bigNum.div(value),
            decimals,
            minDecimals,
          }) + symbol
        );
    }
  }
  return fixedDecimalToFormat({
    num: bigNum,
    decimals,
    minDecimals,
  });
};

export const getShareOfPool = (num?: BigNumber.Value, total?: BigNumber.Value) => {
  const bigNum = BigNumber.isBigNumber(num) ? num : new BigNumber(num || '');
  if (!total) return '0.00';
  const newtotal = bigNum.plus(total);
  return percentConverter(bigNum.div(newtotal));
};

export const percentConverter = (num: BigNumber.Value) => {
  let bigNum = BigNumber.isBigNumber(num) ? num : new BigNumber(num || '');
  bigNum = bigNum.times(100);

  if (bigNum.isNaN() || bigNum.lt(0) || bigNum.toFixed() === 'Infinity') return '0.00';

  return bigNum.gt(100) ? '100.00' : bigNum.toFixed(2);
};

export const showUSDConverter = (
  ags:
    | {
        num?: Num;
        decimals?: number;
        defaultVal?: string;
        minDecimals?: number;
        skipConverterIndex?: number;
      }
    | Num
    | undefined,
) => {
  let obj: any = {};
  if (!BigNumber.isBigNumber(ags) && typeof ags === 'object') {
    obj = ags;
  } else {
    obj.num = ags;
  }
  const { num } = obj;
  const bigNum = BigNumber.isBigNumber(num) ? num : new BigNumber(num || '');

  if (bigNum.isNaN() || bigNum.lte(0)) return '--';
  return `$${unitConverter(obj)}`;
};
