import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { MetaMask } from '@web3-react/metamask';
import { TronLink } from '@web3-react/tron-link';
import { Network } from '@web3-react/network';
import { SupportedChainId } from 'constants/chain';
// import { SupportedTRONChainId } from 'constants/chain';
import { Connector } from '@web3-react/types';
import * as MAINNET from 'constants/platform/main';
import * as BSC_TESTNET from 'constants/platform/BSC_Test';
import * as SEPOLIA from 'constants/platform/sepolia';
import * as BSC from 'constants/platform/BSC';
import * as TRON_MAINNET from 'constants/platform/TRON_Mainnet';
import * as TRON_SHASTA_TESTNET from 'constants/platform/TRON_Shasta_Testnet';
import * as TRON_NILE_TESTNET from 'constants/platform/TRON_Nile_Testnet';
import * as TRON_DEVNET from 'constants/platform/TRON_Devnet';
import { DEFAULT_ERC_CHAIN } from 'constants/index';

export const NETWORK_URLS: { [key: number]: string } = {
  [SupportedChainId.MAINNET]: MAINNET.CHAIN_INFO.rpcUrl,
  [SupportedChainId.BSC_MAINNET]: BSC.CHAIN_INFO.rpcUrl,
  [SupportedChainId.BSC_TESTNET]: BSC_TESTNET.CHAIN_INFO.rpcUrl,
  [SupportedChainId.SEPOLIA]: SEPOLIA.CHAIN_INFO.rpcUrl,
  [SupportedChainId.TRON_MAINNET]: TRON_MAINNET.CHAIN_INFO.rpcUrl,
  [SupportedChainId.TRON_SHASTA_TESTNET]: TRON_SHASTA_TESTNET.CHAIN_INFO.rpcUrl,
  [SupportedChainId.TRON_NILE_TESTNET]: TRON_NILE_TESTNET.CHAIN_INFO.rpcUrl,
  [SupportedChainId.TRON_DEVNET]: TRON_DEVNET.CHAIN_INFO.rpcUrl,
};
export enum ConnectionType {
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
  TRON_LINK = 'TRON_LINK',
}
export interface Connection {
  connector: Connector;
  hooks: Web3ReactHooks;
  type: ConnectionType;
}

export const BACKFILLABLE_WALLETS = [
  ConnectionType.INJECTED,
  ConnectionType.WALLET_CONNECT,
  ConnectionType.COINBASE_WALLET,
  ConnectionType.TRON_LINK,
];
function onError(error: Error) {
  console.debug(`web3-react error: ${error}`);
}
export const [injected, injectedHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }));
export const injectedConnection: Connection = {
  connector: injected,
  hooks: injectedHooks,
  type: ConnectionType.INJECTED,
};
export const [network, networkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: NETWORK_URLS, defaultChainId: DEFAULT_ERC_CHAIN }),
);
export const networkConnection: Connection = {
  connector: network,
  hooks: networkHooks,
  type: ConnectionType.NETWORK,
};
export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpcMap: NETWORK_URLS,
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
        showQrModal: true,
        chains: [DEFAULT_ERC_CHAIN],
        optionalChains: Object.keys(NETWORK_URLS).map((i) => Number(i)),
        qrModalOptions: {
          themeVariables: {
            '--wcm-z-index': '9999',
          },
        },
      },
      onError,
    }),
);
export const walletConnectConnection: Connection = {
  connector: walletConnect,
  hooks: walletConnectHooks,
  type: ConnectionType.WALLET_CONNECT,
};
export const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: NETWORK_URLS[DEFAULT_ERC_CHAIN],
        appName: process.env.NEXT_PUBLIC_PREFIX || 'appName',
        reloadOnDisconnect: false,
      },
      onError,
    }),
);

export const coinbaseWalletConnection: Connection = {
  connector: coinbaseWallet,
  hooks: coinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
};

export const [tronLink, tronLinkHooks] = initializeConnector<TronLink>(
  (actions) =>
    new TronLink({
      actions,
      options: {
        // TODO
        // url: NETWORK_URLS[DEFAULT_ERC_CHAIN],
        // appName: process.env.NEXT_PUBLIC_PREFIX || 'appName',
        // reloadOnDisconnect: false,
      },
      onError,
    }),
);

export const tronLinkWalletConnection: Connection = {
  connector: tronLink,
  hooks: tronLinkHooks,
  type: ConnectionType.TRON_LINK,
};
