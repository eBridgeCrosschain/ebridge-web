import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { AELF_NODES, PORTKEY_NETWORK_TYPE, SupportedELFChain, WEB_LOGIN_CONFIG } from 'constants/index';
import { APP_NAME } from 'constants/misc';
import { useChain } from 'contexts/useChain';
import { LoginWalletProvider } from 'contexts/useLoginWallet/provider';
import useOrderedConnections from 'hooks/useOrderedConnections';
import { useAEflConnect, usePortkeyConnect } from 'hooks/web3';
import { useCallback, useMemo } from 'react';
import { useEffectOnce } from 'react-use';
import { Connection, network } from 'walletConnectors';
import { getConnection, getConnectionName } from 'walletConnectors/utils';
import { isPortkeyConnectEagerly } from 'utils/portkey';
import { PortkeyProvider, WebLoginProvider, setGlobalConfig } from 'aelf-web-login';

setGlobalConfig({
  appName: APP_NAME,
  chainId: WEB_LOGIN_CONFIG.chainId,
  networkType: WEB_LOGIN_CONFIG.networkType as any,
  onlyShowV2: false,
  portkey: {
    useLocalStorage: true,
    graphQLUrl: WEB_LOGIN_CONFIG.portkey.graphQLUrl,
    connectUrl: WEB_LOGIN_CONFIG.portkey.connectServer,
    serviceUrl: WEB_LOGIN_CONFIG.portkey.apiServer,
    requestDefaults: {
      baseURL: WEB_LOGIN_CONFIG.portkey.apiServer,
      timeout: 20 * 1000,
    },
  },
  portkeyV2: {
    networkType: WEB_LOGIN_CONFIG.portkeyV2.networkType as any,
    useLocalStorage: true,
    graphQLUrl: WEB_LOGIN_CONFIG.portkeyV2.graphQLUrl,
    connectUrl: WEB_LOGIN_CONFIG.portkeyV2.connectServer,
    requestDefaults: {
      baseURL: WEB_LOGIN_CONFIG.portkeyV2.apiServer,
      timeout: 20 * 1000,
    },
    loginConfig: {
      loginMethodsOrder: ['Google', 'Apple', 'Telegram', 'Email', 'Scan'],
    },
    serviceUrl: WEB_LOGIN_CONFIG.portkeyV2.apiServer,
    customNetworkType: 'onLine',
  },
  aelfReact: {
    appName: APP_NAME,
    nodes: AELF_NODES,
  },
  defaultRpcUrl: SupportedELFChain[WEB_LOGIN_CONFIG.chainId].CHAIN_INFO.rpcUrl,
});

const connect = async (connector: Connector) => {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`);
  }
};

function Web3Manager({ children }: { children: JSX.Element }) {
  const aelfConnect = useAEflConnect();
  const [{ selectERCWallet, selectELFWallet }] = useChain();
  const portkeyConnect = usePortkeyConnect();
  const tryAElf = useCallback(async () => {
    try {
      await aelfConnect(true);
    } catch (error) {
      console.debug(error, '=====error');
    }
  }, [aelfConnect]);
  const tryERC = useCallback(async () => {
    try {
      connect(network);
      if (selectERCWallet) connect(getConnection(selectERCWallet).connector);
    } catch (error) {
      console.debug(error, '=====error');
    }
  }, [selectERCWallet]);

  const tryPortkey = useCallback(
    async (isConnectEagerly?: boolean) => {
      try {
        await portkeyConnect(isConnectEagerly);
      } catch (error) {
        console.debug(error, '=====error');
      }
    },
    [portkeyConnect],
  );
  useEffectOnce(() => {
    const timer = setTimeout(() => {
      if (isPortkeyConnectEagerly()) {
        tryPortkey();
      } else {
        selectELFWallet === 'NIGHTELF' ? tryAElf() : tryPortkey(true);
      }
      tryERC();
    }, 1000);
    return () => {
      timer && clearTimeout(timer);
    };
  });
  return children;
}

export default function Web3Provider({ children }: { children: JSX.Element }) {
  const connections = useOrderedConnections();
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [connector, hooks]);
  const key = useMemo(
    () => connections.map(({ type }: Connection) => getConnectionName(type)).join('-'),
    [connections],
  );
  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      <PortkeyProvider networkType={PORTKEY_NETWORK_TYPE}>
        <WebLoginProvider
          extraWallets={['discover', 'elf']}
          nightElf={{ connectEagerly: true, useMultiChain: true }}
          portkey={{
            autoShowUnlock: false,
            checkAccountInfoSync: true,
            design: 'CryptoDesign',
          }}
          discover={{
            autoRequestAccount: true,
            autoLogoutOnAccountMismatch: true,
            autoLogoutOnChainMismatch: true,
            autoLogoutOnDisconnected: true,
            autoLogoutOnNetworkMismatch: false,
            onPluginNotFound: (openStore) => {
              openStore();
            },
          }}>
          <LoginWalletProvider>
            <Web3Manager>{children}</Web3Manager>
          </LoginWalletProvider>
        </WebLoginProvider>
      </PortkeyProvider>
    </Web3ReactProvider>
  );
}
