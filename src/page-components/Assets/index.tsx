import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { ExtraInfoForPortkeyAA } from 'types/wallet';
import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import assetsBackImg from './images/assetsBack.svg';
import styles from './styles.module.less';
import CommonImage from 'components/CommonImage';

export default function Assets() {
  const router = useRouter();
  const { walletType, walletInfo } = useConnectWallet();

  const portkeyAAInfo = useMemo(() => {
    return walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
  }, [walletInfo?.extraInfo]);

  const handleDeleteAccount = useCallback(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    if (walletType !== WalletTypeEnum.aa) {
      router.replace('/');
    }
  }, [walletType, router]);

  const onOverviewBack = useCallback(() => {
    router.back();
  }, [router]);

  if (
    walletType !== WalletTypeEnum.aa ||
    !portkeyAAInfo?.portkeyInfo?.pin ||
    !portkeyAAInfo?.portkeyInfo?.chainId ||
    !portkeyAAInfo?.portkeyInfo?.caInfo?.caHash
  ) {
    return null;
  }

  return (
    <div className={styles['assets-page']}>
      <PortkeyDid.PortkeyAssetProvider
        originChainId={portkeyAAInfo?.portkeyInfo.chainId}
        caHash={portkeyAAInfo?.portkeyInfo.caInfo.caHash}
        pin={portkeyAAInfo?.portkeyInfo.pin}>
        <PortkeyDid.Asset
          backIcon={<CommonImage className={styles['assets-back-wrap']} src={assetsBackImg} alt="" />}
          onLifeCycleChange={(lifeCycle) => {
            console.log(lifeCycle, 'onLifeCycleChange');
          }}
          onOverviewBack={onOverviewBack}
          onDeleteAccount={handleDeleteAccount}
        />
      </PortkeyDid.PortkeyAssetProvider>
    </div>
  );
}
