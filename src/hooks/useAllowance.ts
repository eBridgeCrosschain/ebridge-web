import BigNumber from 'bignumber.js';
import { ZERO } from 'constants/misc';
import { useCallback, useEffect, useState } from 'react';
import { ContractBasic } from 'utils/contract';
export function useAllowance(
  tokenContract?: ContractBasic,
  account?: string,
  approveTargetAddress?: string,
  symbol?: string,
): [BigNumber | undefined, () => void] {
  const [allowance, setAllowance] = useState<BigNumber>();
  const getAllowance = useCallback(async () => {
    if (!tokenContract) return setAllowance(undefined);
    if (tokenContract.contractType === 'ELF') {
      if (!symbol) return setAllowance(undefined);
      const req = await tokenContract?.callViewMethod('GetAllowance', [symbol, account, approveTargetAddress]);
      if (!req.error) {
        const allowanceBN = new BigNumber(req.allowance ?? req.amount ?? 0);
        setAllowance(allowanceBN);
      }
    } else {
      const req = await tokenContract?.callViewMethod('allowance', [account, approveTargetAddress]);
      if (!req?.error) {
        setAllowance(ZERO.plus(req));
      }
    }
  }, [account, approveTargetAddress, symbol, tokenContract]);
  useEffect(() => {
    getAllowance();
  }, [getAllowance]);
  useEffect(() => {
    if (!account) setAllowance(undefined);
  }, [account]);
  return [allowance, getAllowance];
}
