import BigNumber from 'bignumber.js';
import { ZERO } from 'constants/misc';
import { getELFChainBalance } from 'contracts';
import { useCallback, useMemo, useState } from 'react';
import { Web3Type } from 'types';
import { isERCAddress, isTonChain } from 'utils';
import { isELFChain } from 'utils/aelfUtils';
import { useTokenContract } from './useContract';
import useInterval from './useInterval';
import { getTokenInfoByWhitelist } from 'utils/whitelist';
import { getTonChainBalance } from 'utils/ton';
import { getBalanceByWagmi } from 'utils/wagmi';

export const useBalances = (
  wallet?: Web3Type,
  tokens?: string | Array<string | undefined>,
  delay: null | number = 10000,
  targetAddress?: string,
): [BigNumber[], () => void] => {
  const [balanceMap, setBalanceMap] = useState<{ [key: string]: BigNumber }>();
  const { chainId, account: owner } = wallet || {};
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
      if (isTonChain(chainId)) {
        // ton chain
        promise = tokensList.map(async (i) => {
          if (!i || !account) return;
          return getTonChainBalance(i, account);
        });
      } else {
        // erc20 chain
        promise = tokensList.map(async (i) => {
          if (i) {
            const params = { address: account as any, token: i as any, chainId: chainId };
            if (!isERCAddress(i)) delete params.token;
            const req = await getBalanceByWagmi(params);
            return req.value;
          }
        });
      }
    }
    const bs = await Promise.all(promise);
    const obj: any = {};
    tokensList.forEach((key, index) => {
      if (key) obj[key + account + chainId] = bs[index];
    });
    setBalanceMap((preObj) => ({ ...preObj, ...obj }));
  }, [account, chainId, tokensList, tokenContract]);
  useInterval(onGetBalance, delay, [onGetBalance, chainId, tokenContract]);
  const memoBalances = useMemo(() => {
    if (tokensList) return tokensList.map((key) => (balanceMap && key ? balanceMap[key + account + chainId] : ZERO));
    return [ZERO];
  }, [account, balanceMap, chainId, tokensList]);
  return [memoBalances, onGetBalance];
};
