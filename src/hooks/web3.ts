import { useWeb3React } from '@web3-react/core';
import { ZERO } from 'constants/misc';
import { useCallback, useMemo } from 'react';
import { getProvider } from 'utils/provider';
import { Web3Type } from 'types';
import { useChain, useChainDispatch } from 'contexts/useChain';
import { ACTIVE_CHAIN, DEFAULT_ERC_CHAIN } from 'constants/index';
import { Accounts } from '@portkey/provider-types';
import { setSelectELFWallet } from 'contexts/useChain/actions';
import { useLoginWalletContext } from 'contexts/useLoginWallet/provider';
export function useAEflConnect() {
  const { activate, connectEagerly } = useLoginWalletContext();
  const chainDispatch = useChainDispatch();

  return useCallback(
    async (isConnectEagerly?: boolean) => {
      await (isConnectEagerly ? connectEagerly : activate)();
      chainDispatch(setSelectELFWallet('NIGHTELF'));
    },
    [activate, chainDispatch, connectEagerly],
  );
}

export function usePortkeyConnect() {
  const { activate, connectEagerly } = useLoginWalletContext();
  const chainDispatch = useChainDispatch();
  return useCallback(
    async (isConnectEagerly?: boolean) => {
      await (isConnectEagerly ? connectEagerly : activate)();
      chainDispatch(setSelectELFWallet('PORTKEY'));
    },
    [activate, chainDispatch, connectEagerly],
  );
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
  const aelfReact = useLoginWalletContext();
  const [{ userELFChainId }] = useChain();
  const chainId = userELFChainId;
  const tmpContext = useMemo(() => {
    const aelfBridges = aelfReact.wallet?.nightElfInfo?.aelfBridges as Web3Type['aelfInstances'];

    const contextNetwork: any = {
      ...aelfReact,
      aelfInstance: aelfReact.wallet?.nightElfInfo?.defaultAElfBridge,
      aelfInstances: aelfBridges,
    };
    if (chainId && ACTIVE_CHAIN[chainId] && aelfBridges) {
      contextNetwork.aelfInstance = aelfBridges[chainId as keyof typeof aelfBridges];
    }
    contextNetwork.walletType = 'NIGHTELF';
    return {
      ...contextNetwork,
      chainId,
      library: undefined,
      provider: undefined,
      connector: aelfReact.account ? 'NIGHT ELF' : undefined,
    };
  }, [aelfReact, chainId]);
  return tmpContext;
}

export function usePortkey(): Web3Type {
  const portkeyReact = useLoginWalletContext();
  const tmpContext = useMemo(() => {
    const contextNetwork: any = {
      ...portkeyReact,
    };
    return {
      ...contextNetwork,
      library: undefined,
      provider: undefined,
      walletType: 'PORTKEY',
      connector: portkeyReact.version === 'v1' ? 'PORTKEY V1' : 'PORTKEY',
      isPortkey: true,
    };
  }, [portkeyReact]);
  return tmpContext;
}
