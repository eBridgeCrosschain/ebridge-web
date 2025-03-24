import {
  AElfConnectorId,
  EVMConnectorId,
  SolanaConnectorId,
  TONConnectorId,
  TWalletConnectorId,
  WalletInfo,
} from 'types';

export const SUPPORTED_WALLETS: Record<TWalletConnectorId, WalletInfo> = {
  [EVMConnectorId.METAMASK]: {
    connectorId: EVMConnectorId.METAMASK,
    chainType: 'ERC',
    name: 'MetaMask',
    iconType: 'MetaMask',
    description: 'Easy-to-use browser extension.',
    href: null,
  },
  [EVMConnectorId.WALLET_CONNECT]: {
    connectorId: EVMConnectorId.WALLET_CONNECT,
    chainType: 'ERC',
    name: 'WalletConnect',
    iconType: 'WalletConnect',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
  },
  [EVMConnectorId.COINBASE_WALLET]: {
    connectorId: EVMConnectorId.COINBASE_WALLET,
    chainType: 'ERC',
    name: 'Coinbase Wallet',
    iconType: 'coinbaseWallet',
    description: 'Connect to Coinbase Wallet',
    href: null,
  },
  [AElfConnectorId.NIGHTELF]: {
    connectorId: AElfConnectorId.NIGHTELF,
    chainType: 'ELF',
    name: 'NIGHTELF',
    iconType: 'nightElf',
    description: 'NIGHTELF',
    href: null,
  },
  [AElfConnectorId.PORTKEY]: {
    connectorId: AElfConnectorId.PORTKEY,
    chainType: 'ELF',
    name: 'Portkey Wallet',
    iconType: 'portkeyV2',
    description: 'Portkey Wallet',
    href: null,
  },
  [TONConnectorId.TON]: {
    connectorId: TONConnectorId.TON,
    chainType: 'TON',
    name: 'Ton connect',
    iconType: 'ton-wallet',
    description: 'Ton connect',
    href: null,
  },
  [SolanaConnectorId.Phantom]: {
    connectorId: SolanaConnectorId.Phantom,
    chainType: 'Solana',
    name: 'Solana connect',
    iconType: 'phantom',
    description: 'Solana connect',
    href: null,
  },
};

export const USER_REJECT_CONNECT_WALLET_TIP = 'User rejected the request';

export const SOLANA_STORAGE_CONNECTED_KEY = 'walletName';

export const SOLANA_WALLET_NAME = 'Phantom';
