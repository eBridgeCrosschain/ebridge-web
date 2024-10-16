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
      width={380}
      title={t('Wait for wallet confirmation...')}
      closable={false}
      open={open || false}>
      <div className={clsx(styles['loading-modal-body'], 'flex-column-center')}>
        <CommonImage className={styles['loading-icon']} src={loadingIcon} />
        <div className={styles['loading-text']}>
          {t(
            "The Transaction fee also needs to be approved. Don't refresh or close the page until the operation is complete.",
          )}
        </div>
      </div>
    </CommonModal>
  );
}
