import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { useChain } from 'contexts/useChain';
import useOrderedConnections from 'hooks/useOrderedConnections';
// import { useAElfConnect, usePortkeyConnect } from 'hooks/web3';
import { useCallback, useMemo } from 'react';
import { useEffectOnce } from 'react-use';
import { Connection, network } from 'walletConnectors';
import { getConnection, getConnectionName } from 'walletConnectors/utils';
// import { isPortkeyConnectEagerly } from 'utils/portkey';
import dynamic from 'next/dynamic';
import { useInitWallet } from 'hooks/wallet';

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
  useInitWallet();
  // const aelfConnect = useAElfConnect();
  const [{ selectERCWallet }] = useChain();
  // const portkeyConnect = usePortkeyConnect();
  // const tryAElf = useCallback(async () => {
  //   try {
  //     await aelfConnect();
  //   } catch (error) {
  //     console.debug(error, '=====error');
  //   }
  // }, [aelfConnect]);
  const tryERC = useCallback(async () => {
    try {
      connect(network);
      if (selectERCWallet) connect(getConnection(selectERCWallet).connector);
    } catch (error) {
      console.debug(error, '=====error');
    }
  }, [selectERCWallet]);

  // const tryPortkey = useCallback(async () => {
  //   try {
  //     await portkeyConnect();
  //   } catch (error) {
  //     console.debug(error, '=====error');
  //   }
  // }, [portkeyConnect]);
  useEffectOnce(() => {
    const timer = setTimeout(() => {
      // if (isPortkeyConnectEagerly()) {
      //   tryPortkey();
      // } else {
      //   selectELFWallet === 'NIGHTELF' ? tryAElf() : tryPortkey();
      // }
      tryERC();
    }, 1000);
    return () => {
      timer && clearTimeout(timer);
    };
  });
  return children;
}

const WebLoginProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('./webLoginV2Provider').then((module) => module);
    return WalletProvider;
  },
  {
    ssr: false,
  },
);

export default function Web3Provider({ children }: { children: JSX.Element }) {
  const connections = useOrderedConnections();
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [connector, hooks]);
  const key = useMemo(
    () => connections.map(({ type }: Connection) => getConnectionName(type)).join('-'),
    [connections],
  );
  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      <WebLoginProviderDynamic>
        <Web3Manager>{children}</Web3Manager>
      </WebLoginProviderDynamic>
    </Web3ReactProvider>
  );
}
