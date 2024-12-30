import { useCallback, useEffect, useState } from 'react';
import { TokenInfo } from 'types';
import { ContractBasic } from 'utils/contract';
import useInterval from './useInterval';
import { getMyLiquidity, getTotalLiquidity } from 'utils/pools';
import { divDecimals } from 'utils/calculate';
import { request } from 'api';
import { useActiveAddresses } from './web3';
import { usePoolsDispatch } from 'contexts/usePools/hooks';
import { setPoolList, setPoolOverview } from 'contexts/usePools/actions';
import { usePools } from 'contexts/usePools';

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

  const onGetTotalLiquidity = useCallback(async () => {
    console.log(poolContract, tokenContract, tokenInfo);
    if (!poolContract || !tokenContract || !tokenInfo) return;

    try {
      const liquidity = await getTotalLiquidity({
        poolContract,
        tokenContract,
        symbol: tokenInfo.symbol,
      });
      console.log(liquidity, '===liquidity');

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

export function usePoolOverview() {
  const addresses = useActiveAddresses();
  const [{ poolOverview }] = usePools();
  const dispatch = usePoolsDispatch();
  const getPoolOverview = useCallback(async () => {
    try {
      const req = await request.pool.overview({ params: { addresses } });
      dispatch(setPoolOverview(req.data));
    } catch (error) {
      console.debug(error, 'getPoolOverview');
    }
  }, [addresses, dispatch]);

  useEffect(() => {
    getPoolOverview();
  }, [getPoolOverview]);

  return { poolOverview, getPoolOverview };
}

export function usePoolList() {
  const addresses = useActiveAddresses();
  const [{ poolList }] = usePools();
  const dispatch = usePoolsDispatch();
  const getPoolList = useCallback(async () => {
    try {
      const req = await request.pool.list({ params: { addresses, skipCount: 0, maxResultCount: 200 } });
      dispatch(setPoolList(req.data));
    } catch (error) {
      console.debug(error, 'getPoolList');
    }
  }, [addresses, dispatch]);

  useEffect(() => {
    getPoolList();
  }, [getPoolList]);

  return { poolList, getPoolList };
}
