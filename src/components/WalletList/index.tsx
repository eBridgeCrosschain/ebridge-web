import { Button } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Connector } from '@web3-react/types';
import { useChain } from 'contexts/useChain';
import { useModal } from 'contexts/useModal';
import { setSelectERCWallet } from 'contexts/useChain/actions';
import IconFont from 'components/IconFont';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import { getConnection } from 'walletConnectors/utils';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';

import { DEFAULT_ERC_CHAIN_INFO } from 'constants/index';
import { getNetworkInfo, switchChain } from 'utils/network';
import { sleep } from 'utils';
import { isPortkey, isPortkeyConnector } from 'utils/portkey';
import { isMobileDevices } from 'utils/isMobile';
import { MetaMask } from '@web3-react/metamask';
import CommonMessage from 'components/CommonMessage';
import styles from './styles.module.less';
import { TelegramPlatform } from 'utils/telegram/telegram';
export default function WalletList({ onFinish }: { onFinish?: () => void }) {
  const [{ walletWallet, walletChainType }] = useModal();
  const { chainId, connector: connectedConnector, account } = walletWallet || {};
  const [loading, setLoading] = useState<any>();
  const [{ userERCChainId }, { dispatch: chainDispatch }] = useChain();
  const onCancel = useCallback(() => {
    setLoading(undefined);
    onFinish?.();
  }, [onFinish]);
  const timerRef = useRef<NodeJS.Timer | number>();
  useEffect(() => {
    if (TelegramPlatform.isTelegramPlatform()) {
      timerRef.current = setInterval(() => {
        const wcmModalNode = document.getElementsByTagName('wcm-modal');
        const idIsWcmModalElement = wcmModalNode?.[0]?.shadowRoot?.querySelector('#wcm-modal');
        const wcmModalRouterNode = idIsWcmModalElement?.getElementsByTagName('wcm-modal-router');
        const wcmModalRouterNodeShadowRoot = wcmModalRouterNode?.[0]?.shadowRoot?.querySelector('.wcm-content');
        if (TelegramPlatform.isTelegramPlatformWeb() || TelegramPlatform.isTelegramPlatformDesktop()) {
          wcmModalRouterNodeShadowRoot?.setAttribute('style', 'height: 500px; overflow-y: auto');
        }

        const wcmConnectWalletViewNode = wcmModalRouterNodeShadowRoot?.getElementsByTagName('wcm-connect-wallet-view');
        const wcmConnectWalletViewNodeShadowRoot = wcmConnectWalletViewNode?.[0]?.shadowRoot;
        const wcmDesktopWalletSelectionNode = wcmConnectWalletViewNodeShadowRoot?.querySelector(
          '#wcm-desktop-wallet-selection',
        );
        const wcmDesktopWalletSelectionNodeShadowRoot = wcmDesktopWalletSelectionNode?.shadowRoot;
        const wcmModalFooterNode = wcmDesktopWalletSelectionNodeShadowRoot?.querySelector('wcm-modal-footer');

        wcmModalFooterNode?.setAttribute('style', 'display: none;');

        if (wcmModalRouterNodeShadowRoot && wcmModalFooterNode) {
          clearInterval(timerRef.current);
          timerRef.current = undefined;
        }
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    };
  }, []);

  const tryActivation = useCallback(
    async (connector: Connector | string, key: string) => {
      if (loading || typeof connector === 'string') return;
      setLoading({ [key]: true });
      try {
        try {
          delete (connector as any).eagerConnection;
        } catch (error) {
          // fix network error
        }
        await connector.activate();
        chainDispatch(setSelectERCWallet(getConnection(connector)?.type));
        if (connector instanceof CoinbaseWallet) {
          await sleep(500);
          await switchChain(DEFAULT_ERC_CHAIN_INFO as any, connector, true);
        } else if (userERCChainId) {
          try {
            // Whether the switch is successful or not does not affect the link status
            const info = getNetworkInfo(userERCChainId);
            if (info) await switchChain(info.info, connector, true);
          } catch (error) {
            console.debug(error, '====error');
          }
        }
        onCancel();
      } catch (error: any) {
        console.debug(`connection error: ${error}`);
        CommonMessage.error(`connection error: ${error.message}`);
      }
      setLoading(undefined);
    },
    [chainDispatch, loading, onCancel, userERCChainId],
  );

  const walletList = useMemo(
    () =>
      Object.keys(SUPPORTED_WALLETS).filter((key) => {
        const option = SUPPORTED_WALLETS[key];
        const isStringConnector = typeof option.connector === 'string';
        const isStringChain = typeof chainId === 'string' || walletChainType === 'ELF';
        if ((TelegramPlatform.isTelegramPlatformAndNotWeb() || isMobileDevices()) && key === 'METAMASK') return false;
        if (TelegramPlatform.isTelegramPlatformAndNotWeb()) {
          if (option.connector instanceof CoinbaseWallet) return false;
        }
        if (isPortkey()) {
          if (option.connector instanceof CoinbaseWallet) return false;
          if (isStringChain) return isPortkeyConnector(option.connector as string);
          if (!isStringConnector) return !(option.connector instanceof MetaMask);
        }
        return isStringConnector ? isStringChain : !isStringChain;
      }),
    [chainId, walletChainType],
  );

  return (
    <div className={styles['wallet-list']}>
      {walletList.map((key) => {
        const option = SUPPORTED_WALLETS[key];
        const disabled = !!(account && option.connector && option.connector === connectedConnector);
        return (
          <Button
            disabled={disabled}
            loading={loading?.[option.name]}
            key={option.name}
            onClick={() => {
              tryActivation(option.connector, option.name);
            }}>
            <IconFont className={styles['wallet-icon']} type={option.iconType} />
            <div>
              {option.name}
              {disabled && ' (Connected)'}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
