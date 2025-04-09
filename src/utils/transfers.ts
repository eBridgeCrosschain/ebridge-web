import type { APICrossChainItem, CrossChainItem, TokensToken } from 'types/api';
import { getChainIdByAPI } from 'utils/chain';
import { formatAPISymbol } from './token';

export function parseCrossChainTransfers(req?: {
  items: APICrossChainItem[] | undefined;
}): CrossChainItem[] | undefined {
  return req?.items?.map(({ toChainId, fromChainId, transferToken, ...item }) => {
    const data: CrossChainItem = {
      toChainId: getChainIdByAPI(toChainId),
      fromChainId: getChainIdByAPI(fromChainId),
      ...item,
    };
    if (transferToken)
      data.transferToken = { ...transferToken, symbol: formatAPISymbol(transferToken?.symbol) } as TokensToken;
    return data;
  });
}
