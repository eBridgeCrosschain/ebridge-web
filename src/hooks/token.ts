import { useCallback } from 'react';
import { useActiveWhitelist } from './whitelist';
import { ChainId } from 'types';
import { BRIDGE_TOKEN_MAP } from 'constants/index';

export function useGetTokenInfoByWhitelist() {
  const activeWhitelist = useActiveWhitelist();
  return useCallback(
    (chainId?: ChainId, symbol?: string) => {
      if (!chainId || !symbol) return;
      try {
        return (activeWhitelist as any)[BRIDGE_TOKEN_MAP?.[symbol] || symbol]?.[chainId];
      } catch (error) {
        console.debug(error, 'useGetTokenInfoByWhitelist');
      }
    },
    [activeWhitelist],
  );
}
