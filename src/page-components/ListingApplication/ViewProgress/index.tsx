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
import CommonButton from 'components/CommonButton';
import { getChainIdByAPI, getChainName } from 'utils/chain';

export default function ViewProgress({
  className,
  open = false,
  status,
  tokenSymbol,
  tokenIcon,
  chainId,
  onClose,
  onConfirm,
}: {
  className?: string;
  open?: boolean;
  status: ApplicationChainStatusEnum;
  tokenSymbol: string;
  tokenIcon?: string;
  chainId: string;
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
    if (
      status === ApplicationChainStatusEnum.Issued ||
      status === ApplicationChainStatusEnum.PoolInitializing ||
      status === ApplicationChainStatusEnum.PoolInitialized
    ) {
      return ListingProcessStep.INITIALIZE_TOKEN_POOL;
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
          <div className={styles['token-network']}>{getChainName(getChainIdByAPI(chainId))}</div>
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
  }, [tokenSymbol, tokenIcon, chainId, formatSteps, currentStep]);

  return (
    <CommonModal
      className={clsx(styles['view-progress-modal'], className)}
      width={438}
      open={open}
      type={isMd ? 'pop-bottom' : 'default'}
      title={VIEW_PROGRESS}
      onCancel={onClose}
      footer={
        <CommonButton className={styles['confirm-button']} type="primary" onClick={onConfirm}>
          {GOT_IT}
        </CommonButton>
      }>
      {content}
    </CommonModal>
  );
}
