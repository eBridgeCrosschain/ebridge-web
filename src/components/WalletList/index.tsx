import { Button } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChain } from 'contexts/useChain';
import { useModal } from 'contexts/useModal';
import { setSelectERCWallet } from 'contexts/useChain/actions';
import IconFont from 'components/IconFont';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import { DEFAULT_ERC_CHAIN_INFO } from 'constants/index';
import { getNetworkInfo, switchChain } from 'utils/network';
import { sleep } from 'utils';
import { isPortkey, isPortkeyConnector } from 'utils/portkey';
import { isMobileDevices } from 'utils/isMobile';
import CommonMessage from 'components/CommonMessage';
import styles from './styles.module.less';
import { TelegramPlatform } from 'utils/telegram/telegram';
import { ChainType, EVMConnectorId, TWalletConnectorId } from 'types';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { useEVMConnectWallet, useTon } from 'hooks/web3';
import { usePrevious } from 'react-use';
export default function WalletList({ onFinish, chainType }: { onFinish?: () => void; chainType?: ChainType }) {
  const [{ walletWallet, walletChainType }] = useModal();
  const { chainId, connector: connectedConnector, connectorId, account } = walletWallet || {};
  const { open } = useTonConnectModal();
  const { isActive } = useTon();
  const prevIsActive = usePrevious(isActive);
  const onCancel = useCallback(() => {
    setLoading(undefined);
    onFinish?.();
  }, [onFinish]);
  useEffect(() => {
    if (chainType === 'TON' && prevIsActive === false && prevIsActive !== isActive) {
      onCancel();
    }
  }, [chainType, isActive, onCancel, prevIsActive]);
  const [loading, setLoading] = useState<any>();
  const [{ userERCChainId }, { dispatch: chainDispatch }] = useChain();
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

  const evmConnectWallet = useEVMConnectWallet();
  const tryActivation = useCallback(
    async (chainType: ChainType, connectorId: TWalletConnectorId, key: string) => {
      if (loading || chainType === 'ELF') return;

      setLoading({ [key]: true });
      try {
        if (chainType === 'TON') {
          // Case: chainType === 'TON'
          open();
        } else {
          // Case: chainType === 'ERC'
          if (connectorId === EVMConnectorId.WALLET_CONNECT) {
            document.getElementsByTagName('wcm-modal')?.[0]?.remove();
          }
          await evmConnectWallet(connectorId as EVMConnectorId, typeof chainId === 'number' ? chainId : undefined);
          chainDispatch(setSelectERCWallet(connectorId as EVMConnectorId));

          if (connectorId === EVMConnectorId.COINBASE_WALLET) {
            await sleep(500);
            await switchChain(DEFAULT_ERC_CHAIN_INFO as any, connectedConnector, true);
          } else if (userERCChainId) {
            try {
              // Whether the switch is successful or not does not affect the link status
              const info = getNetworkInfo(userERCChainId);
              if (info) await switchChain(info.info, connectedConnector, true);
            } catch (error) {
              console.debug(error, '====error');
            }
          }
          onCancel();
        }
      } catch (error: any) {
        console.debug(`connection error: ${error}`);
        CommonMessage.error(`connection error: ${error.message}`);
      }
      setLoading(undefined);
    },
    [chainDispatch, chainId, connectedConnector, evmConnectWallet, loading, onCancel, open, userERCChainId],
  );

  const walletList = useMemo(() => {
    const keys = Object.keys(SUPPORTED_WALLETS) as TWalletConnectorId[];

    return keys.filter((key) => {
      if (chainType) {
        return SUPPORTED_WALLETS[key].chainType === chainType;
      } else {
        const option = SUPPORTED_WALLETS[key];
        const isNotERCWallet = option.chainType !== 'ERC';
        const isStringChain = typeof chainId === 'string' || walletChainType === 'ELF';

        // Undisplayed metamask entrance in mobile and telegram(not browser)
        if ((TelegramPlatform.isTelegramPlatformAndNotWeb() || isMobileDevices()) && key === EVMConnectorId.METAMASK)
          return false;

        // Undisplayed coinbase entrance in telegram(not browser)
        if (TelegramPlatform.isTelegramPlatformAndNotWeb()) {
          if (option.connectorId === EVMConnectorId.COINBASE_WALLET) return false;
        }

        // Undisplayed coinbase entrance in Portkey App
        if (isPortkey()) {
          if (option.connectorId === EVMConnectorId.COINBASE_WALLET) return false;
          if (isStringChain) return isPortkeyConnector(option.connectorId);

          // EVM
          if (!isNotERCWallet) return !(option.connectorId === EVMConnectorId.METAMASK);
        }
        return isNotERCWallet ? isStringChain : !isStringChain;
      }
    });
  }, [chainId, chainType, walletChainType]);

  return (
    <div className={styles['wallet-list']}>
      {walletList.map((key) => {
        const option = SUPPORTED_WALLETS[key];
        const disabled = !!(account && option.connectorId && option.connectorId === connectorId);
        return (
          <Button
            disabled={disabled}
            loading={loading?.[option.name]}
            key={option.name}
            onClick={() => {
              tryActivation(option.chainType, option.connectorId, option.name);
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
