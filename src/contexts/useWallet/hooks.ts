import { useMemo } from 'react';
import { useWalletContext } from '.';

export function useWallet() {
  const [state] = useWalletContext();
  return useMemo(() => state, [state]);
}

export function useWalletActions() {
  const [, actions] = useWalletContext();
  return useMemo(() => actions, [actions]);
}
