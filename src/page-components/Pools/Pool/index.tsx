import { Row, Tabs } from 'antd';
import clsx from 'clsx';
import IconFont from 'components/IconFont';
import MainContentHeader from 'components/MainContentHeader';
import { useLanguage } from 'i18n';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-use';
import { getChainIdByAPI, getChainName, getIconByChainId } from 'utils/chain';
import styles from './styles.module.less';
import { getTokenInfoByWhitelist } from 'utils/whitelist';
import { ChainId, OperatePool } from 'types';
import AddPool from './AddPool';
import RemovePool from './RemovePool';
export default function Pool() {
  const { t } = useLanguage();

  const [activeKey, setActiveKey] = useState(OperatePool.add);

  const { push } = useRouter();
  const { pathname } = useLocation();

  const [apiChainId, symbol] = useMemo(() => pathname?.replace('/pool/', '').split('/') || [], [pathname]);
  const chainId = useMemo(() => getChainIdByAPI(apiChainId), [apiChainId]);

  const tokenInfo = useMemo(() => getTokenInfoByWhitelist(chainId as ChainId, symbol), [chainId, symbol]);

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
      <div className={clsx('main-page-component-wrap', styles['pool-page'])}>
        <MainContentHeader wrap={false} title={t('Pool')} rightEle={chainIcon} />
        <Tabs
          tabBarGutter={16}
          defaultActiveKey={OperatePool.add}
          activeKey={activeKey}
          onChange={(v) => setActiveKey(v as OperatePool)}>
          <Tabs.TabPane tab={t('Add')} key={OperatePool.add} />
          <Tabs.TabPane tab={t('Remove')} key={OperatePool.remove} />
        </Tabs>
        {activeKey === OperatePool.add ? (
          <AddPool chainId={chainId} tokenInfo={tokenInfo} />
        ) : (
          <RemovePool chainId={chainId} tokenInfo={tokenInfo} />
        )}
      </div>
    </div>
  );
}
