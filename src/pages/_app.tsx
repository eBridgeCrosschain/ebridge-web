import type { AppProps } from 'next/app';
import '../styles/globals.less';
import '../styles/common.less';
import '../styles/antd.less';
import '../utils/sentry';
// import '../utils/vconsole';
import '@portkey/did-ui-react/dist/assets/index.css';
import '@portkey-v1/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';

import Header from 'components/Header';
import dynamic from 'next/dynamic';
import { DefaultHead } from 'components/PageHead';
import { isPortkey } from 'utils/portkey';
import Footer from 'components/Footer';
import ScrollToTop from 'components/ScrollToTop';
import { WebLoginEvents, WebLoginState, useCallContract, useWebLogin, useWebLoginEvent } from 'aelf-web-login';
import WebLoginInstance from 'utils/webLogin';
import { useEffect } from 'react';
import { SupportedELFChainId } from 'constants/chain';
import { SupportedELFChain } from 'constants/index';
const Provider = dynamic(import('components/Provider'), { ssr: false });

export default function APP({ Component, pageProps }: AppProps) {
  const webLoginContext = useWebLogin();
  WebLoginInstance.get().setWebLoginContext(webLoginContext);

  const { callSendMethod: callAELFSendMethod, callViewMethod: callAELFViewMethod } = useCallContract({
    chainId: SupportedELFChainId.AELF,
    rpcUrl: SupportedELFChain[SupportedELFChainId.AELF].CHAIN_INFO.rpcUrl,
  });
  const { callSendMethod: callTDVVSendMethod, callViewMethod: callTDVVViewMethod } = useCallContract({
    chainId: SupportedELFChainId.tDVV,
    rpcUrl: SupportedELFChain[SupportedELFChainId.tDVV].CHAIN_INFO.rpcUrl,
  });
  const { callSendMethod: callTDVWSendMethod, callViewMethod: callTDVWViewMethod } = useCallContract({
    chainId: SupportedELFChainId.tDVW,
    rpcUrl: SupportedELFChain[SupportedELFChainId.tDVW].CHAIN_INFO.rpcUrl,
  });

  useWebLoginEvent(WebLoginEvents.LOGOUT, () => {
    logout();
  });
  useWebLoginEvent(WebLoginEvents.DISCOVER_DISCONNECTED, () => {
    logout();
  });

  useEffect(() => {
    console.log('webLoginContext.loginState', webLoginContext.loginState);
    if (webLoginContext.loginState === WebLoginState.logined) {
      WebLoginInstance.get().setContractMethod([
        {
          chain: SupportedELFChainId.AELF,
          sendMethod: callAELFSendMethod,
          viewMethod: callAELFViewMethod,
        },
        {
          chain: SupportedELFChainId.tDVV,
          sendMethod: callTDVVSendMethod,
          viewMethod: callTDVVViewMethod,
        },
        {
          chain: SupportedELFChainId.tDVW,
          sendMethod: callTDVWSendMethod,
          viewMethod: callTDVWViewMethod,
        },
      ]);
    }
  }, [webLoginContext.loginState]);

  return (
    <>
      <DefaultHead />
      <ScrollToTop />
      <Provider>
        {!isPortkey() && <Header />}
        <div className="page-component">
          <div className="bg-body">
            <Component {...pageProps} />
            <Footer />
          </div>
        </div>
      </Provider>
    </>
  );
}
function logout() {
  throw new Error('Function not implemented.');
}
