'use client';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletConnectionError, WalletError } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useCallback, useMemo } from 'react';
import { USER_REJECT_CONNECT_WALLET_TIP } from 'constants/wallets';
import { devices } from '@portkey/utils';
import CommonMessage from 'components/CommonMessage';
import { handleErrorMessage } from 'utils/error';
// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

export default function SolanaProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOL_ENDPOINT || '', []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network],
  );

  const onError = useCallback((error: WalletError) => {
    if (error instanceof WalletConnectionError) {
      const isMobile = devices.isMobileDevices();
      if (!isMobile) {
        CommonMessage.error(handleErrorMessage(USER_REJECT_CONNECT_WALLET_TIP));
      }
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
