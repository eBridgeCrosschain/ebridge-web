import { useCallback, useEffect } from 'react';
import { useActiveWhitelist } from './whitelist';
import { ChainId } from 'types';
import { BRIDGE_TOKEN_MAP } from 'constants/index';
import { getTokenPrice } from 'utils/api/common';
import { useTokenDispatch, useTokenPriceByContext } from 'contexts/useToken/hooks';
import { addTokenPrice } from 'contexts/useToken/actions';

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

export function useTokenPrice(symbol1?: string) {
  const dispatch = useTokenDispatch();

  const price = useTokenPriceByContext(symbol1);
  const onGetTokenPrice = useCallback(
    async (symbol2?: string) => {
      const symbol = symbol2 || symbol1;
      if (!symbol) return '0';
      try {
        const req = await getTokenPrice({ symbol, amount: '1' });
        dispatch(addTokenPrice(symbol, req.tokenAmountInUsd));
        return req.tokenAmountInUsd;
      } catch (error) {
        console.debug(error, 'onGetTokenPrice');
      }
    },
    [dispatch, symbol1],
  );
  useEffect(() => {
    onGetTokenPrice();
  }, [onGetTokenPrice]);

  return { price, onGetTokenPrice };
}
