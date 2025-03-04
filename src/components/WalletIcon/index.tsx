import clsx from 'clsx';
import IconFont from 'components/IconFont';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import React, { useCallback, useMemo } from 'react';
import { EVMConnectorId, TWalletConnectorId } from 'types';
import styles from './styles.module.less';
import { TelegramPlatform } from 'utils/telegram/telegram';

export default function WalletIcon({
  connectorId,
  className,
  type,
}: {
  connectorId?: TWalletConnectorId;
  className?: string;
  type?: string;
}) {
  const filter = useCallback(
    (k: TWalletConnectorId) => {
      const isTelegramPlatformAndNotWeb = TelegramPlatform.isTelegramPlatformAndNotWeb();
      if (
        isTelegramPlatformAndNotWeb &&
        SUPPORTED_WALLETS[k].connectorId === EVMConnectorId.COINBASE_WALLET &&
        isTelegramPlatformAndNotWeb
      ) {
        return false;
      }

      return SUPPORTED_WALLETS[k].connectorId === connectorId;
    },
    [connectorId],
  );
  const iconType = useMemo(() => {
    const keys: TWalletConnectorId[] = Object.keys(SUPPORTED_WALLETS) as TWalletConnectorId[];
    return keys.filter((k) => filter(k)).map((k) => SUPPORTED_WALLETS[k].iconType)[0];
  }, [filter]);
  return <IconFont className={clsx(styles.icon, className)} type={type || iconType} />;
}
