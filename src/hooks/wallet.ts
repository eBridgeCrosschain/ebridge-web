import { WalletTypeEnum as AelfWalletTypeEnum, TChainId } from '@aelf-web-login/wallet-adapter-base';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { ChainId, MethodsWallet } from '@portkey/provider-types';
import { GetCAHolderByManagerParams } from '@portkey/services';
import CommonMessage from 'components/CommonMessage';
import { MAIN_SIDE_CHAIN_ID } from 'constants/index';
import { useChainDispatch } from 'contexts/useChain';
import { setSelectELFWallet, setSelectERCWallet } from 'contexts/useChain/actions';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ExtraInfoForDiscover, ExtraInfoForPortkeyAA, TAelfAccounts, WebLoginWalletInfo } from 'types/wallet';
import { sleep } from 'utils';
import { handleWebLoginErrorMessage } from 'utils/error';
import { clearWCStorageByDisconnect } from 'utils/localStorage';
import { useAelfAuthToken } from './aelfAuthToken';
import { AuthTokenSource, removeOneLocalJWT } from 'utils/aelfAuthToken';
import eBridgeEventBus from 'utils/eBridgeEventBus';
import { pubKeyToAddress } from 'utils/aelfUtils';
import { eBridgeInstance } from 'utils/eBridgeInstance';

export function useInitWallet() {
  const chainDispatch = useChainDispatch();
  const { connectWallet, walletType } = useConnectWallet();
  const connectWalletRef = useRef(connectWallet);
  connectWalletRef.current = connectWallet;
  const isLogin = useIsAelfLogin();

  const init = useCallback(async () => {
    if (walletType === AelfWalletTypeEnum.elf) {
      chainDispatch(setSelectELFWallet('NIGHTELF'));
    } else if (walletType === AelfWalletTypeEnum.aa || walletType === AelfWalletTypeEnum.discover) {
      chainDispatch(setSelectELFWallet('PORTKEY'));
    } else if (walletType === AelfWalletTypeEnum.unknown) {
      chainDispatch(setSelectELFWallet(undefined));
    }
  }, [chainDispatch, walletType]);

  const onLogoutClearData = useCallback(async () => {
    chainDispatch(setSelectERCWallet(undefined));
    clearWCStorageByDisconnect();
    // await sleep(500);
    // connectWalletRef.current();
  }, [chainDispatch]);

  useEffect(() => {
    if (!isLogin) {
      if (localStorage.getItem('connectedWallet') !== AelfWalletTypeEnum.aa) {
        onLogoutClearData();
      }
    } else {
      init();
    }
  }, [init, isLogin, onLogoutClearData, walletType]);
}

export function useAelfAuthListener() {
  // const { setLoading } = useLoading(); // TODO
  const { isConnected, walletInfo, walletType } = useConnectWallet();

  const { queryAuth } = useAelfAuthToken();

  const onAuthorizationExpired = useCallback(async () => {
    if (!isConnected) {
      console.warn('AuthorizationExpired: Not Logined');
      eBridgeInstance.setUnauthorized(false);
      return;
    } else if (isConnected && walletInfo) {
      const { caHash } = await getCaHashAndOriginChainIdByWallet(walletInfo as WebLoginWalletInfo, walletType);
      const managerAddress = await getManagerAddressByWallet(walletInfo as WebLoginWalletInfo, walletType);
      const source = walletType === AelfWalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
      const key = (caHash || source) + managerAddress;
      removeOneLocalJWT(key);

      console.log('AuthorizationExpired');
      eBridgeInstance.setUnauthorized(true);
      await queryAuth(false, true);
    } else {
      eBridgeInstance.setUnauthorized(false);
    }
    // setLoading(false);
  }, [isConnected, queryAuth, walletInfo, walletType]);
  const onAuthorizationExpiredRef = useRef(onAuthorizationExpired);
  onAuthorizationExpiredRef.current = onAuthorizationExpired;

  useEffect(() => {
    const { remove } = eBridgeEventBus.Unauthorized.addListener(() => {
      console.log('Unauthorized listener', eBridgeInstance.unauthorized);
      if (eBridgeInstance.unauthorized) return;
      eBridgeInstance.setUnauthorized(true);
      onAuthorizationExpiredRef.current?.();
    });
    return () => {
      remove();
    };
  }, []);
}

export function useIsAelfLogin() {
  const { isConnected, walletInfo } = useConnectWallet();
  return useMemo(() => isConnected && !!walletInfo, [isConnected, walletInfo]);
}

export function useAelfLogin() {
  const { connectWallet } = useConnectWallet();
  const isLogin = useIsAelfLogin();

  const { getAuth } = useAelfAuthToken();
  const getAuthRef = useRef(getAuth);
  getAuthRef.current = getAuth;

  return useCallback(
    async (isNeedGetJWT = false, handleConnectedCallback?: () => Promise<void> | void) => {
      if (isLogin) {
        if (isNeedGetJWT) {
          await getAuthRef.current(true, false);
        }
        await handleConnectedCallback?.();
        return;
      }

      try {
        await connectWallet();
        if (isNeedGetJWT) {
          await getAuthRef.current(true, false);
        }
        await handleConnectedCallback?.();
      } catch (error) {
        CommonMessage.error(handleWebLoginErrorMessage(error));
      }
    },
    [connectWallet, isLogin],
  );
}

export function useGetAccount() {
  const { walletInfo } = useConnectWallet();
  const isLogin = useIsAelfLogin();

  // WebLoginWalletInfo TAelfAccounts ExtraInfoForDiscover | ExtraInfoForPortkeyAA | ExtraInfoForNightElf;
  return useMemo(() => {
    if (!isLogin) return undefined;

    const accounts: TAelfAccounts = {
      [MAIN_SIDE_CHAIN_ID.mainChain]: 'ELF_' + walletInfo?.address + '_' + MAIN_SIDE_CHAIN_ID.mainChain,
      [MAIN_SIDE_CHAIN_ID.sideChain]: 'ELF_' + walletInfo?.address + '_' + MAIN_SIDE_CHAIN_ID.sideChain,
    };

    return accounts;
  }, [isLogin, walletInfo]);
}

export function useAelfLogout() {
  const chainDispatch = useChainDispatch();
  const { disConnectWallet, connectWallet } = useConnectWallet();

  return useCallback(async () => {
    Promise.resolve(disConnectWallet()).then(async () => {
      console.log('onLogout');

      chainDispatch(setSelectERCWallet(undefined));
      clearWCStorageByDisconnect();
      await sleep(500);
      connectWallet();
    });
  }, [chainDispatch, connectWallet, disConnectWallet]);
}

export function useGetWalletManagerStatus() {
  const { walletType, walletInfo } = useConnectWallet();

  return useCallback(
    async (chainId: ChainId) => {
      if (walletType === AelfWalletTypeEnum.elf) return true;
      if (walletType === AelfWalletTypeEnum.discover) {
        const discoverInfo = walletInfo?.extraInfo as ExtraInfoForDiscover;
        const provider = discoverInfo.provider;
        if (!provider) {
          return false;
        }
        return provider.request({
          method: MethodsWallet.GET_WALLET_MANAGER_SYNC_STATUS,
          payload: { chainId },
        });
      }
      // portkey sdk
      const portkeyAAInfo = walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
      return PortkeyDid.did.checkManagerIsExist({
        chainId,
        caHash: portkeyAAInfo.portkeyInfo?.caInfo?.caHash || '',
        managementAddress: portkeyAAInfo.portkeyInfo?.walletInfo?.address || '',
      });
    },
    [walletInfo?.extraInfo, walletType],
  );
}

export const getManagerAddressByWallet = async (
  walletInfo: WebLoginWalletInfo,
  walletType: AelfWalletTypeEnum,
  pubkey?: string,
): Promise<string> => {
  if (walletType === AelfWalletTypeEnum.unknown) return '';

  let managerAddress;
  if (walletType === AelfWalletTypeEnum.discover) {
    const discoverInfo = walletInfo?.extraInfo as ExtraInfoForDiscover;
    managerAddress = await discoverInfo?.provider?.request({
      method: 'wallet_getCurrentManagerAddress',
    });
  } else if (walletType === AelfWalletTypeEnum.aa) {
    const portkeyAAInfo = walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
    managerAddress = portkeyAAInfo.portkeyInfo.walletInfo.address;
  } else {
    // AelfWalletTypeEnum.elf
    managerAddress = walletInfo.address;
  }

  if (!managerAddress && pubkey) {
    managerAddress = pubKeyToAddress(pubkey);
  }

  return managerAddress || '';
};

export const getCaHashAndOriginChainIdByWallet = async (
  walletInfo: WebLoginWalletInfo,
  walletType: AelfWalletTypeEnum,
): Promise<{ caHash: string; originChainId: TChainId }> => {
  if (walletType === AelfWalletTypeEnum.unknown)
    return {
      caHash: '',
      originChainId: MAIN_SIDE_CHAIN_ID.sideChain,
    };

  let caHash, originChainId;
  if (walletType === AelfWalletTypeEnum.discover) {
    const res = await PortkeyDid.did.services.getHolderInfoByManager({
      caAddresses: [walletInfo?.address],
    } as unknown as GetCAHolderByManagerParams);
    const caInfo = res[0];
    caHash = caInfo?.caHash;
    originChainId = caInfo?.chainId as TChainId;
  } else if (walletType === AelfWalletTypeEnum.aa) {
    const portkeyAAInfo = walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
    caHash = portkeyAAInfo.portkeyInfo.caInfo.caHash;
    originChainId = portkeyAAInfo.portkeyInfo.chainId;
  }

  return {
    caHash: caHash || '',
    originChainId: originChainId || MAIN_SIDE_CHAIN_ID.sideChain,
  };
};
