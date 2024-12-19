import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { APP_NAME } from 'constants/index';
import { useCallback } from 'react';
import AElf from 'aelf-sdk';
import { zeroFill } from '@portkey/utils';
import { useAElf } from './web3';
import { AuthTokenSource, getAuthPlainText, getLocalJWT, QueryAuthApiExtraRequest } from 'utils/aelfAuthToken';
import { ExtraInfoForDiscover, WebLoginWalletInfo } from 'types/wallet';
import eBridgeEventBus from 'utils/eBridgeEventBus';
import { queryAuthApi } from 'utils/api/auth';
import { service } from 'api/utils';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from './wallet';
import { recoverPubKey } from 'utils/aelfUtils';
import { eBridgeInstance } from 'utils/eBridgeInstance';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export function useAelfAuthToken() {
  const { account, isActive, loginWalletType } = useAElf();
  const { walletInfo, disConnectWallet, getSignature } = useConnectWallet();
  // const { setLoading } = useLoading(); // TODO

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

    if (loginWalletType === AelfWalletTypeEnum.discover) {
      // discover
      const discoverInfo = walletInfo?.extraInfo as ExtraInfoForDiscover;
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
    } else if (loginWalletType === AelfWalletTypeEnum.elf) {
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
  }, [account, getSignature, loginWalletType, walletInfo?.extraInfo]);

  const queryAuth = useCallback(
    async (isThrowError: boolean, isAfterErrorDisconnect: boolean): Promise<string | undefined> => {
      if (!isActive || !loginWalletType) return;
      if (eBridgeInstance.obtainingSignature) return;
      try {
        // Mark: only one signature process can be performed at the same time
        eBridgeInstance.setObtainingSignature(true);
        const { caHash, originChainId } = await getCaHashAndOriginChainIdByWallet(
          walletInfo as WebLoginWalletInfo,
          loginWalletType,
        );
        const signatureResult = await handleSignMessage();
        if (!signatureResult) throw Error('Signature error');
        const pubkey = recoverPubKey(signatureResult.plainText, signatureResult.signature) + '';
        const managerAddress = await getManagerAddressByWallet(
          walletInfo as WebLoginWalletInfo,
          loginWalletType,
          pubkey,
        );
        const apiParams: QueryAuthApiExtraRequest = {
          pubkey,
          signature: signatureResult.signature,
          plain_text: signatureResult.plainText,
          source: loginWalletType === AelfWalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey,
          managerAddress: managerAddress,
          ca_hash: caHash || undefined,
          chain_id: originChainId || undefined,
        };

        const authToken = await queryAuthApi(apiParams);
        eBridgeInstance.setUnauthorized(false);
        console.log('login status isActive', isActive);
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
    [isActive, walletInfo, loginWalletType, handleSignMessage, loginSuccessActive, disConnectWallet],
  );

  const getAuth = useCallback(
    async (isThrowError: boolean, isAfterErrorDisconnect: boolean): Promise<string | undefined> => {
      if (!isActive || !loginWalletType) return;
      if (eBridgeInstance.obtainingSignature) return;
      try {
        const { caHash } = await getCaHashAndOriginChainIdByWallet(walletInfo as WebLoginWalletInfo, loginWalletType);
        const managerAddress = await getManagerAddressByWallet(walletInfo as WebLoginWalletInfo, loginWalletType);
        const source = loginWalletType === AelfWalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
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
    [isActive, loginSuccessActive, loginWalletType, queryAuth, walletInfo],
  );

  return { getAuth, queryAuth, loginSuccessActive };
}

export function useSetAelfAuthFromStorage() {
  const { loginWalletType } = useAElf();
  const { walletInfo } = useConnectWallet();

  return useCallback(async () => {
    if (!walletInfo || loginWalletType === AelfWalletTypeEnum.unknown || !loginWalletType) return false;

    const { caHash } = await getCaHashAndOriginChainIdByWallet(walletInfo as WebLoginWalletInfo, loginWalletType);
    const managerAddress = await getManagerAddressByWallet(walletInfo as WebLoginWalletInfo, loginWalletType);
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
  }, [loginWalletType, walletInfo]);
}
