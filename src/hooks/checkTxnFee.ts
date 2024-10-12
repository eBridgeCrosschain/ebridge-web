import { useCallback, useMemo, useState } from 'react';
import { useWallet } from 'contexts/useWallet/hooks';
import { divDecimals } from 'utils/calculate';
import { CrossFeeToken, CrossFeeTokenDecimals, ZERO } from 'constants/misc';
import { getELFChainBalance } from 'contracts';
import { useTokenContract } from 'hooks/useContract';
import lodash from 'lodash';
import { useHomeContext } from 'page-components/Bridge/HomeContext';

export function useCheckTxnFeeEnoughAuto() {
  const [{ selectToken, fromInput, crossFee }] = useHomeContext();
  const { fromWallet } = useWallet();
  const { chainId: fromChainId, account: fromAccount } = fromWallet || {};
  const fromTokenInfo = useMemo(() => {
    if (!fromChainId) return;
    const token = lodash.cloneDeep(selectToken?.[fromChainId]);
    if (token?.isNativeToken) token.address = '';
    return token;
  }, [fromChainId, selectToken]);
  const tokenContract = useTokenContract(fromChainId, fromTokenInfo?.address, fromWallet?.isPortkey);
  const [isTxnFeeEnoughTip, setIsTxnFeeEnoughTip] = useState(false);
  const isCanCheckTxnFeeEnoughTip = useMemo(() => {
    return (
      fromWallet &&
      fromWallet?.walletType !== 'ERC' &&
      fromAccount &&
      fromInput &&
      crossFee &&
      ZERO.plus(crossFee).gt(ZERO) &&
      tokenContract
    );
  }, [crossFee, fromAccount, fromInput, fromWallet, tokenContract]);
  const isShowTxnFeeEnoughTip = useMemo(() => {
    return isCanCheckTxnFeeEnoughTip && isTxnFeeEnoughTip;
  }, [isCanCheckTxnFeeEnoughTip, isTxnFeeEnoughTip]);

  useMemo(async () => {
    if (!tokenContract || !crossFee || !fromAccount || !isCanCheckTxnFeeEnoughTip) return;

    try {
      const userBalance = await getELFChainBalance(tokenContract, CrossFeeToken, fromAccount);
      if (divDecimals(userBalance, CrossFeeTokenDecimals).lt(crossFee)) {
        return setIsTxnFeeEnoughTip(true);
      }
      return setIsTxnFeeEnoughTip(false);
    } catch (error) {
      return setIsTxnFeeEnoughTip(false);
    }
  }, [crossFee, fromAccount, isCanCheckTxnFeeEnoughTip, tokenContract]);

  return isShowTxnFeeEnoughTip;
}

export function useCheckTxnFeeEnough() {
  const [{ selectToken, fromInput, crossFee }] = useHomeContext();
  const { fromWallet } = useWallet();
  const { chainId: fromChainId, account: fromAccount } = fromWallet || {};
  const fromTokenInfo = useMemo(() => {
    if (!fromChainId) return;
    const token = lodash.cloneDeep(selectToken?.[fromChainId]);
    if (token?.isNativeToken) token.address = '';
    return token;
  }, [fromChainId, selectToken]);
  const tokenContract = useTokenContract(fromChainId, fromTokenInfo?.address, fromWallet?.isPortkey);
  const [isTxnFeeEnoughTip, setIsTxnFeeEnoughTip] = useState(false);
  const isCanCheckTxnFeeEnoughTip = useMemo(() => {
    return (
      fromWallet &&
      fromWallet?.walletType !== 'ERC' &&
      fromAccount &&
      fromInput &&
      crossFee &&
      ZERO.plus(crossFee).gt(ZERO) &&
      tokenContract
    );
  }, [crossFee, fromAccount, fromInput, fromWallet, tokenContract]);
  const isShowTxnFeeEnoughTip = useMemo(() => {
    return isCanCheckTxnFeeEnoughTip && isTxnFeeEnoughTip;
  }, [isCanCheckTxnFeeEnoughTip, isTxnFeeEnoughTip]);
  const checkTxnFeeEnough = useCallback(async () => {
    if (!isCanCheckTxnFeeEnoughTip || !tokenContract || !crossFee || !fromAccount) return;

    try {
      const userBalance = await getELFChainBalance(tokenContract, CrossFeeToken, fromAccount);
      if (divDecimals(userBalance, CrossFeeTokenDecimals).lt(crossFee)) {
        setIsTxnFeeEnoughTip(true);
        return;
      }
      setIsTxnFeeEnoughTip(false);
      return;
    } catch (error) {
      setIsTxnFeeEnoughTip(false);
      return;
    }
  }, [crossFee, fromAccount, isCanCheckTxnFeeEnoughTip, tokenContract]);

  return { checkTxnFeeEnough, isShowTxnFeeEnoughTip };
}
