import dynamic from 'next/dynamic';
import { useInitWallet } from 'hooks/wallet';
import EVMProvider from './evm';
import SolanaProvider from './Solana';

function Web3Manager({ children }: { children: JSX.Element }) {
  useInitWallet();

  return children;
}

const WebLoginProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('./webLoginV2Provider').then((module) => module);
    return WalletProvider;
  },
  {
    ssr: false,
  },
);

export default function Web3Provider({ children }: { children: JSX.Element }) {
  return (
    <EVMProvider>
      <SolanaProvider>
        <WebLoginProviderDynamic>
          <Web3Manager>{children}</Web3Manager>
        </WebLoginProviderDynamic>
      </SolanaProvider>
    </EVMProvider>
  );
}
