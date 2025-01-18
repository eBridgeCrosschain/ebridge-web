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
import { metaMask } from 'wagmi/connectors';
import * as MAINNET from './platform/main';

export const EVMProviderConfig = createConfig({
  chains: [mainnet, bsc, base, polygon, avalanche, arbitrum, optimism, sepolia, bscTestnet, baseSepolia],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(MAINNET.CHAIN_INFO.rpcUrl),
    [bsc.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [sepolia.id]: http(),
    [bscTestnet.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export const DEFAULT_EVM_0_ADDRESS = '0x0000000000000000000000000000000000000000';
