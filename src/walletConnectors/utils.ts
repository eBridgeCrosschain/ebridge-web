// import { tronWeb } from "tronweb";
import { Connector } from '@web3-react/types';
import {
  coinbaseWalletConnection,
  ConnectionType,
  injectedConnection,
  networkConnection,
  walletConnectConnection,
  tronLinkWalletConnection,
} from '.';

export function getIsInjected(): boolean {
  return Boolean(window.ethereum || window.tronWeb);
}

export function getIsMetaMask(): boolean {
  return window.ethereum?.isMetaMask ?? false;
}

export function getIsCoinbaseWallet(): boolean {
  return window.ethereum?.isCoinbaseWallet ?? false;
}

export function getIsTronLink(): boolean {
  return Boolean(window.tronWeb);
}

const CONNECTIONS = [
  injectedConnection,
  coinbaseWalletConnection,
  walletConnectConnection,
  networkConnection,
  tronLinkWalletConnection,
];
export function getConnection(c: Connector | ConnectionType) {
  if (c instanceof Connector) {
    const connection = CONNECTIONS.find((connection) => connection.connector === c);
    if (!connection) {
      throw Error('unsupported connector');
    }
    return connection;
  } else {
    switch (c) {
      case ConnectionType.INJECTED:
        return injectedConnection;
      case ConnectionType.COINBASE_WALLET:
        return coinbaseWalletConnection;
      case ConnectionType.WALLET_CONNECT:
        return walletConnectConnection;
      case ConnectionType.NETWORK:
        return networkConnection;
      case ConnectionType.TRON_LINK:
        return tronLinkWalletConnection;
    }
  }
}

export function getConnectionName(connectionType: ConnectionType, isMetaMask?: boolean, isTronLink?: boolean) {
  switch (connectionType) {
    case ConnectionType.INJECTED:
      return isMetaMask ? 'MetaMask' : isTronLink ? 'TronLink' : 'Injected';
    case ConnectionType.COINBASE_WALLET:
      return 'Coinbase Wallet';
    case ConnectionType.WALLET_CONNECT:
      return 'WalletConnect';
    case ConnectionType.NETWORK:
      return 'Network';
    case ConnectionType.TRON_LINK:
      return 'TronLink';
  }
}
