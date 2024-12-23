import { useCallback, useState } from 'react';
import { TokenInfo } from 'types';
import { ContractBasic } from 'utils/contract';
import useInterval from './useInterval';
import { getMyLiquidity, getTotalLiquidity } from 'utils/pools';
import { divDecimals } from 'utils/calculate';

export function usePoolTotalLiquidity(
  {
    poolContract,
    tokenContract,
    tokenInfo,
  }: {
    poolContract?: ContractBasic;
    tokenContract?: ContractBasic;
    tokenInfo?: TokenInfo;
  },
  delay: null | number = 10000,
) {
  const [totalLiquidity, setTotalLiquidity] = useState<string>();
  console.log(tokenContract, '=====tokenContract');

  const onGetTotalLiquidity = useCallback(async () => {
    if (!poolContract || !tokenContract || !tokenInfo) return;

    try {
      const liquidity = await getTotalLiquidity({
        poolContract,
        tokenContract,
        symbol: tokenInfo.symbol,
      });
      setTotalLiquidity(liquidity);
    } catch (error) {
      console.debug(error);
    }
  }, [poolContract, tokenContract, tokenInfo]);

  useInterval(onGetTotalLiquidity, delay, [getTotalLiquidity]);

  return {
    totalLiquidity,
    showTotalLiquidity: divDecimals(totalLiquidity, tokenInfo?.decimals),
    onGetTotalLiquidity,
  };
}

export function usePoolMyLiquidity(
  {
    poolContract,
    account,
    tokenInfo,
  }: {
    poolContract?: ContractBasic;
    account?: string;
    tokenInfo?: TokenInfo;
  },
  delay: null | number = 10000,
) {
  const [myLiquidity, setMyLiquidity] = useState<string>();
  const onGetMyLiquidity = useCallback(async () => {
    if (!poolContract || !account || !tokenInfo) return;
    try {
      const liquidity = await getMyLiquidity({
        poolContract,
        account,
        tokenInfo,
      });
      setMyLiquidity(liquidity);
    } catch (error) {
      console.debug(error);
    }
  }, [account, poolContract, tokenInfo]);

  useInterval(onGetMyLiquidity, delay, [getTotalLiquidity]);

  return {
    myLiquidity,
    showMyLiquidity: divDecimals(myLiquidity, tokenInfo?.decimals),
    onGetMyLiquidity,
  };
}
