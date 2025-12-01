import styles from './styles.module.less';
import { useMemo } from 'react';
import { TMyApplicationStatus } from 'types/listingApplication';
import clsx from 'clsx';
import { ApplicationChainStatusEnum } from 'types/api';
import CommonImage from 'components/CommonImage';
import { questionFilledIcon } from 'assets/images';
import ListingTip from 'page-components/ListingApplication/ListingTip';

type TStatusBoxProps = {
  wrapperClassName?: string;
  className?: string;
  status: ApplicationChainStatusEnum;
  failReason?: string;
};

export default function StatusBox({ wrapperClassName, className, status, failReason }: TStatusBoxProps) {
  const isSucceed = useMemo(() => {
    return status === ApplicationChainStatusEnum.Complete;
  }, [status]);

  const isFailed = useMemo(() => {
    return status === ApplicationChainStatusEnum.Failed;
  }, [status]);

  const content = useMemo(() => {
    if (isSucceed) {
      return (
        <div className={clsx(styles['status-box'], className)}>
          <div className={clsx(styles['badge'], styles['badge-success'])} />
          {TMyApplicationStatus.Succeed}
        </div>
      );
    }

    if (isFailed) {
      return (
        <div className={clsx(styles['status-box'], className)}>
          <div className={clsx(styles['badge'], styles['badge-failed'])} />
          <span className={styles.failed}>{TMyApplicationStatus.Failed}</span>
          <ListingTip
            title={TMyApplicationStatus.Failed}
            tip={failReason}
            customChildren={<CommonImage priority className={styles['question-icon']} src={questionFilledIcon} />}
          />
        </div>
      );
    }

    return (
      <div className={clsx(styles['status-box'], className)}>
        <div className={clsx(styles['badge'], styles['badge-warning'])} />
        <span className={styles.processing}>{TMyApplicationStatus.Processing}</span>
      </div>
    );
  }, [isSucceed, isFailed, className, failReason]);

  return <div className={clsx(styles['status-wrapper'], wrapperClassName)}>{content}</div>;
}
