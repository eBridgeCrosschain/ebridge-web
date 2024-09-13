import clsx from 'clsx';
import { useLanguage } from 'i18n';
import { Button } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonImage from 'components/CommonImage';
import { checkFilledIcon, errorFilledIcon } from 'assets/images';
import styles from './styles.module.less';

export enum ResultType {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IResultModalProps {
  open: boolean;
  type: ResultType;
  onClose: () => void;
  onRetry?: () => void;
}

export default function ResultModal({ open, type, onClose, onRetry }: IResultModalProps) {
  const { t } = useLanguage();

  const handleRetry = () => {
    onClose();
    onRetry?.();
  };

  const resultModalConfig = {
    [ResultType.APPROVED]: {
      title: 'Transaction approved',
      icon: checkFilledIcon,
      description: 'The transaction has been approved. You can check it’s status in the “Transactions” page.',
      buttonProps: {
        children: t('Close'),
        onClick: onClose,
      },
    },
    [ResultType.REJECTED]: {
      title: 'Transaction rejected',
      icon: errorFilledIcon,
      description: 'The transaction was not signed. It was rejected.',
      buttonProps: {
        children: t('Retry'),
        onClick: handleRetry,
      },
    },
  };

  const config = resultModalConfig[type];

  return (
    <CommonModal className={styles['result-modal']} width={377} title={t(config.title)} open={open} onCancel={onClose}>
      <div className={clsx(styles['result-modal-body'], 'flex-column-center')}>
        <div className={clsx(styles['result-description-wrap'], 'flex-column-center')}>
          <CommonImage className={styles['result-icon']} src={config.icon} />
          <div className={styles['result-description']}>{t(config.description)}</div>
        </div>
        <Button {...config.buttonProps} className={styles['result-button']} type="primary" />
      </div>
    </CommonModal>
  );
}
