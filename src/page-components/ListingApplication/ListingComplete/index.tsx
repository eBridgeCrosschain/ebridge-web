import clsx from 'clsx';
import CommonButton from 'components/CommonButton';
import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import styles from './styles.module.less';
import CommonImage from 'components/CommonImage';
import { completeIcon } from 'assets/images';
import { BRIDGE_NOW } from 'constants/listingApplication';

const ListingCompleteTitle = 'Listing is complete';
const ListingCompleteContent = 'The Bridge will be available in 10 minutes.';

function ListingComplete() {
  const router = useRouter();

  const handleGoMyApplications = useCallback(() => {
    router.push('/my-applications');
  }, [router]);

  return (
    <div className={clsx('flex-column-center', styles['listing-complete-container'])}>
      <CommonImage className={styles['complete-icon']} src={completeIcon} />
      <div className={styles['title']}>{ListingCompleteTitle}</div>
      <div className={styles['content']}>{ListingCompleteContent}</div>

      <CommonButton className={clsx('flex-1', styles['transfer-button'])} type="ghost" onClick={handleGoMyApplications}>
        {BRIDGE_NOW}
      </CommonButton>
    </div>
  );
}

export default memo(ListingComplete);