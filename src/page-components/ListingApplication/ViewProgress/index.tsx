import clsx from 'clsx';
import styles from './styles.module.less';
import CommonModal from 'components/CommonModal';
import { useMemo } from 'react';
import { formatSymbol } from 'utils/token';
import { GOT_IT } from 'constants/misc';
import { ApplicationChainStatusEnum } from 'types/api';
import useMediaQueries from 'hooks/useMediaQueries';
import { ListingProcessStep, VIEW_PROGRESS, VIEW_PROGRESS_STEPS } from 'constants/listingApplication';
import DisplayImage from 'components/DisplayImage';
import CommonSteps, { ICommonStepsProps } from 'components/CommonSteps';

export default function ViewProgress({
  className,
  open = false,
  status,
  tokenSymbol,
  tokenIcon,
  chainName,
  onClose,
  onConfirm,
}: {
  className?: string;
  open?: boolean;
  status: ApplicationChainStatusEnum;
  tokenSymbol: string;
  tokenIcon?: string;
  chainName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isMd = useMediaQueries('md');

  const currentStep = useMemo(() => {
    if (status === ApplicationChainStatusEnum.Unissued) {
      return ListingProcessStep.BASIC_INFO;
    }
    if (status === ApplicationChainStatusEnum.Issuing) {
      return ListingProcessStep.SELECT_CHAIN;
    }
    if (status === ApplicationChainStatusEnum.Issued || status === ApplicationChainStatusEnum.PoolInitializing) {
      return ListingProcessStep.INITIALIZE_TOKEN_POOL;
    }
    if (
      status === ApplicationChainStatusEnum.PoolInitialized ||
      status === ApplicationChainStatusEnum.LiquidityAdding
    ) {
      return ListingProcessStep.ADD_TOKEN_POOL;
    }

    // ApplicationChainStatusEnum.Failed;
    return ListingProcessStep.COMPLETE;
  }, [status]);

  const formatSteps = useMemo(() => {
    const _stepItem: ICommonStepsProps['stepItems'] = JSON.parse(JSON.stringify(VIEW_PROGRESS_STEPS));
    _stepItem.forEach((item, index) => {
      if (index === currentStep) {
        item.isLoading = true;
      }
    });
    return _stepItem;
  }, [currentStep]);

  const content = useMemo(() => {
    return (
      <div>
        <div className={clsx('flex-row-center-between', styles['token-info'])}>
          <div className="flex-row-center gap-8">
            <DisplayImage width={20} height={20} name={tokenSymbol} src={tokenIcon} />
            <span className={clsx(styles['token-symbol'])}>{formatSymbol(tokenSymbol)}</span>
          </div>
          <div className={styles['token-network']}>{chainName}</div>
        </div>
        <div className={styles['view-progress-steps-wrapper']}>
          <CommonSteps
            className={styles['view-progress-steps']}
            stepItems={formatSteps}
            current={currentStep}
            direction={'vertical'}
          />
        </div>
      </div>
    );
  }, [chainName, currentStep, formatSteps, tokenIcon, tokenSymbol]);

  if (isMd) {
    return <div>{/* TODO */}</div>;
    // <CommonDrawer
    //   className={clsx(styles['view-progress-drawer'], styles['view-progress-drawer-weight'], className)}
    //   height="auto"
    //   title={ViewProgressTitle}
    //   open={open}
    //   onClose={onClose}>
    //   {content}
    //   <CommonButton className={styles['confirm-button']} onClick={onConfirm}>
    //     {GOT_IT}
    //   </CommonButton>
    // </CommonDrawer>
  }

  return (
    <CommonModal
      className={clsx(styles['view-progress-modal'], className)}
      title={VIEW_PROGRESS}
      open={open}
      // hideCancelButton // TODO
      okText={GOT_IT}
      onCancel={onClose}
      onOk={onConfirm}>
      {content}
    </CommonModal>
  );
}
