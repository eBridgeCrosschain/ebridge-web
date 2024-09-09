import { Button } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { Connector } from '@web3-react/types';
import { useChainDispatch } from 'contexts/useChain';
import { useModal } from 'contexts/useModal';
import { setSelectERCWallet } from 'contexts/useChain/actions';
import IconFont from 'components/IconFont';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import { getConnection } from 'walletConnectors/utils';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';

import { DEFAULT_ERC_CHAIN_INFO } from 'constants/index';
import { switchChain } from 'utils/network';
import { sleep } from 'utils';
import { isPortkey, isPortkeyConnector } from 'utils/portkey';
import { MetaMask } from '@web3-react/metamask';
import CommonMessage from 'components/CommonMessage';
import styles from './styles.module.less';
export default function WalletList({ onFinish }: { onFinish?: () => void }) {
  const [{ walletWallet, walletChainType }] = useModal();
  const { chainId, connector: connectedConnector, account } = walletWallet || {};
  const [loading, setLoading] = useState<any>();
  const chainDispatch = useChainDispatch();
  const onCancel = useCallback(() => {
    setLoading(undefined);
    onFinish?.();
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
        }
        onCancel();
      } catch (error: any) {
        console.debug(`connection error: ${error}`);
        CommonMessage.error(`connection error: ${error.message}`);
      }
      setLoading(undefined);
    },
    [chainDispatch, loading, onCancel],
  );

  const walletList = useMemo(
    () =>
      Object.keys(SUPPORTED_WALLETS).filter((key) => {
        const option = SUPPORTED_WALLETS[key];
        const isStringConnector = typeof option.connector === 'string';
        const isStringChain = typeof chainId === 'string' || walletChainType === 'ELF';
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
            <div>{option.name}</div>
          </Button>
        );
      })}
    </div>
  );
}