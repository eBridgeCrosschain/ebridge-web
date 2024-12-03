import { WalletInfo } from 'types';
import { coinbaseWallet, injected, walletConnect } from 'walletConnectors';

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconType: 'MetaMask',
    description: 'Easy-to-use browser extension.',
    href: null,
  },
  WALLET_CONNECT: {
    connector: walletConnect,
    name: 'WalletConnect',
    iconType: 'WalletConnect',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
  },
  COINBASE_WALLET: {
    connector: coinbaseWallet,
    name: 'Coinbase Wallet',
    iconType: 'coinbaseWallet',
    description: 'Connect to Coinbase Wallet',
    href: null,
  },
  NIGHT_ELF: {
    connector: 'NIGHT ELF',
    name: 'NIGHT ELF',
    iconType: 'nightElf',
    description: 'NIGHT ELF',
    href: null,
  },
  PORTKEY: {
    connector: 'PORTKEY',
    name: 'Portkey Wallet',
    iconType: 'portkeyV2',
    description: 'Portkey Wallet',
    href: null,
  },
  TON: {
    chainType: 'TON',
    connector: 'TON',
    name: 'Ton connect',
    iconType: 'ton-wallet',
    description: 'Ton connect',
    href: null,
  },
};
