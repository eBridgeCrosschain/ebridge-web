import { Row } from 'antd';
import clsx from 'clsx';
import IconFont from 'components/IconFont';
import MainContentHeader from 'components/MainContentHeader';
import { useLanguage } from 'i18n';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-use';
import { getChainIdByAPI, getChainName, getChainType, getIconByChainId } from 'utils/chain';
import styles from './styles.module.less';
import { getTokenInfoByWhitelist } from 'utils/whitelist';
import { ChainId } from 'types';
import { useWeb3Wallet } from 'hooks/web3';
import { useConnect } from 'hooks/useConnect';
import CommonButton from 'components/CommonButton';
import { Trans } from 'react-i18next';
import { useBalances } from 'hooks/useBalances';
import { isELFChain } from 'utils/aelfUtils';
import { divDecimals } from 'utils/calculate';
export default function Pool() {
  const { t } = useLanguage();

  const { push } = useRouter();
  const { pathname } = useLocation();

  const [apiChainId, symbol] = useMemo(() => pathname?.replace('/pool/', '').split('/') || [], [pathname]);
  const chainId = useMemo(() => getChainIdByAPI(apiChainId), [apiChainId]);

  const tokenInfo = useMemo(() => getTokenInfoByWhitelist(chainId as ChainId, symbol), [chainId, symbol]);

  const web3Wallet = useWeb3Wallet(chainId);
  const connect = useConnect();
  const [[balance]] = useBalances(
    { ...web3Wallet, chainId },
    useMemo(() => {
      if (isELFChain(chainId) || tokenInfo?.isNativeToken) return [tokenInfo?.symbol];
      return [tokenInfo?.address];
    }, [chainId, tokenInfo?.address, tokenInfo?.isNativeToken, tokenInfo?.symbol]),
  );

  const showBalance = useMemo(() => divDecimals(balance, tokenInfo?.decimals), [balance, tokenInfo?.decimals]);

  console.log(showBalance.toFixed(), '===balances');

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
  return (
    <div className={clsx('page-content', 'main-page-content-wrap')}>
      <div className={clsx('main-page-component-wrap')}>
        <MainContentHeader wrap={false} title={t('Pool')} rightEle={chainIcon} />
        <div>
          <CommonButton
            onClick={async () => {
              // TODO: connect
              const req = await connect(getChainType(chainId), chainId);
            }}
            type="primary">
            <Trans>Enter Amount</Trans>
          </CommonButton>
        </div>
      </div>
    </div>
  );
}
