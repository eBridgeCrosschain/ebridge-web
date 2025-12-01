import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { Asset, PortkeyAssetProvider } from '@portkey/did-ui-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import assetsBackImg from './images/assetsBack.svg';
import styles from './styles.module.less';
import CommonImage from 'components/CommonImage';
import { ROUTE_PATHS } from 'constants/link';
import { useAElf } from 'hooks/web3';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { getPortkeyWebWalletInfo } from 'utils/portkey';
import { ChainId } from '@portkey/types';

export default function Assets() {
  const router = useRouter();
  const { connector } = useAElf();

  const { walletType } = useConnectWallet();

  const portkeyWebInfo = useMemo(() => {
    let chainId, pin;
    const sdkWalletInfoString = getPortkeyWebWalletInfo();
    if (sdkWalletInfoString) {
      chainId = sdkWalletInfoString.originChainId;
    }
    return {
      chainId,
      pin,
    };
  }, []);

  const handleDeleteAccount = useCallback(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    if (walletType !== WalletTypeEnum.web) {
      router.replace(ROUTE_PATHS.HOME);
    }
  }, [walletType, router]);

  const onOverviewBack = useCallback(() => {
    router.back();
  }, [router]);

  if (connector !== AelfWalletTypeEnum.web || !portkeyWebInfo?.pin || !portkeyWebInfo?.chainId) {
    return null;
  }

  return (
    <div className={styles['assets-page']}>
      <PortkeyAssetProvider
        originChainId={portkeyWebInfo?.chainId as ChainId}
        pin={portkeyWebInfo?.pin}
        isLoginOnChain={true}>
        <Asset
          backIcon={<CommonImage className={styles['assets-back-wrap']} src={assetsBackImg} alt="" />}
          onLifeCycleChange={(lifeCycle: any) => {
            console.log(lifeCycle, 'onLifeCycleChange');
          }}
          onOverviewBack={onOverviewBack}
          onDeleteAccount={handleDeleteAccount}
        />
      </PortkeyAssetProvider>
    </div>
  );
}
