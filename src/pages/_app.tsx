import type { AppProps } from 'next/app';
import '../styles/globals.less';
import '../styles/common.less';
import '../styles/antd.less';
import '../utils/sentry';
// import '../utils/vconsole';
import dynamic from 'next/dynamic';
import { DefaultHead } from 'components/PageHead';
import Footer from 'components/Footer';
import ScrollToTop from 'components/ScrollToTop';
import Nav from 'components/Nav';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import clsx from 'clsx';
import { NAV_LIST } from 'constants/link';
import useMediaQueries from 'hooks/useMediaQueries';
import { TelegramPlatform } from 'utils/telegram/telegram';
const Provider = dynamic(import('components/Provider'), { ssr: false });
const Header = dynamic(import('components/Header'), { ssr: false });
export default function APP({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isFull = useMemo(() => router.pathname === '/assets', [router.pathname]);
  const isMainPage = useMemo(() => NAV_LIST.map((item) => item.href).includes(router.pathname), [router.pathname]);
  const isMd = useMediaQueries('md');

  const renderPageBody = () => {
    if (isFull) {
      return <Component {...pageProps} />;
    } else if (isMainPage) {
      return (
        <div className="page-body">
          <div
            className={clsx(
              'page-content',
              'main-page-content-wrap',
              TelegramPlatform.isTelegramPlatform() && 'tg-page-content',
            )}>
            {!isMd && <Nav />}
            <div className="main-page-component-wrap">
              <Component {...pageProps} />
            </div>
          </div>
          <Footer />
        </div>
      );
    } else {
      return (
        <div className="page-body">
          <Component {...pageProps} />
          <Footer />
        </div>
      );
    }
  };

  return (
    <>
      <DefaultHead />
      <ScrollToTop />
      <Provider>
        {!isFull && <Header />}
        <div className={clsx('page-body-wrap', isFull && 'page-full')}>{renderPageBody()}</div>
      </Provider>
    </>
  );
}
