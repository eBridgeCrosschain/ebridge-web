import { notification, Drawer } from 'antd';
import CommonImage from 'components/CommonImage';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from 'i18n';
import styles from './styles.module.less';
import warnIcon from './images/warning_6.svg';
import closeIcon from './images/close.svg';

const URL = 'https://t.me/eBridge_official';

function useBoliplate() {
  const { t } = useLanguage();
  return useMemo(
    () => ({
      title: (
        <div className={styles['title-wrap']}>
          <CommonImage priority src={warnIcon} className={styles['warn-icon']} />
          <span>{t('Notification Title')}</span>
        </div>
      ),
      content: (
        <div>
          <section>{t('Notification Content Section 1')}</section>
          <section className={styles.section2}>{t('Notification Content Section 2')}</section>
          <a className={styles.link} href={URL}>
            {URL}
          </a>
        </div>
      ),
      closeIcon: <CommonImage priority src={closeIcon} className={styles['close-icon']} />,
    }),
    [t],
  );
}

export function Notification() {
  const { title, content, closeIcon } = useBoliplate();
  useEffect(() => {
    notification.open({
      className: styles['notification-wrap'],
      message: title,
      description: content,
      closeIcon: closeIcon,
      duration: null,
      placement: 'bottomRight',
      bottom: 16,
      key: 'eBridge',
    });
  }, [title, content, closeIcon]);

  return null;
}

export function NotificationForPhone() {
  const [visible, setVisible] = useState<boolean>(true);
  const { title, content, closeIcon } = useBoliplate();
  const onClose = () => {
    setVisible(false);
  };
  return (
    <Drawer
      height={264}
      className={styles['notification-phone-wrap']}
      title={title}
      placement="bottom"
      closeIcon={closeIcon}
      open={visible}
      onClose={onClose}>
      {content}
    </Drawer>
  );
}
