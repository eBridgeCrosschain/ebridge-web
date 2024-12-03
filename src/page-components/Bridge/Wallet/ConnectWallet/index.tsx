import clsx from 'clsx';
import { Button } from 'antd';
import { useLanguage } from 'i18n';
import { ChainType, Web3Type } from 'types';
import { shortenString } from 'utils';
import { isELFChain } from 'utils/aelfUtils';
import { formatAddress } from 'utils/chain';
import styles from './styles.module.less';
import { useConnect } from 'hooks/useConnect';

interface IConnectWalletProps {
  wallet?: Web3Type;
  chainType?: ChainType;
}

export default function ConnectWallet({ wallet, chainType }: IConnectWalletProps) {
  const { t } = useLanguage();
  const connect = useConnect();
  const { chainId, account } = wallet || {};

  return account ? (
    <div className={clsx(styles['wallet-address-wrap'], 'flex-row-center')}>
      <div className={styles.dot} />
      <div className={styles['wallet-address']}>
        {isELFChain(chainId) ? shortenString(formatAddress(chainId, account), 7, 8) : shortenString(account, 5, 3)}
      </div>
    </div>
  ) : (
    <Button
      className={styles['connect-button']}
      type="link"
      onClick={() => {
        connect(chainType, chainId);
      }}>
      {t('Connect')}
    </Button>
  );
}
