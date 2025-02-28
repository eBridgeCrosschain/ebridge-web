import { http, createConfig } from 'wagmi';
import {
  arbitrum,
  avalanche,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';
import { WEBSITE_ICON } from 'constants/index';
import * as MAINNET from 'constants/platform/main';
import * as BSC_TESTNET from 'constants/platform/BSC_Test';
import * as SEPOLIA from 'constants/platform/sepolia';
import * as BSC from 'constants/platform/BSC';

const WalletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

export const EVMProviderConfig = createConfig({
  chains: [mainnet, bsc, base, polygon, avalanche, arbitrum, optimism, sepolia, bscTestnet, baseSepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: process.env.NEXT_PUBLIC_PREFIX || 'eBridge',
      appLogoUrl: WEBSITE_ICON,
      reloadOnDisconnect: false,
    }),

    walletConnect({
      projectId: WalletConnectProjectId,
      showQrModal: true,
      qrModalOptions: {
        themeVariables: {
          '--wcm-z-index': '9999',
        },
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(MAINNET.CHAIN_INFO.rpcUrl),
    [bsc.id]: http(BSC.CHAIN_INFO.rpcUrl),
    [base.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [sepolia.id]: http(SEPOLIA.CHAIN_INFO.rpcUrl),
    [bscTestnet.id]: http(BSC_TESTNET.CHAIN_INFO.rpcUrl),
    [baseSepolia.id]: http(),
  },
});

export const DEFAULT_EVM_0_ADDRESS = '0x0000000000000000000000000000000000000000';
