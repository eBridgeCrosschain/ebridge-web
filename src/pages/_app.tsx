import type { AppProps } from 'next/app';
import '../styles/globals.less';
import '../styles/common.less';
import '../styles/antd.less';
import '../utils/sentry';
// import '../utils/vconsole';
// import '@aelf-web-login/wallet-adapter-bridge/dist/lib/ui.css';
// import '@portkey/did-ui-react/dist/assets/index.css';
import Header from 'components/Header';
import dynamic from 'next/dynamic';
import { DefaultHead } from 'components/PageHead';
import { isPortkey } from 'utils/portkey';
import Footer from 'components/Footer';
import ScrollToTop from 'components/ScrollToTop';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import clsx from 'clsx';
const Provider = dynamic(import('components/Provider'), { ssr: false });
export default function APP({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isFull = useMemo(() => router.pathname === '/assets', [router.pathname]);

  return (
    <>
      <DefaultHead />
      <ScrollToTop />
      <Provider>
        {!isPortkey() && !isFull && <Header />}
        <div className={clsx('page-component', isFull && 'page-full')}>
          {isFull ? (
            <Component {...pageProps} />
          ) : (
            <div className="bg-body">
              <Component {...pageProps} />
              <Footer />
            </div>
          )}
        </div>
      </Provider>
    </>
  );
}
