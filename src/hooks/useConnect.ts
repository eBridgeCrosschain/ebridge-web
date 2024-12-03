import { useCallback } from 'react';
import { ChainId, ChainType } from 'types';
import { useLogin } from './wallet';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { setWalletModal } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';

export function useConnect() {
  const login = useLogin();
  const { open } = useTonConnectModal();
  const dispatch = useModalDispatch();
  return useCallback(
    (chainType?: ChainType, chainId?: ChainId) => {
      console.log(chainType, '===chainType');

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
