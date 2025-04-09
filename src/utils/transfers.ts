import type { APICrossChainItem, CrossChainItem, TokensToken } from 'types/api';
import { getChainIdByAPI } from 'utils/chain';
import { formatAPISymbol } from './token';

export function parseCrossChainTransfers(req?: {
  items: APICrossChainItem[] | undefined;
}): CrossChainItem[] | undefined {
  return req?.items?.map(({ toChainId, fromChainId, transferToken, ...item }) => ({
    toChainId: getChainIdByAPI(toChainId),
    fromChainId: getChainIdByAPI(fromChainId),
    ...item,
    transferToken: { ...transferToken, symbol: formatAPISymbol(transferToken?.symbol) } as TokensToken,
  }));
}
