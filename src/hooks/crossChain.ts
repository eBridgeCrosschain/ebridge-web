import { useWallet } from 'contexts/useWallet/hooks';
import { useMemo } from 'react';
import { CrossChainType } from 'types';
import { isELFChain } from 'utils/aelfUtils';

export function useCrossChainType() {
  const { fromWallet, toWallet } = useWallet();
  const fromChainId = fromWallet?.chainId;
  const toChainId = toWallet?.chainId;
  return useMemo(() => {
    if (isELFChain(fromChainId) && isELFChain(toChainId)) return CrossChainType.homogeneous;
    return CrossChainType.heterogeneous;
  }, [fromChainId, toChainId]);
}
