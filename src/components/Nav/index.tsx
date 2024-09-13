import { memo } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useLanguage } from 'i18n';
import CommonImage from 'components/CommonImage';
import { NAV_LIST } from 'constants/link';
import styles from './styles.module.less';

function Nav() {
  const { pathname, push } = useRouter();
  const { t } = useLanguage();
  return (
    <div className={clsx(styles['nav-list'], 'flex-column')}>
      {NAV_LIST.map((item, index) => {
        const isSelected = pathname === item.href;
        return (
          <div
            key={index}
            className={clsx(styles['nav-item'], 'flex-row-center', 'cursor-pointer', {
              [styles['nav-item-selected']]: isSelected,
            })}
            onClick={() => {
              push(item.href);
            }}>
            <CommonImage
              priority
              className={styles['nav-item-icon']}
              src={isSelected ? item.selectedIcon : item.icon}
            />
            <span>{t(item.title)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default memo(Nav);
