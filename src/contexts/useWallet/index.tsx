import { ACTIVE_CHAIN, DEFAULT_MODAL_INITIAL_STATE } from 'constants/index';
import storages from 'constants/storages';
import { BasicActions } from 'contexts/utils';
import useStorageReducer, { StorageOptions } from 'hooks/useStorageReducer';
import { useAElf, usePortkey, useTon, useWeb3 } from 'hooks/web3';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { isELFChain } from 'utils/aelfUtils';
import { WalletActions, ModalState, setToWallet, setFromWallet, setSwitchChainInConnectPortkey } from './actions';
import { getWalletByOptions, isChange } from './utils';
import { useChain } from 'contexts/useChain';
import { usePrevious } from 'react-use';
import { Web3Type } from 'types';
import { isPortkeyConnector, isSelectPortkey } from 'utils/portkey';
import { SupportedELFChainId } from 'constants/chain';
import { setUserELFChainId } from 'contexts/useChain/actions';
import { Accounts } from '@portkey/provider-types';
import { useThrottleCallback } from 'hooks';

const INITIAL_STATE = DEFAULT_MODAL_INITIAL_STATE as ModalState;
const ModalContext = createContext<any>(INITIAL_STATE);

export function useWalletContext(): [ModalState, BasicActions<WalletActions>] {
  return useContext(ModalContext);
}

//reducer
function reducer(state: ModalState, { type, payload }: { type: WalletActions; payload: any }) {
  switch (type) {
    case WalletActions.destroy: {
      return {};
    }
    case WalletActions.changeWallet: {
      const { fromOptions, toOptions } = state;
      return Object.assign({}, state, { fromOptions: toOptions, toOptions: fromOptions, changing: true });
    }
    case WalletActions.changeEnd: {
      return Object.assign({}, state, { changing: false });
    }
    case WalletActions.setFromWallet: {
      const { toOptions, fromOptions } = state;
      const newState: ModalState = { ...payload };
      if (isChange(toOptions, payload.fromOptions)) newState.toOptions = fromOptions;
      return Object.assign({}, state, newState);
    }
    case WalletActions.resetFromToWallet: {
      return Object.assign({}, state, INITIAL_STATE);
    }
    case WalletActions.setToWallet: {
      const { toOptions, fromOptions } = state;
      const newState: ModalState = { ...payload };
      if (isChange(fromOptions, payload.toOptions)) newState.fromOptions = toOptions;
      return Object.assign({}, state, newState);
    }
    case WalletActions.setSwitchChainInConnectPortkey: {
      return Object.assign({}, state, {
        switchChainInConnectPortkey: payload,
      });
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}

const options: StorageOptions = {
  key: storages.useWallet + (process.env.NEXT_PUBLIC_APP_ENV || ''),
  blacklist: ['switchChainInConnectPortkey'],
};
export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [ModalState, BasicActions<WalletActions>['dispatch']] = useStorageReducer(
    reducer,
    INITIAL_STATE,
    options,
  );

  const { fromOptions, toOptions } = state;

  const [{ selectELFWallet }, { dispatch: chainDispatch }] = useChain();

  const aelfWallet = useAElf();
  const web3Wallet = useWeb3();
  const portkeyWallet = usePortkey();
  const tonWallet = useTon();

  const [fromWallet, toWallet]: [Web3Type, Web3Type] = useMemo(
    () => [
      getWalletByOptions(aelfWallet, web3Wallet, portkeyWallet, tonWallet, fromOptions, selectELFWallet),
      getWalletByOptions(aelfWallet, web3Wallet, portkeyWallet, tonWallet, toOptions, selectELFWallet),
    ],
    [aelfWallet, web3Wallet, portkeyWallet, tonWallet, fromOptions, selectELFWallet, toOptions],
  );

  const portkeyActive = useMemo(() => portkeyWallet.isActive, [portkeyWallet.isActive]);

  const prePortkeyActive = usePrevious(portkeyActive);

  const changeWallet = useThrottleCallback(() => {
    let selectWallet;
    if (isPortkeyConnector(fromWallet.connector as string) && fromWallet.isActive && !fromWallet.account) {
      selectWallet = 'from';
    } else if (isPortkeyConnector(toWallet.connector as string) && toWallet.isActive && !toWallet.account) {
      selectWallet = 'to';
    }

    if (selectWallet) {
      const isForm = selectWallet === 'from';
      const _wallet = ((isForm ? fromWallet : toWallet) as { accounts: Accounts })?.accounts || {};
      const activeChainId = Object.keys(_wallet)?.[0] as SupportedELFChainId;
      if (!ACTIVE_CHAIN[activeChainId]) return;

      if (
        (portkeyActive && isForm && activeChainId !== fromOptions?.chainId) ||
        (portkeyActive && !isForm && activeChainId !== toOptions?.chainId)
      ) {
        dispatch(
          setSwitchChainInConnectPortkey({
            status: true,
            chainId: isForm ? fromOptions?.chainId : toOptions?.chainId,
          }),
        );
      }

      dispatch((isForm ? setFromWallet : setToWallet)({ chainId: activeChainId, chainType: 'ELF' }));
      chainDispatch(setUserELFChainId(activeChainId));
    }
  }, [dispatch, chainDispatch, fromWallet, toWallet]);

  useEffect(() => {
    if (isSelectPortkey(selectELFWallet) && portkeyActive && fromOptions?.chainType === toOptions?.chainType) {
      dispatch(setToWallet({ chainType: 'ERC' }));
    } else {
      changeWallet();
    }
  }, [
    dispatch,
    fromOptions?.chainType,
    portkeyActive,
    prePortkeyActive,
    toOptions?.chainType,
    changeWallet,
    portkeyWallet,
    selectELFWallet,
  ]);

  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  const isHomogeneous = useMemo(
    () => isELFChain(fromWallet?.chainId) && isELFChain(toWallet?.chainId),
    [fromWallet?.chainId, toWallet?.chainId],
  );
  return (
    <ModalContext.Provider
      value={useMemo(
        () => [{ ...state, fromWallet, toWallet, isHomogeneous }, actions],
        [state, fromWallet, toWallet, isHomogeneous, actions],
      )}>
      {children}
    </ModalContext.Provider>
  );
}
