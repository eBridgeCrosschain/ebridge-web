import { ROUTE_PATHS } from 'constants/link';
import { useRouter } from 'next/router';
import { memo, useCallback, useMemo } from 'react';
import styles from './styles.module.less';
import { VIEW_PROGRESS } from 'constants/listingApplication';
import { viewProgressIcon } from 'assets/images';
import CommonImage from 'components/CommonImage';
import CommonButton from 'components/CommonButton';

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

  return (
    <div className={styles['init-token-pool']}>
      <div className={styles['component-title']}>Initialize Token Pool</div>
      <div className={styles['init-token-pool-body']}>
        <CommonImage className={styles['view-progress-icon']} src={viewProgressIcon} />
        <div className={styles['init-token-pool-text']}>
          {`The token is successfully created on ${networksString} and the initialization of the token pool is in progress.`}
        </div>

        <div className={styles['init-token-pool-desc']}>
          {`Initializing the token pool is expected to be completed in 1-2 business days.`}
        </div>
        <CommonButton type={'ghost'} className={styles['view-progress-button']} onClick={handleGoMyApplications}>
          {VIEW_PROGRESS}
        </CommonButton>
      </div>
    </div>
  );
}

export default memo(InitializeTokenPool);
