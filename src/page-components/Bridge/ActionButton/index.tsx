import clsx from 'clsx';
import lodash from 'lodash';
import CommonButton from 'components/CommonButton';
import { useWallet } from 'contexts/useWallet/hooks';
import { useBridgeContract, useTokenContract } from 'hooks/useContract';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './styles.module.less';
import { CrossChainTransfer, CreateReceipt, LockToken } from 'utils/crossChain';
import { useHomeContext } from '../HomeContext';
import { timesDecimals } from 'utils/calculate';
import { setActionLoading, setFrom } from '../HomeContext/actions';
import { Trans } from 'react-i18next';
import { ZERO } from 'constants/misc';
import { useLanguage } from 'i18n';
import useLockCallback from 'hooks/useLockCallback';
import { isELFChain } from 'utils/aelfUtils';
import { ACTIVE_CHAIN } from 'constants/index';
import { formatAddress, isAddress, isChainAddress } from 'utils';
import CheckToFillAddressModal from './CheckToFillAddressModal';
import useLimitAmountModal from '../useLimitAmountModal';
import useCheckPortkeyStatus from 'hooks/useCheckPortkeyStatus';
import { arrowRightWhiteIcon } from 'assets/images';
import CommonImage from 'components/CommonImage';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { setWalletsModal } from 'contexts/useModal/actions';
import { useAelfLogin } from 'hooks/wallet';
import { getMaxAmount } from 'utils/input';
import { useCheckTxnFeeEnough } from 'hooks/checkTxnFee';
import { useConnect } from 'hooks/useConnect';
import useLoadingModal from 'hooks/useLoadingModal';
import { ResultType } from 'components/Loading/ResultModal';

export default function ActionButton() {
  const { fromWallet, toWallet, fromOptions, toOptions, isHomogeneous } = useWallet();
  const login = useAelfLogin();
  const connect = useConnect();
  const [toConfirmModal, setToConfirmModal] = useState<boolean>(false);
  const [
    { selectToken, fromInput, fromBalance, actionLoading, crossMin, toChecked, toAddress, crossFee },
    { dispatch },
  ] = useHomeContext();
  const { chainId: fromChainId, account: fromAccount } = fromWallet || {};
  const { chainId: toChainId, account: toAccount } = toWallet || {};
  const fromTokenInfo = useMemo(() => {
    if (!fromChainId) return;
    const token = lodash.cloneDeep(selectToken?.[fromChainId]);
    if (token?.isNativeToken) token.address = '';
    return token;
  }, [fromChainId, selectToken]);
  const { t } = useLanguage();
  const modalDispatch = useModalDispatch();

  const { modal, setLoadingModal, setResultModal } = useLoadingModal(
    useMemo(
      () => ({
        resultModalProps: {
          onClose: () => setIsBridgeButtonLoading(false),
          approvedDescription:
            "The transaction has been approved. You can check it's status in the “Transactions” page.",
        },
      }),
      [],
    ),
  );

  useEffect(() => {
    setLoadingModal({ open: actionLoading });
  }, [actionLoading, setLoadingModal]);

  const [isBridgeButtonLoading, setIsBridgeButtonLoading] = useState(false);

  const tokenContract = useTokenContract(fromChainId, fromTokenInfo?.address, fromWallet?.isPortkey);
  const bridgeContract = useBridgeContract(fromChainId, fromWallet?.isPortkey);

  const [limitAmountModal, checkLimitAndRate] = useLimitAmountModal();

  const { checkPortkeyConnect } = useCheckPortkeyStatus();

  const onCrossChainTransfer = useLockCallback(async () => {
    if (!(fromChainId && toChainId)) return;

    const token = selectToken?.[fromChainId] || selectToken?.[toChainId];
    if (!(tokenContract && fromAccount && toAccount && token && fromInput)) return;
    dispatch(setActionLoading(true));
    setIsBridgeButtonLoading(true);

    if (!(await checkPortkeyConnect(isELFChain(fromChainId) ? fromChainId : toChainId))) {
      setIsBridgeButtonLoading(false);
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
        setResultModal({ open: true, type: ResultType.APPROVED });
      } else {
        setResultModal({ open: true, type: ResultType.REJECTED, onRetry: onCrossChainTransfer });
      }
    } catch (error: any) {
      setResultModal({ open: true, type: ResultType.REJECTED, onRetry: onCrossChainTransfer });
    }
    dispatch(setActionLoading(false));
  }, [
    checkPortkeyConnect,
    dispatch,
    fromAccount,
    fromChainId,
    fromInput,
    selectToken,
    setResultModal,
    toAccount,
    toChainId,
    tokenContract,
  ]);

  const onCreateReceipt = useCallback(async () => {
    console.log(
      fromTokenInfo,
      fromAccount,
      bridgeContract,
      toChainId,
      fromChainId,
      (toChecked && (toAccount || isAddress(toAddress, toChainId))) || toAccount,
    );

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
    setIsBridgeButtonLoading(true);

    const params: any = {
      fromChainId,
      fromToken: isELFChain(fromChainId) ? fromTokenInfo?.symbol : fromTokenInfo?.address,
      account: fromAccount,
      bridgeContract,
      amount: timesDecimals(fromInput, fromTokenInfo.decimals).toFixed(0),
      toChainId,
      to: toChecked && toAddress ? toAddress : (toAccount as string),
      crossFee,
    };

    if (!(await checkPortkeyConnect(isELFChain(fromChainId) ? fromChainId : toChainId))) {
      setIsBridgeButtonLoading(false);
      dispatch(setActionLoading(false));
      return;
    }

    if (await checkLimitAndRate('transfer', fromInput)) {
      setIsBridgeButtonLoading(false);
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
        setResultModal({
          open: true,
          type: ResultType.APPROVED,
        });
      } else {
        setResultModal({ open: true, type: ResultType.REJECTED, onRetry: onCreateReceipt });
      }
    } catch (error: any) {
      setResultModal({ open: true, type: ResultType.REJECTED, onRetry: onCreateReceipt });
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
    fromInput,
    crossFee,
    checkPortkeyConnect,
    checkLimitAndRate,
    tokenContract,
    setResultModal,
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

  const getWalletBtnProps = useCallback(
    ({ isFrom = false }: { isFrom?: boolean }) => {
      const chainType = isFrom ? fromOptions?.chainType : toOptions?.chainType;
      const wallet = isFrom ? fromWallet : toWallet;
      const { chainId } = wallet || {};
      const isELF = chainType === 'ELF';
      const children = isELF ? 'Connect aelf Wallet' : 'Connect External Wallet';
      const disabled = false;
      const onClick = () => {
        connect(chainType, chainId);
      };
      return { children, onClick, disabled };
    },
    [connect, fromOptions?.chainType, fromWallet, toOptions?.chainType, toWallet],
  );

  const { isShowTxnFeeEnoughTip, checkTxnFeeEnough } = useCheckTxnFeeEnough();
  const btnProps = useMemo(() => {
    let children: React.ReactNode = (
        <div className={clsx(styles['button-content'], 'flex-center')}>
          <span>{t('Bridge')}</span>
          <CommonImage priority className={styles['arrow-icon']} src={arrowRightWhiteIcon} />
        </div>
      ),
      onClick: any,
      disabled = true;
    if (
      fromWallet &&
      fromWallet?.walletType !== 'ERC' &&
      fromAccount &&
      fromInput &&
      crossFee &&
      ZERO.plus(crossFee).gt(ZERO) &&
      tokenContract
    ) {
      checkTxnFeeEnough();
    }

    if (isBridgeButtonLoading) {
      children = 'Bridge';
      disabled = true;
      return { children, onClick, disabled, loading: true };
    }
    if (!fromAccount && !toChecked && !toAccount) {
      disabled = false;
      if (isHomogeneous) {
        children = 'Connect Wallet';
        onClick = () => login();
      } else {
        children = 'Connect Wallets';
        onClick = () => modalDispatch(setWalletsModal(true));
      }
      return { children, onClick, disabled };
    }

    if (!fromAccount) {
      const props = getWalletBtnProps({ isFrom: true });
      return { children: props.children, onClick: props.onClick, disabled: props.disabled };
    }

    if (isHomogeneous) {
      if (!toAccount) {
        const props = getWalletBtnProps({ isFrom: false });
        return { children: props.children, onClick: props.onClick, disabled: props.disabled };
      }
    } else {
      if (!toChecked) {
        if (!toAccount) {
          const props = getWalletBtnProps({ isFrom: false });
          return { children: props.children, onClick: props.onClick, disabled: props.disabled };
        }
      } else {
        if ((toAddress && !isChainAddress(toAddress, toChainId)) || !toAddress) {
          children = 'Enter destination address';
          return { children, onClick, disabled };
        }
      }
    }

    // invalid to chain
    if (toChainId && !ACTIVE_CHAIN[toChainId]) {
      children = 'Invalid to chain';
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

    const max = getMaxAmount({
      chainId: fromWallet?.chainId,
      symbol: fromBalance?.token?.symbol,
      balance: fromBalance?.show,
      crossFee,
    });

    if (max.lt(fromInput)) {
      children = 'Insufficient balance';
      return { children, onClick, disabled };
    } else if (ZERO.lt(fromInput)) {
      // crossMin
      if (crossMin && ZERO.plus(crossMin).gt(fromInput)) {
        children = `${t('The minimum crosschain amount is2')}${crossMin} ${fromTokenInfo?.symbol}`;
        return { children, onClick, disabled };
      } else if (isShowTxnFeeEnoughTip) {
        return {
          disabled: true,
          loading: false,
          onClick: undefined,
          children: 'Not enough ELF for Txn fee',
        };
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
    fromInput,
    t,
    fromWallet,
    fromAccount,
    crossFee,
    tokenContract,
    isBridgeButtonLoading,
    toChecked,
    toAccount,
    isHomogeneous,
    toChainId,
    fromChainId,
    fromBalance?.token?.symbol,
    fromBalance?.show,
    isShowTxnFeeEnoughTip,
    checkTxnFeeEnough,
    login,
    modalDispatch,
    getWalletBtnProps,
    toAddress,
    crossMin,
    fromTokenInfo?.symbol,
    onCrossChainTransfer,
    needConfirm,
    onCreateReceipt,
  ]);

  return (
    <>
      <CommonButton
        {...btnProps}
        className={clsx(styles['action-btn'], isBridgeButtonLoading && styles['action-btn-loading'])}
        type="primary">
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
      {modal}
    </>
  );
}
