import type { APICrossChainItem, CrossChainItem } from 'types/api';
import { getChainIdByAPI } from 'utils/chain';

export function parseCrossChainTransfers(req?: {
  items: APICrossChainItem[] | undefined;
}): CrossChainItem[] | undefined {
  return req?.items?.map(({ toChainId, fromChainId, ...item }) => ({
    toChainId: getChainIdByAPI(toChainId),
    fromChainId: getChainIdByAPI(fromChainId),
    ...item,
  }));
}
