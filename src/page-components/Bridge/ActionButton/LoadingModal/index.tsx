import clsx from 'clsx';
import { useLanguage } from 'i18n';
import CommonModal from 'components/CommonModal';
import CommonImage from 'components/CommonImage';
import { loadingIcon } from 'assets/images';
import styles from './styles.module.less';

interface ILoadingModalProps {
  open?: boolean;
}

export default function LoadingModal({ open }: ILoadingModalProps) {
  const { t } = useLanguage();
  return (
    <CommonModal
      className={styles['loading-modal']}
      width={377}
      title={t('Wait for wallet confirmation...')}
      closable={false}
      open={open || false}>
      <div className={clsx(styles['loading-modal-body'], 'flex-column-center')}>
        {/* TODO: loading icon */}
        <CommonImage className={styles['loading-icon']} src={loadingIcon} />
        <div className={styles['loading-text']}>
          {t('Do not refresh or close the page while waiting for the operation to be completed.')}
        </div>
      </div>
    </CommonModal>
  );
}
