import { WalletInfo } from 'types';
import { coinbaseWallet, injected, walletConnect } from 'walletConnectors';
import { PortkeyNameVersion } from '../contexts/usePortkey/constants';

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
    name: 'Portkey (Deprecated)',
    iconType: 'portkey',
    description: 'Portkey (Deprecated)',
    href: null,
    version: PortkeyNameVersion.v1,
  },
  PORTKEY_V2: {
    connector: 'PORTKEY',
    name: 'Portkey Wallet',
    iconType: 'portkey',
    description: 'Portkey Wallet',
    href: null,
    version: PortkeyNameVersion.v2,
  },
};
