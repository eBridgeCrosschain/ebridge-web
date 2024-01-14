import { WalletInfo } from 'types';
import { coinbaseWallet, injected, walletConnect, tronLink } from 'walletConnectors';

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
    description: 'Use Coinbase Wallet app on mobile device',
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
    name: 'PORTKEY',
    iconType: 'portkey',
    description: 'PORTKEY',
    href: null,
  },
  TRON_LINK: {
    connector: tronLink,
    name: 'TRONLINK',
    iconType: 'tronLink',
    description: 'TRONLINK',
    href: 'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_16148_23.0e0b48355a318994ec8af9b76b4de4a8.js',
  },
};
