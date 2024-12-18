import { http, createConfig } from 'wagmi';
import { arbitrum, avalanche, base, bsc, bscTestnet, mainnet, optimism, polygon, sepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

export const EVMProviderConfig = createConfig({
  chains: [mainnet, bsc, base, polygon, avalanche, arbitrum, optimism, sepolia, bscTestnet],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [sepolia.id]: http(),
    [bscTestnet.id]: http(),
  },
});
