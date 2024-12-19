import { useWeb3React } from '@web3-react/core';
import { ZERO } from 'constants/misc';
import { useCallback, useMemo } from 'react';
import { getProvider } from 'utils/provider';
import { ChainId, Web3Type } from 'types';
import { useChain, useChainDispatch } from 'contexts/useChain';
import { ACTIVE_CHAIN, DEFAULT_ERC_CHAIN, IS_MAINNET } from 'constants/index';
import { Accounts } from '@portkey/provider-types';
import { setSelectELFWallet } from 'contexts/useChain/actions';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { ExtraInfoForDiscover, ExtraInfoForNightElf, ExtraInfoForPortkeyAA } from 'types/wallet';
import { useAelfLogin } from './wallet';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { getPortkeySDKAccount } from 'utils/wallet';
import { useTonWallet } from '@tonconnect/ui-react';
import { toUserFriendlyAddress } from '@tonconnect/sdk';
import { SupportedTONChainId } from 'constants/chain';
import { isELFChain } from 'utils/aelfUtils';
import { isTonChain } from 'utils';

export function useAElfConnect() {
  const login = useAelfLogin();
  const chainDispatch = useChainDispatch();

  return useCallback(async () => {
    await login();
    chainDispatch(setSelectELFWallet('NIGHTELF'));
  }, [chainDispatch, login]);
}

export function usePortkeyConnect() {
  const login = useAelfLogin();
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
        if (!chainId.isNaN() && contextNetwork.account) {
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
  const { walletInfo, walletType, isConnected } = useConnectWallet();
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
      account: walletInfo?.address,
      isActive: isConnected && !!walletInfo,
      chainId,
      library: undefined,
      provider: undefined,
      loginWalletType: walletType,
      walletType: 'NIGHTELF',
      connector: walletInfo?.address ? 'NIGHT ELF' : undefined,
    };
  }, [chainId, isConnected, walletInfo, walletType]);
  return tmpContext;
}

export function usePortkey(): Web3Type {
  const { walletInfo, walletType, isConnected } = useConnectWallet();
  const tmpContext = useMemo(() => {
    const contextNetwork: any = {
      ...walletInfo,
    };
    const _walletAAInfo = walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
    const _walletDiscoverInfo = walletInfo?.extraInfo as ExtraInfoForDiscover;

    let _accounts;

    switch (walletType) {
      case WalletTypeEnum.aa:
        // sdk login
        _accounts = getPortkeySDKAccount(_walletAAInfo.portkeyInfo.accounts);
        break;

      case WalletTypeEnum.discover:
        _accounts = _walletDiscoverInfo.accounts;
        break;
      default:
        break;
    }
    return {
      ...contextNetwork,
      accounts: _accounts,
      wallet: { ...contextNetwork },
      isActive: isConnected && !!walletInfo,
      library: undefined,
      provider: walletInfo?.extraInfo?.provider,
      loginWalletType: walletType,
      walletType: 'PORTKEY',
      connector: 'PORTKEY',
      isPortkey: true,
    };
  }, [isConnected, walletInfo, walletType]);

  return tmpContext;
}

export function useTon(): Web3Type {
  const wallet = useTonWallet();
  return useMemo(() => {
    return {
      ...wallet,
      account: wallet?.account.address ? toUserFriendlyAddress(wallet?.account.address, !IS_MAINNET) : undefined,
      wallet: { ...wallet },
      isActive: !!wallet?.account,
      library: undefined,
      provider: undefined,
      loginWalletType: undefined,
      walletType: 'TON',
      connector: 'TON',
      isTON: true,
      chainId: IS_MAINNET ? SupportedTONChainId.MAINNET : SupportedTONChainId.TESTNET,
      baseAccount: wallet?.account,
    } as any;
  }, [wallet]);
}

export function useWeb3Wallet(chainId?: ChainId) {
  const tonWallet = useTon();
  const aelfWallet = useAElf();
  const web3Wallet = useWeb3();

  return useMemo(() => {
    if (isELFChain(chainId)) return aelfWallet;
    if (isTonChain(chainId)) return tonWallet;
    return web3Wallet;
  }, [aelfWallet, chainId, tonWallet, web3Wallet]);
}
