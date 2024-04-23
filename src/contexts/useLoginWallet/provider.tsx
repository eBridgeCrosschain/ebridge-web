import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  Actions,
  ILoginWalletContextState,
  ILoginWalletContextType,
  ILoginWalletProviderProps,
  ReducerAction,
} from './types';
import { ChainId, MethodsWallet } from '@portkey/provider-types';
import detectProviderV1 from '@portkey-v1/detect-provider';
import detectProvider from '@portkey/detect-provider';
import {
  PortkeyDid,
  PortkeyDidV1,
  WalletType,
  WebLoginEvents,
  WebLoginState,
  useWebLogin,
  useWebLoginEvent,
} from 'aelf-web-login';
import { useChainDispatch } from 'contexts/useChain';
import { setSelectELFWallet, setSelectERCWallet } from 'contexts/useChain/actions';
import { sleep } from 'utils';
import { getPortkeySDKAccount, getPortkeyV1SDKAccount } from './utils';
import { clearWCStorageByDisconnect } from 'utils/localStorage';
import CommonMessage from 'components/CommonMessage';

const INITIAL_STATE = {
  isActive: false,
  account: undefined,
  defaultAElfBridge: undefined,
  pubKey: undefined,
  publicKey: undefined,
};

const LoginWalletContext = createContext<ILoginWalletContextType | undefined>(undefined);

//reducer
function reducer(state: ILoginWalletContextState, { type, payload }: ReducerAction) {
  switch (type) {
    case Actions.DEACTIVATE: {
      return Object.assign({}, state, INITIAL_STATE, payload);
    }
    case Actions.ACTIVATE: {
      return Object.assign({}, state, payload);
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export function LoginWalletProvider({ children }: ILoginWalletProviderProps) {
  const [state, dispatch]: [ILoginWalletContextState, any] = useReducer(reducer, INITIAL_STATE);
  const { provider } = state;
  const chainDispatch = useChainDispatch();

  const webLoginContext = useWebLogin();
  const webLoginContextRef = useRef(webLoginContext);
  webLoginContextRef.current = webLoginContext;

  const activate = useCallback(async () => {
    webLoginContextRef.current?.login();
  }, []);
  const deactivate = useCallback(async () => {
    webLoginContextRef.current?.logout();
    return true;
  }, []);

  const connectEagerly = useCallback(async () => {
    webLoginContextRef.current?.loginEagerly();
  }, []);

  const onLogin = useCallback(async () => {
    const _webLoginContext = webLoginContextRef.current;
    console.log('onLogin', _webLoginContext);
    if (_webLoginContext.walletType === WalletType.elf) {
      dispatch({
        type: Actions.ACTIVATE,
        payload: {
          account: _webLoginContext.wallet.address,
          isActive: true,
          loginWalletType: _webLoginContext.walletType,
          version: _webLoginContext.version,
          wallet: _webLoginContext.wallet,
        },
      });
      chainDispatch(setSelectELFWallet('NIGHTELF'));
      return;
    }

    try {
      const isPortkeyV2 = _webLoginContext.version === 'v2';
      let _provider: any;
      let accounts: Record<string, Array<string>> = {};
      if (_webLoginContext.walletType === WalletType.discover) {
        // discover login
        _provider = await (isPortkeyV2 ? detectProvider() : detectProviderV1());
        if (!_provider) throw Error('provider init error');
        accounts = _webLoginContext.wallet.discoverInfo?.accounts || {};
      } else {
        // sdk login
        const sdkAccounts = _webLoginContext.wallet.portkeyInfo?.accounts;
        if (isPortkeyV2) {
          accounts = getPortkeySDKAccount(sdkAccounts);
        } else {
          const caHash = _webLoginContext.wallet.portkeyInfo?.caInfo?.caHash;
          accounts = await getPortkeyV1SDKAccount(sdkAccounts, caHash);
        }
      }
      dispatch({
        type: Actions.ACTIVATE,
        payload: {
          accounts,
          name: '',
          provider: _provider,
          isActive: true,
          loginWalletType: _webLoginContext.walletType,
          version: _webLoginContext.version,
          wallet: _webLoginContext.wallet,
        },
      });

      chainDispatch(setSelectELFWallet('PORTKEY'));
    } catch (error) {
      console.log('onLogin error', error);
    }
  }, [chainDispatch]);
  useEffect(() => {
    if (webLoginContext.loginState !== WebLoginState.logined) return;
    onLogin();
  }, [webLoginContext.loginState, onLogin]);

  const onLogout = useCallback(async () => {
    console.log('onLogout');
    dispatch({
      type: Actions.DEACTIVATE,
      payload: undefined,
    });
    chainDispatch(setSelectERCWallet(undefined));
    clearWCStorageByDisconnect();
    await sleep(500);
    webLoginContextRef.current?.login();
  }, [chainDispatch]);
  useWebLoginEvent(WebLoginEvents.LOGOUT, onLogout);

  const onLoginError = useCallback((error: any) => {
    console.log('onLoginError', error);
    if (error?.message) {
      CommonMessage.error(error.message);
    }
  }, []);
  useWebLoginEvent(WebLoginEvents.LOGIN_ERROR, onLoginError);

  const getWalletManagerStatus = useCallback(
    async (chainId: ChainId) => {
      const _webLoginContext = webLoginContextRef.current;
      if (!_webLoginContext) return false;
      if (_webLoginContext.walletType === WalletType.elf) return true;
      if (_webLoginContext.walletType === WalletType.discover) {
        if (!provider) {
          return false;
        }
        return provider.request({
          method: MethodsWallet.GET_WALLET_MANAGER_SYNC_STATUS,
          payload: { chainId },
        });
      }
      // portkey sdk
      const { wallet } = _webLoginContext;
      if (_webLoginContext.version === 'v1') {
        return PortkeyDidV1.did.checkManagerIsExist({
          chainId,
          caHash: wallet.portkeyInfo?.caInfo?.caHash || '',
          managementAddress: wallet.portkeyInfo?.walletInfo?.address || '',
        });
      } else {
        return PortkeyDid.did.checkManagerIsExist({
          chainId,
          caHash: wallet.portkeyInfo?.caInfo?.caHash || '',
          managementAddress: wallet.portkeyInfo?.walletInfo?.address || '',
        });
      }
    },
    [provider],
  );

  return useMemo(
    () => (
      <LoginWalletContext.Provider
        value={{ ...state, activate, deactivate, connectEagerly, getWalletManagerStatus } as any}>
        {children}
      </LoginWalletContext.Provider>
    ),
    [state, activate, deactivate, connectEagerly, getWalletManagerStatus, children],
  );
}

export function useLoginWalletContext() {
  const context = useContext(LoginWalletContext);
  if (!context) throw Error('useLoginWalletContext can only be used within the LoginWalletProvider component');
  return context;
}
