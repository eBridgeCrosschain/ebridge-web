import BigNumber from 'bignumber.js';
import { ZERO } from 'constants/misc';
import { useReturnLastCallback } from 'hooks';
import { useCallback, useEffect, useState } from 'react';
import { ContractBasic } from 'utils/contract';
export function useAllowance(
  tokenContract?: ContractBasic,
  account?: string,
  approveTargetAddress?: string,
  symbol?: string,
): [BigNumber | undefined, () => void] {
  const [allowance, setAllowance] = useState<BigNumber>();

  const getAllowance = useReturnLastCallback(async () => {
    if (!tokenContract) return undefined;
    if (tokenContract.contractType === 'ELF') {
      if (!symbol) return undefined;
      const req = await tokenContract?.callViewMethod('GetAllowance', [symbol, account, approveTargetAddress]);
      if (!req.error) {
        const allowanceBN = new BigNumber(req.allowance ?? req.amount ?? 0);
        return allowanceBN;
      }
    } else {
      const req = await tokenContract?.callViewMethod('allowance', [account, approveTargetAddress]);
      if (!req.error) {
        return ZERO.plus(req);
      }
    }
    return undefined;
  }, [account, approveTargetAddress, symbol, tokenContract]);

  const refreshAllowance = useCallback(async () => {
    try {
      const result = await getAllowance();
      setAllowance(result);
    } catch (error) {
      console.log('refreshAllowance', error);
    }
  }, [getAllowance]);

  useEffect(() => {
    refreshAllowance();
  }, [refreshAllowance]);
  useEffect(() => {
    if (!account) setAllowance(undefined);
  }, [account]);
  return [allowance, refreshAllowance];
}
