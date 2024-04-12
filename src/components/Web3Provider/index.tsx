import { AElfReactProvider } from '@aelf-react/core';
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { PORTKEY_NETWORK_TYPE } from 'constants/index';
import { AElfNodes } from 'constants/aelf';
import { APP_NAME } from 'constants/misc';
import { useChain } from 'contexts/useChain';
import { PortkeyReactProvider } from 'contexts/usePortkey/provider';
import useOrderedConnections from 'hooks/useOrderedConnections';
// import { useAEflConnect, usePortkeyConnect } from 'hooks/web3';
import { useCallback, useEffect, useMemo } from 'react';
import { useAsync, useEffectOnce, useTimeoutFn } from 'react-use';
import { Connection, network } from 'walletConnectors';
import { getConnection, getConnectionName } from 'walletConnectors/utils';
import { isPortkeyConnectEagerly } from 'utils/portkey';
import { WebLoginProvider, getConfig, PortkeyProvider, PortkeyDid, PortkeyDidV1, useWebLogin } from 'aelf-web-login';
import type { ExtraWalletNames } from 'aelf-web-login';
import { devicesEnv } from '@portkey/utils';
import { setPortkeyConfig } from 'utils/setPortkeyConfig';

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

// function Web3Manager({ children }: { children: JSX.Element }) {
//   const [{ selectERCWallet, selectELFWallet, userELFChainId }] = useChain();

//   const aelfConnect = useAEflConnect();
//   const portkeyConnect = usePortkeyConnect();
//   const tryAElf = useCallback(async () => {
//     try {
//       await aelfConnect(true);
//     } catch (error) {
//       console.debug(error, '=====error');
//     }
//   }, [aelfConnect]);

//   const tryERC = useCallback(async () => {
//     try {
//       connect(network);
//       if (selectERCWallet) connect(getConnection(selectERCWallet).connector);
//     } catch (error) {
//       console.debug(error, '=====error');
//     }
//   }, [selectERCWallet]);

//   const tryPortkey = useCallback(
//     async (isConnectEagerly?: boolean) => {
//       try {
//         await portkeyConnect(isConnectEagerly);
//       } catch (error) {
//         console.debug(error, '=====error');
//       }
//     },
//     [portkeyConnect],
//   );

//   useEffectOnce(() => {
//     const timer = setTimeout(() => {
//       if (isPortkeyConnectEagerly()) {
//         tryPortkey();
//       } else {
//         selectELFWallet === 'NIGHTELF' ? tryAElf() : tryPortkey(true);
//       }
//       tryERC();
//     }, 1000);
//     return () => {
//       timer && clearTimeout(timer);
//     };
//   });
//   return children;
// }

export default function Web3Provider({ children }: { children: JSX.Element }) {
  const connections = useOrderedConnections();
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [connector, hooks]);
  const key = useMemo(
    () => connections.map(({ type }: Connection) => getConnectionName(type)).join('-'),
    [connections],
  );

  useWebLogin();

  const [{ selectERCWallet, userELFChainId }] = useChain();

  const tryERC = useCallback(async () => {
    try {
      connect(network);
      if (selectERCWallet) connect(getConnection(selectERCWallet).connector);
    } catch (error) {
      console.debug(error, '=====error');
    }
  }, [selectERCWallet]);

  useTimeoutFn(tryERC, 1000);

  const { value, loading } = useAsync(async () => await devicesEnv.getPortkeyShellApp());

  const extraWallets: ExtraWalletNames[] | undefined = useMemo(() => {
    if (loading) {
      return;
    }

    return value ? undefined : ['discover', 'elf'];
  }, [loading, value]);

  setPortkeyConfig(userELFChainId);

  console.log('getConfig(): ', getConfig());

  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      <PortkeyProvider
        networkType={getConfig()?.networkType as PortkeyDidV1.NetworkType}
        networkTypeV2={getConfig()?.portkeyV2?.networkType as PortkeyDid.NetworkType}>
        <WebLoginProvider
          extraWallets={extraWallets}
          nightElf={{ connectEagerly: true }}
          portkey={{
            autoShowUnlock: false,
            checkAccountInfoSync: true,
            design: 'Web2Design',
            // ConfirmLogoutDialog,
            // noCommonBaseModal: true,
          }}
          discover={{
            autoRequestAccount: true,
            autoLogoutOnAccountMismatch: true,
            autoLogoutOnChainMismatch: true,
            autoLogoutOnDisconnected: true,
            autoLogoutOnNetworkMismatch: false,
          }}>
          {children}
        </WebLoginProvider>
      </PortkeyProvider>
    </Web3ReactProvider>
  );
}

{
  /* <AElfReactProvider appName={APP_NAME} nodes={AElfNodes}>
        <PortkeyReactProvider appName={APP_NAME} nodes={AElfNodes} networkType={PORTKEY_NETWORK_TYPE}>
          <Web3Manager>{children}</Web3Manager>
        </PortkeyReactProvider>
      </AElfReactProvider> */
}
