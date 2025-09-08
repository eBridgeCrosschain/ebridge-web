import dynamic from 'next/dynamic';
import { useInitWallet } from 'hooks/wallet';
import EVMProvider from './evm';
import { did } from '@portkey/did';
import { didConfig } from './webLoginV2Config';
import { useMemo } from 'react';
import { checkConnectedWallet } from 'utils/portkey';

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
  useMemo(() => {
    did.setConfig(didConfig);
    checkConnectedWallet();
  }, []);
  return (
    <EVMProvider>
      <WebLoginProviderDynamic>
        <Web3Manager>{children}</Web3Manager>
      </WebLoginProviderDynamic>
    </EVMProvider>
  );
}
