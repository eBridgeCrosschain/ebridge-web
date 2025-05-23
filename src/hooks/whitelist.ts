import { useWhitelist } from 'contexts/useWhitelist';
import { WhitelistItem } from 'contexts/useWhitelist/actions';
import { useMemo } from 'react';
import { useWallet } from 'contexts/useWallet/hooks';
import { isSymbol } from 'utils/reg';
export type CurrentWhitelistItem = {
  symbol: string;
} & WhitelistItem;

export function useActiveWhitelist() {
  const [{ whitelistMap, defaultWhitelistMap }] = useWhitelist();
  return useMemo(() => {
    return Object.assign({}, defaultWhitelistMap, whitelistMap);
  }, [defaultWhitelistMap, whitelistMap]);
}

export function useAllWhitelist() {
  const whitelistMap = useActiveWhitelist();
  return useMemo(() => {
    const list: CurrentWhitelistItem[] = Object.entries(whitelistMap).map(([k, v]) => ({
      symbol: k,
      ...v,
    }));
    return list;
  }, [whitelistMap]);
}

export function useCurrentWhitelist() {
  const allList = useAllWhitelist();
  const { fromWallet, toWallet } = useWallet();
  const fromChainId = fromWallet?.chainId;
  const toChainId = toWallet?.chainId;
  return useMemo(() => {
    if (!allList || !toChainId || !fromChainId) return [];
    return allList?.filter((item) => {
      const fromItem = item?.[fromChainId];
      const toItem = item?.[toChainId];
      const canForm = fromItem && !fromItem?.onlyTo;
      const canTo = toItem && !toItem?.onlyFrom;
      return canForm && canTo;
    });
  }, [allList, fromChainId, toChainId]);
}

export function useUserAddedToken(symbol?: string): CurrentWhitelistItem | false {
  const activeWhitelist = useActiveWhitelist();
  const { fromWallet, toWallet } = useWallet();
  const fromChainId = fromWallet?.chainId;
  const toChainId = toWallet?.chainId;
  return useMemo(() => {
    if (!symbol || !isSymbol(symbol) || !toChainId || !fromChainId) return false;
    const info = activeWhitelist?.[symbol.toUpperCase()];
    const tokenSymbol = info?.[fromChainId]?.symbol;
    if (tokenSymbol && info?.[toChainId]?.symbol)
      return {
        symbol: tokenSymbol,
        ...info,
      };
    return false;
  }, [activeWhitelist, fromChainId, symbol, toChainId]);
}
