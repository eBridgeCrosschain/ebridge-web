import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { ChainId, MethodsWallet } from '@portkey/provider-types';
import CommonMessage from 'components/CommonMessage';
import { MAIN_SIDE_CHAIN_ID } from 'constants/index';
import { useChainDispatch } from 'contexts/useChain';
import { setSelectELFWallet, setSelectERCWallet } from 'contexts/useChain/actions';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ExtraInfoForDiscover, ExtraInfoForPortkeyAA, TAelfAccounts } from 'types/wallet';
import { sleep } from 'utils';
import { handleWebLoginErrorMessage } from 'utils/error';
import { clearWCStorageByDisconnect } from 'utils/localStorage';

export function useInitWallet() {
  const chainDispatch = useChainDispatch();
  const { connectWallet, walletType } = useConnectWallet();
  const connectWalletRef = useRef(connectWallet);
  connectWalletRef.current = connectWallet;
  const isLogin = useIsAelfLogin();

  const init = useCallback(async () => {
    if (walletType === WalletTypeEnum.elf) {
      chainDispatch(setSelectELFWallet('NIGHTELF'));
    } else if (walletType === WalletTypeEnum.aa || walletType === WalletTypeEnum.discover) {
      chainDispatch(setSelectELFWallet('PORTKEY'));
    } else if (walletType === WalletTypeEnum.unknown) {
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
      if (localStorage.getItem('connectedWallet') !== WalletTypeEnum.aa) {
        onLogoutClearData();
      }
    } else {
      init();
    }
  }, [init, isLogin, onLogoutClearData, walletType]);
}

export function useIsAelfLogin() {
  const { isConnected, walletInfo } = useConnectWallet();
  return useMemo(() => isConnected && !!walletInfo, [isConnected, walletInfo]);
}

export function useAelfLogin() {
  const { connectWallet } = useConnectWallet();
  const isLogin = useIsAelfLogin();

  return useCallback(async () => {
    if (isLogin) return;

    try {
      await connectWallet();
    } catch (error) {
      CommonMessage.error(handleWebLoginErrorMessage(error));
    }
  }, [connectWallet, isLogin]);
}

export function useGetAccount() {
  const { walletInfo } = useConnectWallet();
  const isLogin = useIsAelfLogin();

  // WalletInfo TAelfAccounts ExtraInfoForDiscover | ExtraInfoForPortkeyAA | ExtraInfoForNightElf;
  return useMemo(() => {
    if (!isLogin) return undefined;

    const accounts: TAelfAccounts = {
      [MAIN_SIDE_CHAIN_ID.mainChain]: 'ELF_' + walletInfo?.address + '_' + MAIN_SIDE_CHAIN_ID.mainChain,
      [MAIN_SIDE_CHAIN_ID.sideChain]: 'ELF_' + walletInfo?.address + '_' + MAIN_SIDE_CHAIN_ID.sideChain,
    };

    return accounts;
  }, [isLogin, walletInfo]);
}

export function useLogout() {
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
      if (walletType === WalletTypeEnum.elf) return true;
      if (walletType === WalletTypeEnum.discover) {
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
