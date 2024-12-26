import { useCallback } from 'react';
import { ChainId, ChainType } from 'types';
import { useAelfLogin } from './wallet';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { setWalletModal } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';

export function useConnect() {
  const login = useAelfLogin();
  const { open } = useTonConnectModal();
  const dispatch = useModalDispatch();
  return useCallback(
    (chainType?: ChainType, chainId?: ChainId) => {
      switch (chainType) {
        case 'ELF': {
          login();
          break;
        }
        case 'TON': {
          open();
          break;
        }
        default: {
          dispatch(
            setWalletModal(true, {
              walletWalletType: 'ERC',
              walletChainType: chainType,
              walletChainId: chainId,
            }),
          );
          break;
        }
      }
    },
    [dispatch, login, open],
  );
}
