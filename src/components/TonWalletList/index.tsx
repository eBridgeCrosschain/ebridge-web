import { Button } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useModal } from 'contexts/useModal';
import IconFont from 'components/IconFont';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import CommonMessage from 'components/CommonMessage';
import styles from './styles.module.less';
import { TelegramPlatform } from 'utils/telegram/telegram';
import { ChainType, TWalletConnectorId } from 'types';
import { useConnect } from 'hooks/useConnect';

export default function WalletList({ onFinish }: { onFinish?: () => void }) {
  const [{ walletWallet }] = useModal();
  const { connectorId, account, isActive } = walletWallet || {};
  const [loading, setLoading] = useState<any>();

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
          wcmModalRouterNodeShadowRoot?.setAttribute('style', 'height: 70vh; min-height: 400px; overflow-y: auto');
        }

        const wcmConnectWalletViewNode = wcmModalRouterNodeShadowRoot?.getElementsByTagName('wcm-connect-wallet-view');
        const wcmConnectWalletViewNodeShadowRoot = wcmConnectWalletViewNode?.[0]?.shadowRoot;
        const wcmDesktopWalletSelectionNode = wcmConnectWalletViewNodeShadowRoot?.querySelector(
          '#wcm-desktop-wallet-selection',
        );
        const wcmDesktopWalletSelectionNodeShadowRoot = wcmDesktopWalletSelectionNode?.shadowRoot;
        const wcmModalFooterNode = wcmDesktopWalletSelectionNodeShadowRoot?.querySelector('wcm-modal-footer');

        wcmModalFooterNode?.setAttribute('style', 'display: none;');

        // if (wcmModalRouterNodeShadowRoot && wcmModalFooterNode) {
        //   clearInterval(timerRef.current);
        //   timerRef.current = undefined;
        // }
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    };
  }, []);

  const connect = useConnect();
  const tryActivation = useCallback(
    async (chainType: ChainType, key: string) => {
      if (loading) return;
      setLoading({ [key]: true });
      try {
        // TODO ton await
        connect(chainType);

        // TODO ton check if connect need await
        onCancel();
      } catch (error: any) {
        console.debug(`connection error: ${error}`);
        CommonMessage.error(`connection error: ${error.message}`);
      }
      setLoading(undefined);
    },
    [connect, loading, onCancel],
  );

  const walletList = useMemo(() => {
    const keys = Object.keys(SUPPORTED_WALLETS) as TWalletConnectorId[];

    return keys.filter((key: TWalletConnectorId) => {
      const option = SUPPORTED_WALLETS[key];
      return option.chainType === 'TON';
    });
  }, []);

  return (
    <div className={styles['wallet-list']}>
      {walletList.map((key) => {
        const option = SUPPORTED_WALLETS[key];
        const disabled = !!(isActive && account && option.connectorId && option.connectorId === connectorId);

        return (
          <Button
            disabled={disabled}
            loading={loading?.[option.name]}
            key={option.name}
            onClick={() => {
              tryActivation(option.chainType, option.name);
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
