import { AElfReactProvider } from '@aelf-react/core';
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { PORTKEY_NETWORK_TYPE } from 'constants/index';
import { AElfNodes } from 'constants/aelf';
import { APP_NAME } from 'constants/misc';
import { useChain } from 'contexts/useChain';
import { PortkeyReactProvider } from 'contexts/usePortkey/provider';
import { PortkeyNameVersion } from 'contexts/usePortkey/constants';
import useOrderedConnections from 'hooks/useOrderedConnections';
import { useAEflConnect, usePortkeyConnect } from 'hooks/web3';
import { useCallback, useMemo } from 'react';
import { useEffectOnce } from 'react-use';
import { Connection, network } from 'walletConnectors';
import { getConnection, getConnectionName } from 'walletConnectors/utils';
import { isPortkeyConnectEagerly } from 'utils/portkey';

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
        await portkeyConnect(PortkeyNameVersion.v1, isConnectEagerly);
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
      <AElfReactProvider appName={APP_NAME} nodes={AElfNodes}>
        <PortkeyReactProvider appName={APP_NAME} nodes={AElfNodes} networkType={PORTKEY_NETWORK_TYPE}>
          <Web3Manager>{children}</Web3Manager>
        </PortkeyReactProvider>
      </AElfReactProvider>
    </Web3ReactProvider>
  );
}
