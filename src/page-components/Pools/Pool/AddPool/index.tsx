import { Col, Row } from 'antd';
import clsx from 'clsx';
import { useLanguage } from 'i18n';
import { useMemo, useState } from 'react';
import { getChainType } from 'utils/chain';
import styles from '../styles.module.less';
import { ChainId, TokenInfo } from 'types';
import { useEVMSwitchChain, useWeb3Wallet } from 'hooks/web3';
import { useConnect } from 'hooks/useConnect';
import CommonButton from 'components/CommonButton';
import { Trans } from 'react-i18next';
import { useBalances } from 'hooks/useBalances';
import { isELFChain } from 'utils/aelfUtils';
import { divDecimals } from 'utils/calculate';
import CommonAmountRow from 'components/CommonAmountRow';
import { getMaxAmount, parseInputChange } from 'utils/input';
import { getShareOfPool, unitConverter } from 'utils/converter';
import { formatSymbol } from 'utils/token';
import TokenLogo from 'components/TokenLogo';
import { usePoolContract, useTokenContract } from 'hooks/useContract';
import { addLiquidity } from 'utils/pools';
import { useThrottleCallback } from 'hooks';
import { ZERO } from 'constants/misc';
import useLoadingModal from 'hooks/useLoadingModal';
import { ResultType } from 'components/Loading/ResultModal';
import { usePoolTotalLiquidity } from 'hooks/pools';

export type TAddPoolProps = {
  chainId: ChainId;
  tokenInfo?: TokenInfo;
  price: string | number;
};

export default function AddPool({ chainId, tokenInfo, price }: TAddPoolProps) {
  const { t } = useLanguage();

  const [amount, setAmount] = useState<string>();
  const web3Wallet = useWeb3Wallet(chainId);

  const poolContract = usePoolContract(chainId, undefined, web3Wallet?.isPortkey);
  const tokenContract = useTokenContract(chainId, tokenInfo?.address, web3Wallet?.isPortkey);
  const totalLiquidity = usePoolTotalLiquidity({ poolContract, tokenContract, tokenInfo });
  const evmSwitchChain = useEVMSwitchChain();
  const { loadingOpen, modal, setLoadingModal, setResultModal } = useLoadingModal();
  const { account } = web3Wallet || {};
  const connect = useConnect();
  const [[balance]] = useBalances(
    { ...web3Wallet, chainId },
    useMemo(() => {
      if (isELFChain(chainId) || tokenInfo?.isNativeToken) return tokenInfo;
      return tokenInfo?.address;
    }, [chainId, tokenInfo]),
  );

  const showBalance = useMemo(() => divDecimals(balance, tokenInfo?.decimals), [balance, tokenInfo?.decimals]);

  const min = useMemo(() => divDecimals(1, tokenInfo?.decimals), [tokenInfo?.decimals]);
  const max = useMemo(
    () => getMaxAmount({ chainId, symbol: tokenInfo?.symbol, balance: showBalance }),
    [chainId, showBalance, tokenInfo?.symbol],
  );

  const showError = useMemo(() => amount && account && max.lt(amount), [account, amount, max]);

  const onAddLiquidity = useThrottleCallback(async () => {
    try {
      if (!tokenInfo || !account || !tokenContract || !poolContract || !amount) return;
      setLoadingModal({ open: true });
      if (poolContract.contractType === 'ERC') await evmSwitchChain(chainId);

      const req = await addLiquidity({
        tokenInfo,
        amount: amount,
        account: account,
        poolContract,
        chainId,
        tokenContract,
      });
      if (req?.error) {
        setResultModal({ open: true, type: ResultType.REJECTED, onRetry: onAddLiquidity });
      } else {
        setAmount('');
        setResultModal({ open: true, type: ResultType.APPROVED });
      }
    } catch (error) {
      setResultModal({ open: true, type: ResultType.REJECTED, onRetry: onAddLiquidity });
    } finally {
      totalLiquidity.onGetTotalLiquidity();
      setLoadingModal({ open: false });
    }
  }, [
    tokenInfo,
    account,
    tokenContract,
    poolContract,
    amount,
    setLoadingModal,
    evmSwitchChain,
    chainId,
    setResultModal,
    totalLiquidity,
  ]);
  const btnProps = useMemo(() => {
    let children = 'Enter Amount';
    let disabled = true;
    let onClick = onAddLiquidity;

    if (!account) {
      onClick = () => connect(getChainType(chainId), chainId);
      children = 'Connect';
      disabled = false;
      return { children, disabled, onClick };
    }

    if (max.lt(amount ?? '0')) {
      disabled = true;
      onClick = () => connect(getChainType(chainId), chainId);
      children = 'Insufficient balance';
      return { children, disabled, onClick };
    }

    if (amount && ZERO.lte(amount)) {
      children = 'Add';
      disabled = false;
    }

    return { children, disabled, onClick };
  }, [account, amount, chainId, connect, max, onAddLiquidity]);
  return (
    <div className={styles['operate-pool']}>
      <CommonAmountRow
        showBalance={!!web3Wallet.account}
        showError={!!showError}
        value={amount}
        onClickMAX={() => setAmount(parseInputChange(max.toFixed(), min, tokenInfo?.decimals))}
        onAmountInputChange={(e) => setAmount(parseInputChange(e.target.value, min, tokenInfo?.decimals))}
        leftHeaderTitle={t('Amount')}
        rightHeaderTitle={`${unitConverter(showBalance)} ${formatSymbol(tokenInfo?.symbol)}`}
        rightInputEle={
          <Row className={clsx('flex-row-center', styles['token-logo-row'], 'font-family-medium')}>
            <TokenLogo
              className={styles['token-logo']}
              chainId={chainId}
              symbol={tokenInfo?.symbol}
              src={tokenInfo?.icon}
            />
            <div>{formatSymbol(tokenInfo?.symbol)}</div>
          </Row>
        }
      />
      <div className={styles['estimated-value']}>
        {t('Estimated value')}: ${unitConverter(ZERO.plus(amount ?? 0).times(price))}
      </div>
      <Col className={styles['share-col']}>
        <div className={clsx('flex-row-center flex-row-between', styles['share-row'])}>
          <div>{t('Share of Pool')}</div> <div>{getShareOfPool(amount, totalLiquidity.showTotalLiquidity)}%</div>
        </div>
        <div className={clsx('flex-row-center flex-row-between', styles['share-row'])}>
          <div>{t('Liquidity')}</div>
          <div>${unitConverter(ZERO.plus(totalLiquidity.showTotalLiquidity).times(price))}</div>
        </div>
      </Col>
      {modal}
      <CommonButton
        {...btnProps}
        loading={loadingOpen}
        type="primary"
        className={clsx(styles['action-btn'], loadingOpen && styles['action-btn-loading'])}>
        <Trans>{btnProps.children}</Trans>
      </CommonButton>
    </div>
  );
}
