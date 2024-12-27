import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { APP_NAME } from 'constants/index';
import { useCallback, useRef, useState } from 'react';
import AElf from 'aelf-sdk';
import { zeroFill } from '@portkey/utils';
import { useAElf } from './web3';
import { AuthTokenSource, getAuthPlainText, getLocalJWT, QueryAuthApiExtraRequest } from 'utils/aelfAuthToken';
import { ExtraInfoForDiscover, WebLoginWalletInfo } from 'types/wallet';
import eBridgeEventBus from 'utils/eBridgeEventBus';
import { queryAuthApi } from 'utils/api/auth';
import { service } from 'api/utils';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet, useIsAelfLogin } from './wallet';
import { recoverPubKey } from 'utils/aelfUtils';
import { eBridgeInstance } from 'utils/eBridgeInstance';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useEffectOnce } from 'react-use';
import useGlobalLoading from 'hooks/useGlobalLoading';

export function useAelfAuthToken() {
  const { account } = useAElf();
  const { walletInfo, walletType, disConnectWallet, getSignature } = useConnectWallet();

  const isAelfLogin = useIsAelfLogin();
  const isAelfLoginRef = useRef(isAelfLogin);
  isAelfLoginRef.current = isAelfLogin;

  const loginWalletTypeRef = useRef(walletType);
  loginWalletTypeRef.current = walletType;

  const walletInfoRef = useRef(walletInfo);
  walletInfoRef.current = walletInfo;
  const { setGlobalLoading } = useGlobalLoading();

  const loginSuccessActive = useCallback(() => {
    console.log('%c login success and emit event', 'color: green');
    eBridgeEventBus.AelfLoginSuccess.emit();
  }, []);

  const handleSignMessage = useCallback(async () => {
    if (!account) return;
    const plainText = getAuthPlainText();
    const plainTextHex: any = plainText.plainTextHex;
    let signResult: {
      error: number;
      errorMessage: string;
      signature: string;
      from: string;
    } | null;

    if (loginWalletTypeRef.current === AelfWalletTypeEnum.discover) {
      // discover
      const discoverInfo = walletInfoRef.current?.extraInfo as ExtraInfoForDiscover;
      if ((discoverInfo?.provider as any).methodCheck('wallet_getManagerSignature')) {
        const sin = await discoverInfo?.provider?.request({
          method: 'wallet_getManagerSignature',
          payload: { hexData: plainTextHex },
        });
        const signInfo = [zeroFill(sin.r), zeroFill(sin.s), `0${sin.recoveryParam.toString()}`].join('');
        signResult = {
          error: 0,
          errorMessage: '',
          signature: signInfo,
          from: AelfWalletTypeEnum.discover,
        };
      } else {
        const signInfo = AElf.utils.sha256(plainTextHex);
        signResult = await getSignature({
          appName: APP_NAME,
          address: account,
          signInfo,
        });
      }
    } else if (loginWalletTypeRef.current === AelfWalletTypeEnum.elf) {
      // nightElf
      const signInfo = AElf.utils.sha256(plainTextHex);
      signResult = await getSignature({
        appName: APP_NAME,
        address: account,
        signInfo,
      });
    } else {
      // portkey sdk
      const signInfo = Buffer.from(plainTextHex).toString('hex');
      signResult = await getSignature({
        appName: APP_NAME,
        address: account,
        signInfo,
      });
    }

    if (signResult?.error) throw signResult.errorMessage;

    return { signature: signResult?.signature || '', plainText: plainTextHex };
  }, [account, getSignature]);

  const queryAuth = useCallback(
    async (isThrowError: boolean, isAfterErrorDisconnect: boolean): Promise<string | undefined> => {
      if (!isAelfLoginRef.current || !loginWalletTypeRef.current) return;
      if (eBridgeInstance.obtainingSignature) return;
      try {
        // Mark: only one signature process can be performed at the same time
        eBridgeInstance.setObtainingSignature(true);
        setGlobalLoading(true);
        const { caHash, originChainId } = await getCaHashAndOriginChainIdByWallet(
          walletInfoRef.current as WebLoginWalletInfo,
          loginWalletTypeRef.current,
        );
        const signatureResult = await handleSignMessage();
        if (!signatureResult) throw Error('Signature error');
        const pubkey = recoverPubKey(signatureResult.plainText, signatureResult.signature) + '';
        const managerAddress = await getManagerAddressByWallet(
          walletInfoRef.current as WebLoginWalletInfo,
          loginWalletTypeRef.current,
          pubkey,
        );
        const apiParams: QueryAuthApiExtraRequest = {
          pubkey,
          signature: signatureResult.signature,
          plain_text: signatureResult.plainText,
          source:
            loginWalletTypeRef.current === AelfWalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey,
          managerAddress: managerAddress,
          ca_hash: caHash || undefined,
          chain_id: originChainId || undefined,
        };

        const authToken = await queryAuthApi(apiParams);
        eBridgeInstance.setUnauthorized(false);
        console.log('login status isAelfLoginRef.current', isAelfLoginRef.current);
        loginSuccessActive();
        return authToken;
      } catch (error: any) {
        console.log('queryAuthApi error', error);
        if (isThrowError) throw error;
        if (isAfterErrorDisconnect) await disConnectWallet();

        return;
      } finally {
        eBridgeInstance.setUnauthorized(false);
        eBridgeInstance.setObtainingSignature(false);
      }
    },
    [setGlobalLoading, handleSignMessage, loginSuccessActive, disConnectWallet],
  );

  const getAuth = useCallback(
    async (isThrowError: boolean, isAfterErrorDisconnect: boolean): Promise<string | undefined> => {
      if (!isAelfLoginRef.current || !loginWalletTypeRef.current) return;
      if (eBridgeInstance.obtainingSignature) return;
      try {
        const { caHash } = await getCaHashAndOriginChainIdByWallet(
          walletInfoRef.current as WebLoginWalletInfo,
          loginWalletTypeRef.current,
        );
        const managerAddress = await getManagerAddressByWallet(
          walletInfoRef.current as WebLoginWalletInfo,
          loginWalletTypeRef.current,
        );
        const source =
          loginWalletTypeRef.current === AelfWalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
        const key = (caHash || source) + managerAddress;
        const data = getLocalJWT(key);
        // 1: local storage has JWT token
        if (data) {
          const token_type = data.token_type;
          const access_token = data.access_token;

          service.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`;
          loginSuccessActive();
          return `${token_type} ${access_token}`;
        } else {
          // 2: local storage don not has JWT token
          return await queryAuth(isThrowError, isAfterErrorDisconnect);
        }
      } catch (error) {
        console.log('getAuth error:', error);
        if (isThrowError) throw error;
        return;
      }
    },
    [loginSuccessActive, queryAuth],
  );

  return { getAuth, queryAuth, loginSuccessActive };
}

export function useSetAelfAuthFromStorage() {
  const { loginWalletType } = useAElf();
  const { walletInfo } = useConnectWallet();
  const walletInfoRef = useRef(walletInfo);
  walletInfoRef.current = walletInfo;

  return useCallback(async () => {
    if (!walletInfoRef.current || loginWalletType === AelfWalletTypeEnum.unknown || !loginWalletType) return false;

    const { caHash } = await getCaHashAndOriginChainIdByWallet(
      walletInfoRef.current as WebLoginWalletInfo,
      loginWalletType,
    );
    const managerAddress = await getManagerAddressByWallet(
      walletInfoRef.current as WebLoginWalletInfo,
      loginWalletType,
    );
    const source = loginWalletType === AelfWalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
    const key = (caHash || source) + managerAddress;
    const data = getLocalJWT(key);
    // local storage has JWT token
    if (data) {
      const token_type = data.token_type;
      const access_token = data.access_token;
      service.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`;
      return true;
    }

    return false;
  }, [loginWalletType]);
}

export function useShowLoginButtonLoading() {
  const { isConnected, walletInfo } = useConnectWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const walletInfoRef = useRef(walletInfo);
  walletInfoRef.current = walletInfo;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopLoading = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setLoading(false);
      timerRef.current = null;
    }, 3000);
  }, []);

  useEffectOnce(() => {
    if (isConnected && !walletInfoRef.current) {
      stopLoading();
    } else {
      setLoading(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  });

  return loading;
}
