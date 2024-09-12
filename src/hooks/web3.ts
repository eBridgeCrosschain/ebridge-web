import { useWeb3React } from '@web3-react/core';
import { ZERO } from 'constants/misc';
import { useCallback, useMemo } from 'react';
import { getProvider } from 'utils/provider';
import { Web3Type } from 'types';
import { useChain, useChainDispatch } from 'contexts/useChain';
import { ACTIVE_CHAIN, DEFAULT_ERC_CHAIN } from 'constants/index';
import { Accounts } from '@portkey/provider-types';
import { setSelectELFWallet } from 'contexts/useChain/actions';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { ExtraInfoForNightElf } from 'types/wallet';
import { useLogin } from './wallet';

export function useAElfConnect() {
  const login = useLogin();
  const chainDispatch = useChainDispatch();

  return useCallback(async () => {
    await login();
    chainDispatch(setSelectELFWallet('NIGHTELF'));
  }, [chainDispatch, login]);
}

export function usePortkeyConnect() {
  const login = useLogin();
  const chainDispatch = useChainDispatch();
  return useCallback(async () => {
    await login();
    chainDispatch(setSelectELFWallet('PORTKEY'));
  }, [chainDispatch, login]);
}
// useActiveWeb3React contains all attributes of useWeb3React and aelf combination
export function useWeb3(): Web3Type {
  const web3React = useWeb3React();
  const [{ userERCChainId }] = useChain();
  const tmpContext = useMemo(() => {
    const contextNetwork: Web3Type = { ...web3React, accounts: web3React?.accounts as Accounts };
    if (!web3React.account) {
      if (typeof window === 'object') {
        contextNetwork.chainId = DEFAULT_ERC_CHAIN;
        const chainId = ZERO.plus(window.ethereum?.chainId ?? '');
        if (!chainId.isNaN()) {
          contextNetwork.chainId = chainId.toNumber();
        } else if (userERCChainId) {
          contextNetwork.chainId = userERCChainId;
        }
      }
      const provider = getProvider(contextNetwork.chainId);
      if (provider) {
        contextNetwork.library = provider;
        contextNetwork.provider = { provider } as any;
      }
      return contextNetwork;
    } else {
      contextNetwork.walletType = 'ERC';
      contextNetwork.library = contextNetwork.provider?.provider;
    }
    return contextNetwork;
  }, [web3React, userERCChainId]);
  return tmpContext;
}

// useActiveWeb3React contains all attributes of useWeb3React and aelf combination
export function useAElf(): Web3Type {
  const { walletInfo, walletType } = useConnectWallet();
  const [{ userELFChainId }] = useChain();
  const chainId = userELFChainId;
  const tmpContext = useMemo(() => {
    const aelfWalletInfo = walletInfo?.extraInfo as ExtraInfoForNightElf;
    const aelfBridges = aelfWalletInfo?.nightElfInfo?.aelfBridges as Web3Type['aelfInstances'];

    const contextNetwork: any = {
      ...walletInfo,
      aelfInstance: aelfWalletInfo?.nightElfInfo?.defaultAElfBridge,
      aelfInstances: aelfBridges,
    };
    if (chainId && ACTIVE_CHAIN[chainId] && aelfBridges) {
      contextNetwork.aelfInstance = aelfBridges[chainId as keyof typeof aelfBridges];
    }
    return {
      ...contextNetwork,
      chainId,
      library: undefined,
      provider: undefined,
      loginWalletType: walletType,
      walletType: 'NIGHTELF',
      connector: walletInfo?.address ? 'NIGHT ELF' : undefined,
    };
  }, [chainId, walletInfo, walletType]);
  return tmpContext;
}

export function usePortkey(): Web3Type {
  const { walletInfo, walletType } = useConnectWallet();
  const tmpContext = useMemo(() => {
    const contextNetwork: any = {
      ...walletInfo,
    };
    return {
      ...contextNetwork,
      library: undefined,
      provider: undefined,
      loginWalletType: walletType,
      walletType: 'PORTKEY',
      connector: 'PORTKEY',
      isPortkey: true,
    };
  }, [walletInfo, walletType]);

  return tmpContext;
}
