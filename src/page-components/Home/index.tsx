'use client';

import { FromCard, ToCard } from './Card';
import HomeProvider from './HomeContext';
import SelectTokenModal from './SelectTokenModal';
import AddTokenModal from './AddTokenModal';
import Notice from './Notice';
import ActionButton from './ActionButton';
import ChangeIcon from './ChangeIcon';
import styles from './styles.module.less';
import History from './History';
import useMediaQueries from 'hooks/useMediaQueries';
import { useLanguage } from 'i18n';
import PageHead from 'components/PageHead';
import { Notification, NotificationForPhone } from 'components/Notification';
import useMaskQuery from 'hooks/useMaskQuery';
import Mask from './Mask';
import { Skeleton } from 'antd';
import { isPortkey } from 'utils/portkey';

import LimitAmountDescModal from './LimitAmountDescModal';

export default function Home() {
  const isMd = useMediaQueries('md');
  const { t } = useLanguage();
  const { isShowMask, isLoading } = useMaskQuery();

  // const isShowMask = false,
  //   isLoading = false;

  if (isLoading) {
    return <Skeleton paragraph={{ rows: 10 }} />;
  }

  return (
    <HomeProvider>
      <PageHead title={t('Token Bridge')} />
      {!isShowMask ? (
        <>
          <div className={styles.body}>
            {isMd && !isPortkey() && <h2 className={styles.title}>{t('Token Bridge')}</h2>}
            <FromCard />
            <ChangeIcon />
            <ToCard />
            <Notice />
            {!isMd && <ActionButton />}
            <History />
          </div>
          {isMd && <ActionButton />}
          <SelectTokenModal />
          <AddTokenModal />
          {isMd ? <NotificationForPhone /> : <Notification />}
          <LimitAmountDescModal />
        </>
      ) : (
        <Mask />
      )}
    </HomeProvider>
  );
}
