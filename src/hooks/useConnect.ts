import { useCallback } from 'react';
import { ChainId, ChainType } from 'types';
import { useAelfLogin } from './wallet';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { setWalletModal } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import useSolana from './wallet/useSolana';
import { SOLANA_WALLET_NAME } from 'constants/wallets';

export function useConnect() {
  const login = useAelfLogin();
  const { open } = useTonConnectModal();
  const { connect } = useSolana();
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
        case 'Solana': {
          connect(SOLANA_WALLET_NAME);
          break;
        }
        default: {
          // ERC
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
    [connect, dispatch, login, open],
  );
}
