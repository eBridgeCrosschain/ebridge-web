import { useCallback, useMemo } from 'react';
import { useToken } from '.';

export function useTokenDispatch() {
  const [, { dispatch }] = useToken();
  return useCallback(dispatch, [dispatch]);
}

export function useTokenPriceByContext(symbol?: string) {
  const [{ tokenPriceMap }] = useToken();
  return useMemo(() => {
    if (!tokenPriceMap || !symbol) return '0';
    return tokenPriceMap[symbol];
  }, [symbol, tokenPriceMap]);
}
