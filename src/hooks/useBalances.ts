import BigNumber from 'bignumber.js';
import { ZERO } from 'constants/misc';
import { getELFChainBalance } from 'contracts';
import { useCallback, useMemo, useState } from 'react';
import { TokenInfo, Web3Type } from 'types';
import { isERCAddress, isTonChain } from 'utils';
import { isELFChain } from 'utils/aelfUtils';
import { useTokenContract } from './useContract';
import useInterval from './useInterval';
import { getTonChainBalance } from 'utils/ton';
import { getBalanceByWagmi } from 'utils/wagmi';
import { useGetTokenInfoByWhitelist } from './token';

export const useBalances = (
  wallet?: Web3Type,
  tokens?: string | TokenInfo | Array<string | undefined | TokenInfo>,
  delay: null | number = 10000,
  targetAddress?: string,
): [BigNumber[], () => void] => {
  const [balanceMap, setBalanceMap] = useState<{ [key: string]: BigNumber }>();
  const { chainId, account: owner } = wallet || {};
  const account = useMemo(() => targetAddress || owner, [targetAddress, owner]);
  const tokenContract = useTokenContract(chainId, undefined, wallet?.isPortkey);
  const tokensList = useMemo(() => (Array.isArray(tokens) ? tokens : [tokens]), [tokens]);
  const getTokenInfoByWhitelist = useGetTokenInfoByWhitelist();
  const onGetBalance = useCallback(async () => {
    if (!account) return setBalanceMap(undefined);
    let promise;
    if (isELFChain(chainId)) {
      // elf chain
      promise = tokensList.map((info) => {
        if (!tokenContract) return '0';
        const isSymbol = typeof info === 'string';
        const symbol = isSymbol ? info : info?.symbol;
        const tokenInfo = isSymbol ? getTokenInfoByWhitelist(chainId, symbol) : info;
        if (!tokenInfo) return '0';
        if (symbol) return getELFChainBalance(tokenContract, tokenInfo.symbol, account);
      });
    } else {
      if (isTonChain(chainId)) {
        // ton chain
        promise = tokensList.map(async (info) => {
          const isAddress = typeof info === 'string';
          const address = isAddress ? info : info?.address;
          if (!address || !account) return;
          return getTonChainBalance(address, account);
        });
      } else {
        // erc20 chain
        promise = tokensList.map(async (info) => {
          const isAddress = typeof info === 'string';
          const address = isAddress ? info : info?.address;
          if (info && address) {
            const params = { address: account as any, token: address as any, chainId: chainId };
            if (!isERCAddress(address)) delete params.token;
            const req = await getBalanceByWagmi(params);
            return req.value.toString();
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
  }, [account, chainId, tokensList, tokenContract, getTokenInfoByWhitelist]);
  useInterval(onGetBalance, [onGetBalance, chainId, tokenContract], delay);
  const memoBalances = useMemo(() => {
    if (tokensList)
      return tokensList.map((key) => (balanceMap && key ? balanceMap[key + (account || '') + chainId] : ZERO));
    return [ZERO];
  }, [account, balanceMap, chainId, tokensList]);
  return [memoBalances, onGetBalance];
};
