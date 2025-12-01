import { memo } from 'react';
import { useLanguage } from 'i18n';
import Link from 'next/link';
import CommonImage from 'components/CommonImage';
import { aelfLogo } from 'assets/images';
import styles from './styles.module.less';
import { FOOTER_COMMUNITY_CONFIG, FOOTER_MENU_LIST_CONFIG } from 'constants/link';
import useMediaQueries from 'hooks/useMediaQueries';

function Footer() {
  const { t } = useLanguage();
  const isMd = useMediaQueries('md');

  if (isMd) {
    return null;
  }

  return (
    <div className={styles['page-footer']}>
      <div className={styles['page-footer-left']}>
        <div className={styles['page-footer-powered']}>
          <span>Powered by</span>
          <CommonImage className={styles['aelf-logo']} priority src={aelfLogo} />
        </div>
        <div className={styles['page-footer-community-group']}>
          {FOOTER_COMMUNITY_CONFIG.map((item) => {
            return (
              <Link key={item.label} href={item.link}>
                <a target="_blank">
                  <CommonImage priority src={item.icon} className={styles['page-footer-community']} />
                </a>
              </Link>
            );
          })}
        </div>
      </div>
      <div className={styles['page-footer-right']}>
        {FOOTER_MENU_LIST_CONFIG.map((group, index) => (
          <div key={index} className={styles['page-footer-menu']}>
            <span className={styles['page-footer-menu-title']}>{t(group.title)}</span>
            {group.menu.map((item) => {
              return (
                <Link key={item.label} href={item.link}>
                  {t(item.label)}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(Footer);
