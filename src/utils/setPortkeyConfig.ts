import { setGlobalConfig } from 'aelf-web-login';

import {
  PORTKEY_SERVICE,
  APP_NAME,
  PORTKEY_NETWORK_TYPE,
  PORTKEY_NETWORK_TYPE_V2,
  SupportedELFChain,
  WEBSITE_ICON,
  AELF_NODES,
} from '../constants';
import { SupportedELFChainId } from 'constants/chain';

export function setPortkeyConfig(chainId?: string) {
  if (!chainId) {
    chainId = SupportedELFChainId.AELF;
  }

  setGlobalConfig({
    appName: APP_NAME,
    chainId: chainId,
    networkType: PORTKEY_NETWORK_TYPE as any,
    defaultRpcUrl: SupportedELFChain[chainId].CHAIN_INFO.rpcUrl,

    portkey: {
      useLocalStorage: true,
      graphQLUrl: PORTKEY_SERVICE.v1.graphQLUrl,
      connectUrl: PORTKEY_SERVICE.v1.connectServer,
      serviceUrl: PORTKEY_SERVICE.v1.apiServer,
      socialLogin: {
        Portkey: {
          websiteName: APP_NAME,
          websiteIcon: WEBSITE_ICON,
        },
      },

      requestDefaults: {
        baseURL: PORTKEY_SERVICE.v1.apiServer,
        timeout: 8000,
      },
      network: {
        defaultNetwork: PORTKEY_NETWORK_TYPE,
      },
    } as any,
    portkeyV2: {
      networkType: PORTKEY_NETWORK_TYPE_V2,
      useLocalStorage: true,
      graphQLUrl: PORTKEY_SERVICE.v2.graphQLUrl,
      connectUrl: PORTKEY_SERVICE.v2.connectServer,
      serviceUrl: PORTKEY_SERVICE.v2.apiServer,
      loginConfig: {
        recommendIndexes: [0, 1],
        loginMethodsOrder: ['Email', 'Google', 'Apple', 'Telegram'],
      },
      socialLogin: {
        Portkey: {
          websiteName: APP_NAME,
          websiteIcon: WEBSITE_ICON,
        },
      },
      requestDefaults: {
        baseURL: PORTKEY_SERVICE.v2.apiServer,
        timeout: 8000,
      },
      network: {
        defaultNetwork: PORTKEY_NETWORK_TYPE_V2,
      },
    } as any,
    aelfReact: {
      appName: APP_NAME,
      nodes: AELF_NODES,
    },
  });
}
