import { useLoginWalletContext } from 'contexts/useLoginWallet/provider';
import { PortkeyDid, PortkeyDidV1 } from 'aelf-web-login';
import { WEB_LOGIN_CONFIG } from 'constants/index';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import assetsBackImg from './images/assetsBack.svg';
import styles from './styles.module.less';
import CommonImage from 'components/CommonImage';
import { useEffectOnce } from 'react-use';

export default function Assets() {
  const { wallet, version, isActive } = useLoginWalletContext();

  const router = useRouter();

  const onOverviewBack = useCallback(() => {
    router.back();
  }, [router]);

  useEffectOnce(() => {
    if (!isActive) router.replace('/');
  });

  if (!isActive) return null;

  if (version === 'v1')
    return (
      <div className={styles['assets-page']}>
        <PortkeyDidV1.PortkeyAssetProvider
          pin={wallet?.portkeyInfo?.pin || ''}
          caHash={wallet?.portkeyInfo?.caInfo.caHash}
          originChainId={wallet?.portkeyInfo?.chainId || (WEB_LOGIN_CONFIG.chainId as any)}>
          <PortkeyDidV1.Asset
            className={styles['portkey-v1-assets']}
            backIcon={<CommonImage className={styles['assets-back-wrap']} src={assetsBackImg} alt="" />}
            onLifeCycleChange={(lifeCycle) => {
              console.log(lifeCycle, 'onLifeCycleChange');
            }}
            onOverviewBack={onOverviewBack}
          />
        </PortkeyDidV1.PortkeyAssetProvider>
      </div>
    );

  return (
    <div className={styles['assets-page']}>
      <PortkeyDid.PortkeyAssetProvider
        pin={wallet?.portkeyInfo?.pin || ''}
        caHash={wallet?.portkeyInfo?.caInfo.caHash}
        originChainId={wallet?.portkeyInfo?.chainId || (WEB_LOGIN_CONFIG.chainId as any)}>
        <PortkeyDid.Asset
          backIcon={<CommonImage className={styles['assets-back-wrap']} src={assetsBackImg} alt="" />}
          onLifeCycleChange={(lifeCycle) => {
            console.log(lifeCycle, 'onLifeCycleChange');
          }}
          onOverviewBack={onOverviewBack}
        />
      </PortkeyDid.PortkeyAssetProvider>
    </div>
  );
}
