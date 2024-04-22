import styles from './styles.module.less';
import logo from './images/logo.svg';
import testLogo from './images/testLogo.svg';
import clsx from 'clsx';
import { Drawer, Select } from 'antd';
import { LOCAL_LANGUAGE } from 'i18n/config';
import { useLanguage } from 'i18n';
import Link from 'next/link';
import IconFont from 'components/IconFont';
import CommonSelect from 'components/CommonSelect';
import useMediaQueries from 'hooks/useMediaQueries';
import { useCallback, useMemo, useState } from 'react';
import CommonImage from 'components/CommonImage';
import { useRouter } from 'next/router';
import { IS_MAINNET } from 'constants/index';
const navList = [
  {
    title: 'Token Bridge',
    href: '/',
  },
  // {
  //   title: 'NFT跨链',
  //   href: '/nft',
  // },
];

function SelectLanguage({ className }: { className?: string }) {
  const { language, changeLanguage } = useLanguage();
  return (
    <CommonSelect
      className={clsx(styles.select, 'header-select', className)}
      value={language}
      dropdownClassName={styles['select-language-dropdown']}
      onChange={(value) => {
        changeLanguage(value);
      }}>
      {LOCAL_LANGUAGE.map((item) => (
        <Select.Option key={item.language}>{item.title}</Select.Option>
      ))}
    </CommonSelect>
  );
}

function MDHeader({ selectedHref }: { selectedHref: string[] }) {
  const [visible, setVisible] = useState<boolean>();
  const { push } = useRouter();
  const { t } = useLanguage();
  return (
    <>
      <CommonImage
        onClick={() => {
          push('/');
        }}
        style={{ width: IS_MAINNET ? 72 : 89, height: 24 }}
        src={IS_MAINNET ? logo : testLogo}
        alt="logo"
      />
      <IconFont type="more" onClick={() => setVisible(true)} />
      <Drawer
        className={styles.drawer}
        width={'80%'}
        closable={false}
        onClose={() => setVisible(false)}
        visible={visible}>
        <CommonImage src={logo} className={styles['drawer-logo']} />
        {navList.map(({ title, href }, k) => (
          <div
            className={clsx('flex-row-between', 'flex-row-center', 'cursor-pointer', styles['mobile-button'], {
              [styles['mobile-button-selected']]: selectedHref.includes(href),
            })}
            onClick={() => {
              push(href);
              setVisible(false);
            }}
            key={k}>
            {t(title)}
            <IconFont type="ahead" className={styles.ahead} />
          </div>
        ))}
        <SelectLanguage className={styles['mobile-select']} />
      </Drawer>
    </>
  );
}

export default function Header() {
  const isMd = useMediaQueries('md');
  const { asPath, push } = useRouter();
  const selectedHref = useMemo(() => {
    if (asPath.includes('nft')) return ['/nft'];
    return ['/'];
  }, [asPath]);
  const { t } = useLanguage();
  const goHome = useCallback(() => {
    push('/');
  }, [push]);
  return (
    <div className={clsx(styles['header-row'])}>
      <div
        className={clsx(
          'flex-row-center',
          {
            [styles['md-header']]: isMd,
          },
          styles.header,
        )}>
        {!isMd ? (
          <>
            <CommonImage
              style={{ width: IS_MAINNET ? 96 : 119, height: 32, cursor: 'pointer' }}
              src={IS_MAINNET ? logo : testLogo}
              alt="logo"
              onClick={goHome}
            />
            <div className={clsx(styles['header-body'], 'row-center')}>
              {navList.map(({ title, href }, k) => {
                return (
                  <div key={k} className={clsx(styles.link, { [styles['link-active']]: selectedHref.includes(href) })}>
                    <Link href={href}>{t(title)}</Link>
                  </div>
                );
              })}
            </div>
            <SelectLanguage />
          </>
        ) : (
          <MDHeader selectedHref={selectedHref} />
        )}
      </div>
    </div>
  );
}
