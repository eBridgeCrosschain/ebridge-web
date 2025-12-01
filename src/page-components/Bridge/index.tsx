'use client';

import { memo } from 'react';
import clsx from 'clsx';
import { useLanguage } from 'i18n';
import PageHead from 'components/PageHead';
import HomeProvider from './HomeContext';
import BridgeHeader from './BridgeHeader';
import Wallet from './Wallet';
import ChangeIcon from './ChangeIcon';
import AmountRow from './AmountRow';
import CheckBoxInputRow from './CheckBoxInputRow';
import Info from './Info';
import ActionButton from './ActionButton';
import LimitAmountDescModal from './LimitAmountDescModal';
import SelectTokenModal from './SelectTokenModal';
import AddTokenModal from './AddTokenModal';
import styles from './styles.module.less';

function Bridge() {
  const { t } = useLanguage();
  return (
    <HomeProvider>
      <PageHead title={t('eBridge: Cross-chain Bridge')} />
      <div className={clsx(styles['bridge-content'], 'flex-column')}>
        <BridgeHeader />
        <div className={clsx(styles['bridge-wallet-part'], 'flex-row', 'align-end')}>
          <Wallet className={styles['bridge-wallet']} isFrom />
          <ChangeIcon className={styles['change-icon']} />
          <Wallet className={styles['bridge-wallet']} />
        </div>
        <div className={clsx(styles['bridge-amount-part'], 'flex-column')}>
          <AmountRow />
          <CheckBoxInputRow />
        </div>
        <Info />
        <ActionButton />
      </div>
      <LimitAmountDescModal />
      <SelectTokenModal />
      <AddTokenModal />
    </HomeProvider>
  );
}

export default memo(Bridge);
