import clsx from 'clsx';
import { CONTACT_US_FORM_URL, ROUTE_PATHS } from 'constants/link';
import { useRouter } from 'next/router';
import { memo, useCallback, useMemo } from 'react';
import styles from './styles.module.less';
import { openWithBlank } from 'utils/link';
import { MY_APPLICATIONS, VIEW_PROGRESS } from 'constants/listingApplication';
import { viewProgressIcon } from 'assets/images';
import CommonImage from 'components/CommonImage';
import Remind from 'components/Remind';

function InitializeTokenPool({ networks }: { networks: { name: string }[] }) {
  const router = useRouter();

  const networksString = useMemo(() => {
    let str = '';
    if (networks.length === 1) {
      str = networks[0].name + ' network';
    } else if (networks.length === 2) {
      str = networks[0].name + ' and ' + networks[1].name + ' networks';
    } else {
      networks?.forEach((item, index) => {
        if (index === networks.length - 1) {
          str += 'and ' + item.name + ' networks';
        } else if (index === networks.length - 2) {
          str += item.name + ' ';
        } else {
          str += item.name + ', ';
        }
      });
    }

    return str;
  }, [networks]);

  const handleGoMyApplications = useCallback(() => {
    router.push(ROUTE_PATHS.MY_APPLICATIONS);
  }, [router]);

  const renderRemind = useMemo(() => {
    return (
      <Remind className={styles['remind']} iconClassName={styles['remind-icon']} isBorder={false}>
        <div>
          <div
            className={
              styles['tip-row']
            }>{`• Initializing the token pool is expected to be completed in 1-2 business days.`}</div>
          <div
            className={
              styles['tip-row']
            }>{`• Once the initialization is complete, please add liquidity to finalize the listing.`}</div>
          <div className={styles['tip-row']}>
            {`• You can check the progress in 'Listing → `}
            <span className={styles['action']} onClick={handleGoMyApplications}>
              {MY_APPLICATIONS}
            </span>
            {`'.`}
          </div>
          <div className={styles['tip-row']}>
            {`• If you need any support, please `}
            <span className={styles['action']} onClick={() => openWithBlank(CONTACT_US_FORM_URL)}>
              {`contact us`}
            </span>
            {` .`}
          </div>
        </div>
      </Remind>
    );
  }, [handleGoMyApplications]);

  return (
    <div className={styles['init-token-pool']}>
      {renderRemind}
      <div className={styles['init-token-pool-body']}>
        <CommonImage className={styles['view-progress-icon']} src={viewProgressIcon} />
        <div className={styles['init-token-pool-text']}>
          {`The token is successfully created on ${networksString} and the initialization of the token pool is in progress. Please resubmit for networks where creation has failed.`}
        </div>

        <div className={clsx(styles['action'], styles['action-bold'])} onClick={handleGoMyApplications}>
          {VIEW_PROGRESS}
        </div>
      </div>
    </div>
  );
}

export default memo(InitializeTokenPool);
