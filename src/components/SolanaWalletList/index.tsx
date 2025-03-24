import { Button } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useModal } from 'contexts/useModal';
import IconFont from 'components/IconFont';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import CommonMessage from 'components/CommonMessage';
import styles from './styles.module.less';
import { ChainType, TWalletConnectorId } from 'types';
import { useConnect } from 'hooks/useConnect';
import { handleErrorMessage } from 'utils/error';

export default function WalletList({ onFinish }: { onFinish?: () => void }) {
  const [{ walletWallet }] = useModal();
  const { connectorId, account, isActive } = walletWallet || {};
  const [loading, setLoading] = useState<any>();

  const onCancel = useCallback(() => {
    setLoading(undefined);
    onFinish?.();
  }, [onFinish]);

  const connect = useConnect();
  const tryActivation = useCallback(
    async (chainType: ChainType, key: string) => {
      if (loading) return;
      setLoading({ [key]: true });
      try {
        // TODO solana await
        connect(chainType);

        // TODO solana check if connect need await
        onCancel();
      } catch (error: any) {
        console.log(`connection error: ${error}`);
        // TODO solana error tip
        CommonMessage.error(`connection error: ${handleErrorMessage(error.message)}`);
      }
      setLoading(undefined);
    },
    [connect, loading, onCancel],
  );

  const walletList = useMemo(() => {
    const keys = Object.keys(SUPPORTED_WALLETS) as TWalletConnectorId[];

    return keys.filter((key: TWalletConnectorId) => {
      const option = SUPPORTED_WALLETS[key];
      return option.chainType === 'Solana';
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
