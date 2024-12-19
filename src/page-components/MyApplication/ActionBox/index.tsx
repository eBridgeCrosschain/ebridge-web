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
  chainId,
  chainName,
  id,
  status,
  rejectedTime,
}: {
  symbol: string;
  tokenIcon?: string;
  chainId: string;
  chainName: string;
  id: string;
  status: ApplicationChainStatusEnum;
  rejectedTime?: number;
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
    return status === ApplicationChainStatusEnum.Failed || status === ApplicationChainStatusEnum.Rejected;
  }, [status]);

  const isNeedInitTokenPool = useMemo(() => {
    return status === ApplicationChainStatusEnum.PoolInitializing || status === ApplicationChainStatusEnum.Reviewed;
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
      const res = await addApplicationChain({
        symbol,
        otherChainIds: [chainId],
      });
      const chainList = res.chainList || [];
      const otherChainList = res.otherChainList || [];
      const concatChainList = chainList.concat(otherChainList);
      const target = concatChainList.find((item) => item.chainId === chainId);
      if (target?.id) {
        setIsReapplyDisable(true);
      }
    } catch (error) {
      console.log('>>>>>> handleReapply error ', error);
    } finally {
      // setLoading(false);
    }
  }, [chainId, symbol]);

  useEffectOnce(() => {
    if (rejectedTime && rejectedTime + TwoDaysTimestamp >= Date.now()) {
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

  if (isNeedInitTokenPool) {
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
