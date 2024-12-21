import styles from './styles.module.less';
import { useCallback, useMemo, useState } from 'react';
import { Tooltip } from 'antd';
import { TMyApplicationStatus } from 'types/listingApplication';
import clsx from 'clsx';
import CommonModal from 'components/CommonModal';
import { GOT_IT } from 'constants/misc';
import { ApplicationChainStatusEnum } from 'types/api';
import useMediaQueries from 'hooks/useMediaQueries';
import CommonImage from 'components/CommonImage';
import { questionFilledIcon } from 'assets/images';

type TStatusBoxProps = {
  wrapperClassName?: string;
  className?: string;
  status: ApplicationChainStatusEnum;
  failReason?: string;
};

export default function StatusBox({ wrapperClassName, className, status, failReason }: TStatusBoxProps) {
  const isMd = useMediaQueries('md');
  const [isMobileOpenModal, setIsMobileOpenModal] = useState(false);

  const isSucceed = useMemo(() => {
    return status === ApplicationChainStatusEnum.Complete;
  }, [status]);

  const isFailed = useMemo(() => {
    return status === ApplicationChainStatusEnum.Failed;
  }, [status]);

  const showFailedReason = useCallback(() => {
    if (isMd) {
      setIsMobileOpenModal(true);
    }
  }, [isMd]);

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
        <div className={clsx(styles['status-box'], className)} onClick={showFailedReason}>
          <div className={clsx(styles['badge'], styles['badge-filed'])} />
          <span className={styles.failed}>{TMyApplicationStatus.Failed}</span>
          <Tooltip title={!isMd && failReason} placement="top">
            <CommonImage priority className={styles['question-icon']} src={questionFilledIcon} />
          </Tooltip>
        </div>
      );
    }

    return (
      <div className={clsx(styles['status-box'], className)}>
        <div className={clsx(styles['badge'], styles['badge-warning'])} />
        <span className={styles.processing}>{TMyApplicationStatus.Processing}</span>
      </div>
    );
  }, [isSucceed, isFailed, className, showFailedReason, isMd, failReason]);

  return (
    <div className={clsx(styles['status-wrapper'], wrapperClassName)}>
      {content}
      {/* TODO */}
      <CommonModal
        width={'300px'}
        // hideCancelButton={true}
        okText={GOT_IT}
        onOk={() => setIsMobileOpenModal(false)}
        title={TMyApplicationStatus.Failed}
        open={isMobileOpenModal}
        onCancel={() => setIsMobileOpenModal(false)}>
        <div>{failReason}</div>
      </CommonModal>
    </div>
  );
}
