import { CrossFeeTokenDecimals } from 'constants/misc';
import { useWallet } from 'contexts/useWallet/hooks';
import { useCallback, useState } from 'react';
import { isELFChain } from 'utils/aelfUtils';
import { divDecimals } from 'utils/calculate';
import { getChainIdToMap } from 'utils/chain';
import { useBridgeContract } from './useContract';
import useInterval from './useInterval';
import { useReturnLastCallback } from 'hooks';

export function useCrossFee() {
  const { fromWallet, toWallet } = useWallet();
  const { chainId: fromChainId } = fromWallet || {};
  const bridgeContract = useBridgeContract(fromChainId, fromWallet?.isPortkey);
  const { chainId: toChainId } = toWallet || {};
  const [fee, setFee] = useState<string>();
  const getFeeByChainId = useReturnLastCallback(async () => {
    if (!bridgeContract || !(isELFChain(fromChainId) && !isELFChain(toChainId))) return undefined;

    const req = await bridgeContract.callViewMethod('GetFeeByChainId', [getChainIdToMap(toChainId)]);
    if (req && !req.error) {
      return divDecimals(req.value, CrossFeeTokenDecimals).dp(2).toFixed();
    }
    return undefined;
  }, [bridgeContract, fromChainId, toChainId]);

  const refreshFeeByChainId = useCallback(async () => {
    try {
      const result = await getFeeByChainId();
      setFee(result);
    } catch (error) {
      console.log('refreshFeeByChainId error', error);
    }
  }, [getFeeByChainId]);

  useInterval(refreshFeeByChainId, 30000, [refreshFeeByChainId]);
  return fee;
}
