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
import { divDecimals } from 'utils/calculate';
import CommonAmountRow from 'components/CommonAmountRow';
import { parseInputChange } from 'utils/input';
import { percentConverter, unitConverter } from 'utils/converter';
import { formatSymbol } from 'utils/token';
import TokenLogo from 'components/TokenLogo';
import { usePoolContract, useTokenContract } from 'hooks/useContract';
import { removeLiquidity } from 'utils/pools';
import { useThrottleCallback } from 'hooks';
import { ZERO } from 'constants/misc';
import useLoadingModal from 'hooks/useLoadingModal';
import { ResultType } from 'components/Loading/ResultModal';
import { usePoolMyLiquidity, usePoolTotalLiquidity } from 'hooks/pools';

export type TRemovePoolProps = {
  chainId: ChainId;
  tokenInfo?: TokenInfo;
};

export default function RemovePool({ chainId, tokenInfo }: TRemovePoolProps) {
  const { t } = useLanguage();

  const [amount, setAmount] = useState<string>();

  const web3Wallet = useWeb3Wallet(chainId);
  const evmSwitchChain = useEVMSwitchChain();

  const poolContract = usePoolContract(chainId);
  const tokenContract = useTokenContract(chainId, tokenInfo?.address);
  const totalLiquidity = usePoolTotalLiquidity({ poolContract, tokenContract, tokenInfo });
  const myLiquidity = usePoolMyLiquidity({ poolContract, account: web3Wallet?.account, tokenInfo });

  const { loadingOpen, modal, setLoadingModal, setResultModal } = useLoadingModal();
  const { account, library } = web3Wallet || {};
  const connect = useConnect();

  const min = useMemo(() => divDecimals(1, tokenInfo?.decimals), [tokenInfo?.decimals]);
  const max = useMemo(() => ZERO.plus(myLiquidity.showMyLiquidity), [myLiquidity.showMyLiquidity]);

  const showError = useMemo(() => amount && account && max.lt(amount), [account, amount, max]);

  const onRemoveLiquidity = useThrottleCallback(async () => {
    try {
      if (!tokenInfo || !account || !poolContract || !amount) return;
      setLoadingModal({ open: true });
      if (poolContract.contractType === 'ERC') await evmSwitchChain(chainId);
      const req = await removeLiquidity({
        symbol: tokenInfo?.symbol,
        amount: amount,
        account: account,
        poolContract,
        chainId,
      });
      if (req?.error) {
        setResultModal({ open: true, type: ResultType.REJECTED });
      } else {
        setAmount('');
        setResultModal({ open: true, type: ResultType.APPROVED });
      }
    } catch (error) {
      setResultModal({ open: true, type: ResultType.REJECTED });
    } finally {
      totalLiquidity.onGetTotalLiquidity();
      myLiquidity.onGetMyLiquidity();
      setLoadingModal({ open: false });
    }
  }, [
    account,
    amount,
    chainId,
    evmSwitchChain,
    myLiquidity,
    poolContract,
    setLoadingModal,
    setResultModal,
    tokenInfo,
    totalLiquidity,
  ]);
  const btnProps = useMemo(() => {
    let children = 'Enter Amount';
    let disabled = true;
    let onClick = onRemoveLiquidity;

    if (!account) {
      onClick = () => connect(getChainType(chainId), chainId);
      children = 'Connect';
      disabled = false;
      return { children, disabled, onClick };
    }

    if (max.lt(amount ?? '0')) {
      disabled = true;
      onClick = () => connect(getChainType(chainId), chainId);
      children = 'Insufficient amount';
      return { children, disabled, onClick };
    }

    if (amount && ZERO.lte(amount)) {
      children = 'Remove';
      disabled = false;
    }

    return { children, disabled, onClick };
  }, [account, amount, chainId, connect, max, onRemoveLiquidity]);
  return (
    <div className={styles['operate-pool']}>
      <CommonAmountRow
        showBalance={!!web3Wallet.account}
        showError={!!showError}
        value={amount}
        onClickMAX={() => setAmount(parseInputChange(max.toFixed(), min, tokenInfo?.decimals))}
        onAmountInputChange={(e) => setAmount(parseInputChange(e.target.value, min, tokenInfo?.decimals))}
        leftHeaderTitle={t('Amount')}
        rightHeaderTitle={`${unitConverter(myLiquidity.showMyLiquidity)} ${formatSymbol(tokenInfo?.symbol)}`}
        rightInputEle={
          <Row className={clsx('flex-row-center', styles['token-logo-row'], 'font-family-medium')}>
            <TokenLogo className={styles['token-logo']} chainId={chainId} symbol={tokenInfo?.symbol} />
            <div>{formatSymbol(tokenInfo?.symbol)}</div>
          </Row>
        }
      />
      <Col className={styles['share-col']}>
        <div className={clsx('flex-row-center flex-row-between', styles['share-row'])}>
          <div>{t('Share of Pool')}</div>{' '}
          <div>{percentConverter(ZERO.plus(amount ?? 0).div(totalLiquidity.showTotalLiquidity))}%</div>
        </div>
        <div className={clsx('flex-row-center flex-row-between', styles['share-row'])}>
          {/* // TODO:$ Converter */}
          <div>{t('Liquidity')}</div> <div>${unitConverter(totalLiquidity.showTotalLiquidity)}</div>
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
