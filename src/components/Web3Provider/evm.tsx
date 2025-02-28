import { WagmiProvider } from 'wagmi';
import { EVMProviderConfig } from 'constants/evm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient();
export default function EVMProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={EVMProviderConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
