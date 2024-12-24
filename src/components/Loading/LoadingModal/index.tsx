import clsx from 'clsx';
import { useLanguage } from 'i18n';
import CommonModal from 'components/CommonModal';
import CommonImage from 'components/CommonImage';
import { loadingIcon } from 'assets/images';
import styles from './styles.module.less';

export interface ILoadingModalProps {
  open?: boolean;
  title?: string;
  description?: string;
  hideTitle?: boolean;
  hideDescription?: boolean;
}

export default function LoadingModal({ open, title, description, hideTitle, hideDescription }: ILoadingModalProps) {
  const { t } = useLanguage();
  return (
    <CommonModal
      className={clsx(styles['loading-modal'], { [styles['loading-modal-hide-title']]: hideTitle })}
      width={377}
      title={title || t('Wait for wallet confirmation...')}
      closable={false}
      open={open || false}>
      <div className={clsx(styles['loading-modal-body'], 'flex-column-center')}>
        <CommonImage className={styles['loading-icon']} src={loadingIcon} />
        {!hideDescription && (
          <div className={styles['loading-text']}>
            {description ||
              t(
                "The Transaction fee also needs to be approved. Don't refresh or close the page until the operation is complete.",
              )}
          </div>
        )}
      </div>
    </CommonModal>
  );
}
