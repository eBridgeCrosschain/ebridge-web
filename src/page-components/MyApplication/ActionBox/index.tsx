import { useCallback, useMemo, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { LISTING_STEP_PATHNAME_MAP, ListingStep, VIEW_PROGRESS } from 'constants/listingApplication';
import { useRouter } from 'next/router';
import { ApplicationChainStatusEnum } from 'types/api';
import { addApplicationChain } from 'utils/api/application';
import styles from './styles.module.less';
import ViewProgress from 'page-components/ListingApplication/ViewProgress';
import { ROUTE_PATHS } from 'constants/link';

const TwoDaysTimestamp = 48 * 60 * 60 * 1000;

export default function ActionBox({
  symbol,
  tokenIcon,
  otherChainId,
  aelfChainIds = [],
  chainName,
  id,
  status,
  filedTime,
  resetList,
}: {
  symbol: string;
  tokenIcon?: string;
  otherChainId: string;
  aelfChainIds?: string[];
  chainName: string;
  id: string;
  status: ApplicationChainStatusEnum;
  filedTime?: number;
  resetList?: () => Promise<void>;
}) {
  const router = useRouter();
  // TODO
  // const { setLoading } = useLoading();
  const [isReapplyDisable, setIsReapplyDisable] = useState(false);
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

  const handleReapply = useCallback(async () => {
    try {
      // setLoading(true);
      await addApplicationChain({
        symbol,
        chainIds: aelfChainIds,
        otherChainIds: [otherChainId],
      });
      await resetList?.();
    } catch (error) {
      console.log('>>>>>> handleReapply error ', error);
    } finally {
      // setLoading(false);
    }
  }, [aelfChainIds, otherChainId, resetList, symbol]);

  useEffectOnce(() => {
    if (filedTime && filedTime + TwoDaysTimestamp >= Date.now()) {
      setIsReapplyDisable(true);
    } else {
      setIsReapplyDisable(false);
    }
  });

  if (isSucceed) {
    return (
      <div className={styles['action']} onClick={handleLaunchOnOtherChain}>
        Launch on other chain
      </div>
    );
  }

  if (isFailed) {
    return (
      <div
        className={isReapplyDisable ? styles['action-disable'] : styles['action']}
        onClick={isReapplyDisable ? undefined : handleReapply}>
        Reapply
      </div>
    );
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
        chainName={chainName}
        onClose={handleCloseViewProgress}
        onConfirm={handleConfirmViewProgress}
      />
    </>
  );
}
