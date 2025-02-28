import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ZERO } from 'constants/misc';
import { useCallback, useMemo } from 'react';
import { getProvider } from 'utils/provider';
import { AElfConnectorId, ChainId, EVMConnectorId, TONConnectorId, Web3Type } from 'types';
import { useChain, useChainDispatch } from 'contexts/useChain';
import { ACTIVE_CHAIN, DEFAULT_ERC_CHAIN, IS_MAINNET } from 'constants/index';
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
import { getNetworkInfo, switchChain } from 'utils/network';
import { useLatestRef } from 'hooks';

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
  const accountInfo = useAccount();
  const { disconnectAsync } = useDisconnect();
  const [{ userERCChainId }] = useChain();

  const tmpContext = useMemo(() => {
    const contextNetwork: Web3Type = {
      ...accountInfo,
      connector: accountInfo.connector,
      connectorId: accountInfo.connector?.type as EVMConnectorId,
      chainId: accountInfo.chainId,
      isActive: accountInfo.isConnected,
      isPortkey: false,
      walletType: 'ERC',
      loginWalletType: WalletTypeEnum.unknown,
      account: accountInfo.address,
      accounts: accountInfo.addresses,
      deactivate: disconnectAsync,
    };
    if (!accountInfo.address) {
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
      // const provider = await accountInfo.connector?.getProvider({ chainId: contextNetwork.chainId as number });
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
  }, [accountInfo, disconnectAsync, userERCChainId]);

  return tmpContext;
}

const PORTKEY_TYPE = ['PortkeyDiscover', 'PortkeyAA'];

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
    const isPortkey = PORTKEY_TYPE.includes(walletType) ? true : false;
    const _walletType = isPortkey ? 'PORTKEY' : 'NIGHTELF';
    return {
      ...contextNetwork,
      account: walletInfo?.address,
      isActive: isConnected && !!walletInfo,
      chainId,
      library: undefined,
      provider: undefined,
      loginWalletType: walletType,
      walletType: _walletType,
      connector: walletInfo?.address ? _walletType : undefined,
      connectorId: isPortkey ? AElfConnectorId.PORTKEY : AElfConnectorId.NIGHTELF,
      isPortkey,
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
      connectorId: AElfConnectorId.PORTKEY,
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
      connectorId: TONConnectorId.TON,
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

export function useEVMSwitchChain() {
  const web3 = useWeb3();
  const latestWeb3Ref = useLatestRef(web3);
  return useCallback(
    (chainId: ChainId) => {
      if (latestWeb3Ref.current.chainId === chainId) return;
      // Whether the switch is successful or not does not affect the link status
      const info = getNetworkInfo(chainId);
      if (!info) throw new Error('Invalid chainId');
      return switchChain(info.info, latestWeb3Ref.current.connector, true);
    },
    [latestWeb3Ref],
  );
}

export function useActiveAddresses() {
  // const { account: tonAccount } = useTon();
  const { account: aelfAccount } = useAElf();
  const { account: evmAccount } = useWeb3();
  return useMemo(() => {
    return [evmAccount, aelfAccount].filter(Boolean).join(',');
  }, [aelfAccount, evmAccount]);
}

export function useEVMConnectWallet() {
  const { connectAsync, connectors } = useConnect();

  return useCallback(
    async (connectorId: EVMConnectorId, chainId?: number) => {
      const connector = connectors.find((item) => item.id === connectorId);
      if (!connector) return;

      await connectAsync({ connector: connector, chainId });
    },
    [connectAsync, connectors],
  );
}
