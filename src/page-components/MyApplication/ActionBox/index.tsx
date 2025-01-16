import { useCallback, useMemo, useState } from 'react';
import { BRIDGE_NOW, VIEW_PROGRESS } from 'constants/listingApplication';
import { useRouter } from 'next/router';
import { ApplicationChainStatusEnum } from 'types/api';
import styles from './styles.module.less';
import ViewProgress from 'page-components/ListingApplication/ViewProgress';
import { ROUTE_PATHS } from 'constants/link';
import { DEFAULT_NULL_VALUE } from 'constants/misc';

export default function ActionBox({
  symbol,
  tokenIcon,
  chainId,
  status,
}: {
  symbol: string;
  tokenIcon?: string;
  chainId: string;
  status: ApplicationChainStatusEnum;
}) {
  const router = useRouter();
  const [openViewProgress, setOpenViewProgress] = useState(false);

  const isSucceed = useMemo(() => {
    return status === ApplicationChainStatusEnum.Complete;
  }, [status]);

  const isFailed = useMemo(() => {
    return status === ApplicationChainStatusEnum.Failed;
  }, [status]);

  const handleViewProgress = useCallback(() => {
    setOpenViewProgress(true);
  }, []);

  const handleCloseViewProgress = useCallback(() => {
    setOpenViewProgress(false);
  }, []);

  const handleConfirmViewProgress = useCallback(() => {
    setOpenViewProgress(false);
  }, []);

  const handleGoBridge = useCallback(() => {
    router.push(ROUTE_PATHS.BRIDGE);
  }, [router]);

  if (isSucceed) {
    return (
      <div className={styles['action']} onClick={handleGoBridge}>
        {BRIDGE_NOW}
      </div>
    );
  }

  if (isFailed) {
    return <div>{DEFAULT_NULL_VALUE}</div>;
  }

  return (
    <>
      <div className={styles['action']} onClick={handleViewProgress}>
        {VIEW_PROGRESS}
      </div>
      <ViewProgress
        open={openViewProgress}
        status={status}
        tokenSymbol={symbol}
        tokenIcon={tokenIcon}
        chainId={chainId}
        onClose={handleCloseViewProgress}
        onConfirm={handleConfirmViewProgress}
      />
    </>
  );
}
