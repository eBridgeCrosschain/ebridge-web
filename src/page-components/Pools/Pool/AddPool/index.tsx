import { Col, Row } from 'antd';
import clsx from 'clsx';
import IconFont from 'components/IconFont';
import { useLanguage } from 'i18n';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { getChainName, getChainType, getIconByChainId } from 'utils/chain';
import styles from '../styles.module.less';
import { ChainId, TokenInfo } from 'types';
import { useWeb3Wallet } from 'hooks/web3';
import { useConnect } from 'hooks/useConnect';
import CommonButton from 'components/CommonButton';
import { Trans } from 'react-i18next';
import { useBalances } from 'hooks/useBalances';
import { isELFChain } from 'utils/aelfUtils';
import { divDecimals } from 'utils/calculate';
import CommonAmountRow from 'components/CommonAmountRow';
import { getMaxAmount, parseInputChange } from 'utils/input';
import { unitConverter } from 'utils/converter';
import { formatSymbol } from 'utils/token';
import TokenLogo from 'components/TokenLogo';
import { usePoolContract, useTokenContract } from 'hooks/useContract';
import { addLiquidity } from 'utils/pools';
import { useThrottleCallback } from 'hooks';
import { ZERO } from 'constants/misc';
import useLoadingModal from 'hooks/useLoadingModal';
import { ResultType } from 'components/Loading/ResultModal';

export type TAddPoolProps = {
  chainId: ChainId;
  tokenInfo?: TokenInfo;
};

export default function AddPool({ chainId, tokenInfo }: TAddPoolProps) {
  const { t } = useLanguage();

  const { push } = useRouter();

  const [amount, setAmount] = useState<string>();

  const poolContract = usePoolContract(chainId);
  const tokenContract = useTokenContract(chainId, tokenInfo?.address);

  const web3Wallet = useWeb3Wallet(chainId);
  const { loadingOpen, modal, setLoadingModal, setResultModal } = useLoadingModal();
  const { account, library } = web3Wallet || {};
  const connect = useConnect();
  const [[balance]] = useBalances(
    { ...web3Wallet, chainId },
    useMemo(() => {
      if (isELFChain(chainId) || tokenInfo?.isNativeToken) return [tokenInfo?.symbol];
      return [tokenInfo?.address];
    }, [chainId, tokenInfo?.address, tokenInfo?.isNativeToken, tokenInfo?.symbol]),
  );

  const showBalance = useMemo(() => divDecimals(balance, tokenInfo?.decimals), [balance, tokenInfo?.decimals]);

  const min = useMemo(() => divDecimals(1, tokenInfo?.decimals), [tokenInfo?.decimals]);
  const max = useMemo(
    () => getMaxAmount({ chainId, symbol: tokenInfo?.symbol, balance: showBalance }),
    [chainId, showBalance, tokenInfo?.symbol],
  );

  const showError = useMemo(() => amount && account && max.lt(amount), [account, amount, max]);

  const chainIcon = useMemo(() => {
    const iconProps = getIconByChainId(chainId);
    if (!iconProps) return null;
    return (
      <Row className={clsx('flex-row-center', styles['chain-icon-row'], 'font-family-medium')}>
        <IconFont className={styles['chain-icon']} type={iconProps?.type || ''} />
        {getChainName(chainId)}
      </Row>
    );
  }, [chainId]);

  useEffect(() => {
    if (!chainIcon || !tokenInfo) {
      push('/pools');
    }
  }, [chainIcon, push, tokenInfo]);

  const onAddLiquidity = useThrottleCallback(async () => {
    try {
      if (!tokenInfo || !account || !tokenContract || !poolContract || !amount) return;
      setLoadingModal({ open: true });
      const req = await addLiquidity({
        symbol: tokenInfo?.symbol,
        amount: amount,
        account: account,
        library: library as any,
        poolContract,
        chainId,
        tokenContract,
      });
      if (req.error) {
        setResultModal({ open: true, type: ResultType.REJECTED });
      } else {
        setResultModal({ open: true, type: ResultType.APPROVED });
      }
      console.log(req, '=====req');
    } catch (error) {
      setResultModal({ open: true, type: ResultType.REJECTED });
    } finally {
      setLoadingModal({ open: false });
    }
  }, [account, amount, chainId, library, poolContract, tokenContract, tokenInfo]);
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
            <TokenLogo className={styles['token-logo']} chainId={chainId} symbol={tokenInfo?.symbol} />
            <div>{formatSymbol(tokenInfo?.symbol)}</div>
          </Row>
        }
      />
      <Col className={styles['share-col']}>
        <div className={clsx('flex-row-center flex-row-between', styles['share-row'])}>
          <div>{t('Share of Pool')}</div> <div>{t('Share of Pool')}</div>
        </div>
        <div className={clsx('flex-row-center flex-row-between', styles['share-row'])}>
          <div>{t('Liquidity')}</div> <div>{t('Liquidity')}</div>
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
