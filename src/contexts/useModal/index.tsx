import { BasicActions } from 'contexts/utils';
import { useAElf, usePortkey, useTon, useWeb3 } from 'hooks/web3';
import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { ModalActions, ModalState, basicModalView } from './actions';
import { formatPortkeyWallet } from 'contexts/useWallet/utils';
import { useWallet } from 'contexts/useWallet/hooks';
import { setSwitchChainInConnectPortkey } from 'contexts/useWallet/actions';

const INITIAL_STATE = {};
const ModalContext = createContext<any>(INITIAL_STATE);

export function useModal(): [ModalState, BasicActions<ModalActions>] {
  return useContext(ModalContext);
}

//reducer
function reducer(state: ModalState, { type, payload }: { type: ModalActions; payload: any }) {
  switch (type) {
    case ModalActions.destroy: {
      return {};
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [ModalState, BasicActions<ModalActions>['dispatch']] = useReducer(reducer, INITIAL_STATE);
  const { accountWalletType, walletWalletType, walletChainId, accountChainId } = state;
  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  const aelfWallet = useAElf();
  const web3Wallet = useWeb3();
  const portkeyWallet = usePortkey();
  const tonWallet = useTon();
  const { switchChainInConnectPortkey } = useWallet();
  const [walletWallet, accountWallet] = useMemo(() => {
    let accountWallet, walletWallet;
    switch (accountWalletType) {
      case 'ERC':
        accountWallet = web3Wallet;
        break;
      case 'PORTKEY':
        accountWallet = formatPortkeyWallet(portkeyWallet, accountChainId as any);
        break;
      case 'NIGHTELF':
      case 'FAIRY_VAULT':
        accountWallet = aelfWallet;
        break;
      case 'TON':
        accountWallet = tonWallet;
        break;
      default:
        break;
    }

    switch (walletWalletType) {
      case 'ERC':
        walletWallet = web3Wallet;
        break;
      case 'PORTKEY':
        walletWallet = formatPortkeyWallet(portkeyWallet, walletChainId as any);
        break;
      case 'NIGHTELF':
        walletWallet = aelfWallet;
        break;
      case 'TON':
        walletWallet = tonWallet;
        break;
      default:
        break;
    }

    return [walletWallet, accountWallet];
  }, [
    accountChainId,
    accountWalletType,
    aelfWallet,
    portkeyWallet,
    tonWallet,
    walletChainId,
    walletWalletType,
    web3Wallet,
  ]);

  useEffect(() => {
    if (switchChainInConnectPortkey?.status) {
      dispatch(
        basicModalView.setPortketNotConnectModal({
          visible: true,
          chainId: switchChainInConnectPortkey?.chainId,
        }),
      );
      setSwitchChainInConnectPortkey({
        status: false,
        chainId: undefined,
      });
    }
  }, [switchChainInConnectPortkey]);

  return (
    <ModalContext.Provider
      value={useMemo(
        () => [{ ...state, walletWallet, accountWallet }, actions],
        [state, walletWallet, accountWallet, actions],
      )}>
      {children}
    </ModalContext.Provider>
  );
}
