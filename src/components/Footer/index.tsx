import { memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import CommonImage from 'components/CommonImage';
import { ebridgeLog } from 'assets/images';
import clsx from 'clsx';
import styles from './styles.module.less';
import { useRouter } from 'next/router';
import { getFullYear } from 'utils/time';
import { WEBSITE_NAME } from 'constants/misc';
import { FOOTER_COMMUNITY_CONFIG, FOOTER_MENU_CONFIG } from 'constants/footer';

function Footer() {
  const router = useRouter();

  const isHomePage = useMemo(() => router.route === '/', [router]);
  const goHome = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <div className={clsx(styles['page-footer'], isHomePage && styles['home-page-footer'])}>
      <div className={clsx(styles['page-footer-section'], styles['page-footer-top-section'])}>
        <div className={styles['page-footer-left']}>
          <div className={styles['ebridge-logo-box']} onClick={goHome}>
            <CommonImage priority src={ebridgeLog} className={styles['ebridge-logo']} />
            <span className={styles['ebridge-logo-text']}>{WEBSITE_NAME}</span>
          </div>
          <div className={styles['footer-desc']}>{`Decentralized cross-chain bridge from aelf's ecosystem`}</div>
        </div>
        <div className={styles['page-footer-menu']}>
          {FOOTER_MENU_CONFIG.map((item) => {
            return (
              <div key={item.title}>
                <div className={styles['page-footer-menu-title']}>{item.title}</div>
                <div className={styles['page-footer-menu-link']}>
                  {item.links.map((link) => {
                    return (
                      <Link key={link.name} href={link.link}>
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={clsx(styles['page-footer-section'], styles['page-footer-bottom-section'])}>
        <div className={styles['page-footer-community-group']}>
          {FOOTER_COMMUNITY_CONFIG.map((item) => {
            return (
              <Link key={item.name} href={item.link}>
                <a target="_blank">
                  <CommonImage priority src={item.icon} className={styles['page-footer-community']} />
                </a>
              </Link>
            );
          })}
        </div>
        <div className={styles['page-footer-time']}>
          {WEBSITE_NAME}@{getFullYear()}
        </div>
      </div>
    </div>
  );
}

export default memo(Footer);
