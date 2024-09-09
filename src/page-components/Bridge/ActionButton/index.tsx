import clsx from 'clsx';
import lodash from 'lodash';
import CommonButton from 'components/CommonButton';
import { useWallet } from 'contexts/useWallet/hooks';
import { useBridgeContract, useTokenContract } from 'hooks/useContract';
import { useCallback, useMemo, useState } from 'react';
import styles from './styles.module.less';
import { CrossChainTransfer, CreateReceipt, LockToken } from 'utils/crossChain';
import { useHomeContext } from '../HomeContext';
import { timesDecimals } from 'utils/calculate';
import { setActionLoading, setFrom } from '../HomeContext/actions';
import { Trans } from 'react-i18next';
import { CrossFeeToken, LANG_MAX, MaxUint256, ZERO } from 'constants/misc';
import { useLanguage } from 'i18n';
import useLockCallback from 'hooks/useLockCallback';
import { useUpdateEffect } from 'react-use';
import { useAllowance } from 'hooks/useAllowance';
import { isELFChain } from 'utils/aelfUtils';
import { ACTIVE_CHAIN } from 'constants/index';
import { formatAddress, isAddress } from 'utils';
import CheckToFillAddressModal from './CheckToFillAddressModal';
import useLimitAmountModal from '../useLimitAmountModal';
import CommonMessage from 'components/CommonMessage';
import useCheckPortkeyStatus from 'hooks/useCheckPortkeyStatus';
import { arrowRightWhiteIcon } from 'assets/images';
import CommonImage from 'components/CommonImage';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { setWalletsModal } from 'contexts/useModal/actions';
import LoadingModal from './LoadingModal';
import ResultModal, { IResultModalProps, ResultType } from './ResultModal';

export default function ActionButton() {
  const { fromWallet, toWallet, isHomogeneous } = useWallet();
  const [toConfirmModal, setToConfirmModal] = useState<boolean>(false);
  const [
    { selectToken, fromInput, receiveItem, fromBalance, actionLoading, crossMin, toChecked, toAddress, crossFee },
    { dispatch },
  ] = useHomeContext();
  const { chainId: fromChainId, account: fromAccount, library } = fromWallet || {};
  const { chainId: toChainId, account: toAccount } = toWallet || {};
  const fromTokenInfo = useMemo(() => {
    if (!fromChainId) return;
    const token = lodash.cloneDeep(selectToken?.[fromChainId]);
    if (token?.isNativeToken) token.address = '';
    return token;
  }, [fromChainId, selectToken]);
  const { t } = useLanguage();
  const modalDispatch = useModalDispatch();
  const INIT_RESULT_MODAL_PROPS = {
    open: false,
    type: ResultType.APPROVED,
    onRetry: undefined,
  };
  const [resultModalProps, setResultModalProps] = useState<Omit<IResultModalProps, 'onClose'>>(INIT_RESULT_MODAL_PROPS);

  const tokenContract = useTokenContract(fromChainId, fromTokenInfo?.address, fromWallet?.isPortkey);
  const bridgeContract = useBridgeContract(fromChainId, fromWallet?.isPortkey);

  const [fromTokenAllowance, getAllowance] = useAllowance(
    tokenContract,
    fromAccount,
    bridgeContract?.address,
    fromTokenInfo?.symbol,
  );
  const [feeTokenAllowance, getFeeAllowance] = useAllowance(
    isELFChain(fromChainId) ? tokenContract : undefined,
    fromAccount,
    bridgeContract?.address,
    CrossFeeToken === fromTokenInfo?.symbol ? undefined : CrossFeeToken,
  );

  const [limitAmountModal, checkLimitAndRate] = useLimitAmountModal();

  const { checkPortkeyConnect } = useCheckPortkeyStatus();

  const onCrossChainTransfer = useLockCallback(async () => {
    if (!(fromChainId && toChainId)) return;

    const token = selectToken?.[fromChainId] || selectToken?.[toChainId];
    if (!(tokenContract && fromAccount && toAccount && token && fromInput)) return;
    dispatch(setActionLoading(true));

    if (!(await checkPortkeyConnect(isELFChain(fromChainId) ? fromChainId : toChainId))) {
      dispatch(setActionLoading(false));
      return;
    }
    try {
      const req = await CrossChainTransfer({
        contract: tokenContract,
        account: fromAccount,
        to: toAccount,
        token,
        toChainId: toChainId,
        amount: timesDecimals(fromInput, token.decimals).toFixed(0),
      });
      if (!req.error) {
        dispatch(setFrom(''));
        setResultModalProps({ open: true, type: ResultType.APPROVED });
      } else {
        setResultModalProps({ open: true, type: ResultType.REJECTED, onRetry: onCrossChainTransfer });
      }
    } catch (error: any) {
      CommonMessage.error(error.message);
      setResultModalProps({ open: true, type: ResultType.REJECTED, onRetry: onCrossChainTransfer });
    }
    dispatch(setActionLoading(false));
  }, [dispatch, fromAccount, fromChainId, fromInput, selectToken, toAccount, toChainId, tokenContract]);

  const onApprove = useCallback(
    async (symbol?: string) => {
      if (!fromAccount || !fromChainId || !tokenContract) return;
      dispatch(setActionLoading(true));
      try {
        const approveResult = await tokenContract.callSendMethod(
          'approve',
          fromAccount,
          tokenContract.contractType === 'ELF'
            ? [bridgeContract?.address, symbol, LANG_MAX.toFixed()]
            : [bridgeContract?.address, MaxUint256],
        );
        if (!approveResult.error) {
          getAllowance();
          getFeeAllowance();
        }
      } catch (error: any) {
        CommonMessage.error(error.message);
        setResultModalProps({ open: true, type: ResultType.REJECTED, onRetry: onCreateReceipt });
        dispatch(setActionLoading(false));
        throw new Error('Approval failed');
      }
    },
    [bridgeContract?.address, dispatch, fromAccount, fromChainId, getAllowance, getFeeAllowance, tokenContract],
  );

  const onCreateReceipt = useCallback(async () => {
    let symbol: string | undefined;
    if (feeTokenAllowance?.lte(0)) {
      symbol = CrossFeeToken;
    } else if (fromTokenAllowance?.lte(0)) {
      symbol = fromTokenInfo?.symbol;
    }
    if (symbol) {
      try {
        await onApprove(symbol);
      } catch (error) {
        return;
      }
    }

    if (
      !(
        fromTokenInfo &&
        fromAccount &&
        bridgeContract &&
        toChainId &&
        fromChainId &&
        ((toChecked && (toAccount || isAddress(toAddress, toChainId))) || toAccount)
      )
    )
      return;
    dispatch(setActionLoading(true));
    const params: any = {
      library,
      fromToken: fromTokenInfo?.address || fromTokenInfo?.symbol,
      account: fromAccount,
      bridgeContract,
      amount: timesDecimals(fromInput, fromTokenInfo.decimals).toFixed(0),
      toChainId,
      to: toChecked && toAddress ? toAddress : (toAccount as string),
      crossFee,
    };

    if (!(await checkPortkeyConnect(isELFChain(fromChainId) ? fromChainId : toChainId))) {
      dispatch(setActionLoading(false));
      return;
    }

    if (await checkLimitAndRate('transfer', fromInput)) {
      dispatch(setActionLoading(false));
      return;
    }

    if (tokenContract) {
      params.tokenContract = tokenContract;
    }

    try {
      const req = await (fromTokenInfo.isNativeToken ? LockToken : CreateReceipt)(params);
      if (!req?.error) {
        dispatch(setFrom(''));
        setResultModalProps({ open: true, type: ResultType.APPROVED });
      } else {
        setResultModalProps({ open: true, type: ResultType.REJECTED, onRetry: onCreateReceipt });
      }
    } catch (error: any) {
      error?.message && CommonMessage.error(error.message);
      setResultModalProps({ open: true, type: ResultType.REJECTED, onRetry: onCreateReceipt });
    }
    dispatch(setActionLoading(false));
  }, [
    fromTokenInfo,
    fromAccount,
    bridgeContract,
    toChainId,
    fromChainId,
    toChecked,
    toAccount,
    toAddress,
    dispatch,
    library,
    fromInput,
    crossFee,
    checkPortkeyConnect,
    checkLimitAndRate,
    tokenContract,
  ]);

  const needConfirm = useMemo(
    () =>
      !isHomogeneous &&
      toAccount &&
      toChecked &&
      isAddress(toAddress, toChainId) &&
      toAddress &&
      toAccount !== formatAddress(toAddress),
    [isHomogeneous, toAccount, toChecked, toAddress, toChainId],
  );

  const btnProps = useMemo(() => {
    let children: React.ReactNode = (
        <div className={clsx(styles['button-content'], 'flex-center')}>
          <span>Bridge</span>
          <CommonImage className={styles['arrow-icon']} src={arrowRightWhiteIcon} />
        </div>
      ),
      onClick: any,
      disabled = true;
    if (!fromAccount && !toChecked && !toAccount) {
      children = 'Connect Wallets';
      disabled = false;
      onClick = () => modalDispatch(setWalletsModal(true));
      return { children, onClick, disabled };
    }

    if (isHomogeneous) {
      if (!toAccount) {
        children = 'Connect Wallet';
        return { children, onClick, disabled };
      }
    } else {
      if (!toChecked) {
        if (!toAccount) {
          children = 'Connect Wallet';
          return { children, onClick, disabled };
        }
      } else {
        if ((toAddress && !isAddress(toAddress, toChainId)) || (!toAddress && !toAccount))
          children = 'Enter destination address';
        return { children, onClick, disabled };
      }
    }

    // invalid to chain
    if (toChainId && !ACTIVE_CHAIN[toChainId]) {
      children = 'Invalid to chain';
      return { children, onClick, disabled };
    }
    if (!fromAccount) {
      children = 'Connect Wallet';
      return { children, onClick, disabled };
    }
    if (!fromInput) {
      children = 'Enter an amount';
      return { children, disabled, onClick };
    }
    // invalid from chain
    if (fromChainId && !ACTIVE_CHAIN[fromChainId]) {
      children = 'Invalid from chain';
      return { children, onClick, disabled };
    }
    if (!fromBalance?.show || fromBalance?.show.lt(fromInput)) {
      children = 'Insufficient balance';
      return { children, onClick, disabled };
    } else if (ZERO.lt(fromInput)) {
      // crossMin
      if (crossMin && ZERO.plus(crossMin).gt(fromInput)) {
        children = `${t('The minimum crosschain amount is2')}${crossMin} ${fromTokenInfo?.symbol}`;
        return { children, onClick, disabled };
      } else {
        disabled = false;
        if (isHomogeneous) {
          onClick = onCrossChainTransfer;
          return { children, onClick, disabled };
        } else {
          if (needConfirm) {
            onClick = () => setToConfirmModal(true);
            return { children, onClick, disabled };
          } else {
            onClick = onCreateReceipt;
            return { children, onClick, disabled };
          }
        }
      }
    }
    return { children, disabled, onClick };
  }, [
    toAccount,
    toChecked,
    toAddress,
    toChainId,
    fromAccount,
    receiveItem,
    isHomogeneous,
    feeTokenAllowance,
    fromTokenAllowance,
    fromInput,
    t,
    onApprove,
    fromTokenInfo?.symbol,
    fromChainId,
    fromBalance?.show,
    crossMin,
    onCrossChainTransfer,
    onCreateReceipt,
    needConfirm,
  ]);

  useUpdateEffect(() => {
    dispatch(setActionLoading(false));
  }, [btnProps.children]);
  return (
    <>
      <CommonButton {...btnProps} className={styles['action-btn']} type="primary">
        <Trans>{btnProps.children}</Trans>
      </CommonButton>
      <CheckToFillAddressModal
        visible={toConfirmModal}
        setVisible={setToConfirmModal}
        onSuccess={() => {
          onCreateReceipt();
          setToConfirmModal(false);
        }}
      />
      {limitAmountModal}
      <LoadingModal open={actionLoading} />
      <ResultModal {...resultModalProps} onClose={() => setResultModalProps(INIT_RESULT_MODAL_PROPS)} />
    </>
  );
}