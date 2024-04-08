import BigNumber from 'bignumber.js';
import { ZERO } from 'constants/misc';
import { getELFChainBalance, getBalance, getETHBalance } from 'contracts';
import { useCallback, useMemo, useState } from 'react';
import { Web3Type } from 'types';
import { isERCAddress } from 'utils';
import { isELFChain } from 'utils/aelfUtils';
import { useTokenContract } from './useContract';
import useInterval from './useInterval';
import { getTokenInfoByWhitelist } from 'utils/whitelist';

export const useBalances = (
  wallet?: Web3Type,
  tokens?: string | Array<string | undefined>,
  delay: null | number = 10000,
  targetAddress?: string,
): [BigNumber[], () => void] => {
  const [balanceMap, setBalanceMap] = useState<{ [key: string]: BigNumber }>();
  const { library, chainId, account: owner } = wallet || {};
  const account = useMemo(() => targetAddress || owner, [targetAddress, owner]);
  const tokenContract = useTokenContract(chainId, undefined, wallet?.isPortkey);
  const tokensList = useMemo(() => (Array.isArray(tokens) ? tokens : [tokens]), [tokens]);
  const onGetBalance = useCallback(async () => {
    if (!account) return setBalanceMap(undefined);
    let promise;
    if (isELFChain(chainId)) {
      // elf chain
      promise = tokensList.map((symbol) => {
        if (!tokenContract) return '0';
        const tokenInfo = getTokenInfoByWhitelist(chainId, symbol);
        if (!tokenInfo) return '0';
        if (symbol) return getELFChainBalance(tokenContract, tokenInfo.symbol, account);
      });
    } else {
      // erc20 chain
      promise = tokensList.map((i) => {
        if (i && library) {
          if (isERCAddress(i)) return getBalance(library, i, account);
          return getETHBalance(account, library);
        }
      });
    }
    const bs = await Promise.all(promise);
    const obj: any = {};
    tokensList.forEach((key, index) => {
      if (key) obj[key + account + chainId] = bs[index];
    });
    setBalanceMap((preObj) => ({ ...preObj, ...obj }));
  }, [account, tokensList, chainId, tokenContract, library]);
  useInterval(onGetBalance, delay, [onGetBalance, library, tokenContract]);
  const memoBalances = useMemo(() => {
    if (tokensList) return tokensList.map((key) => (balanceMap && key ? balanceMap[key + account + chainId] : ZERO));
    return [ZERO];
  }, [account, balanceMap, chainId, tokensList]);
  return [memoBalances, onGetBalance];
};
