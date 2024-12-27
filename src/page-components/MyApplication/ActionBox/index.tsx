import { useCallback, useMemo, useState } from 'react';
import { LISTING_STEP_PATHNAME_MAP, ListingStep, VIEW_PROGRESS } from 'constants/listingApplication';
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
  id,
  status,
}: {
  symbol: string;
  tokenIcon?: string;
  chainId: string;
  id: string;
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

  const isNeedAddTokenPool = useMemo(() => {
    return status === ApplicationChainStatusEnum.PoolInitialized;
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

  const handleAddTokenPool = useCallback(() => {
    router.push(
      `${ROUTE_PATHS.LISTING_APPLICATION}${
        LISTING_STEP_PATHNAME_MAP[ListingStep.ADD_TOKEN_POOL]
      }?symbol=${symbol}&id=${id}`,
    );
  }, [id, router, symbol]);

  const handleLaunchOnOtherChain = useCallback(() => {
    router.push(
      `${ROUTE_PATHS.LISTING_APPLICATION}${LISTING_STEP_PATHNAME_MAP[ListingStep.SELECT_CHAIN]}?symbol=${symbol}`,
    );
  }, [router, symbol]);

  if (isSucceed) {
    return (
      <div className={styles['action']} onClick={handleLaunchOnOtherChain}>
        Launch on other chain
      </div>
    );
  }

  if (isFailed) {
    return <div>{DEFAULT_NULL_VALUE}</div>;
  }

  if (isNeedAddTokenPool) {
    return (
      <div className={styles['action']} onClick={handleAddTokenPool}>
        Add token pool
      </div>
    );
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
