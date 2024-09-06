import clsx from 'clsx';
import ConnectWallet from './ConnectWallet';
import NetworkSelect from './NetworkSelect';
import { useWallet } from 'contexts/useWallet/hooks';
import { useWalletContext } from 'contexts/useWallet';
import styles from './styles.module.less';

export default function Wallet({ className, isFrom = false }: { className?: string; isFrom?: boolean }) {
  const [{ fromOptions, toOptions }] = useWalletContext();
  const { fromWallet, toWallet } = useWallet();

  const wallet = isFrom ? fromWallet : toWallet;
  const chainType = isFrom ? fromOptions?.chainType : toOptions?.chainType;

  return (
    <div className={clsx(styles.wallet, 'flex-column', className)}>
      <div className={clsx(styles['wallet-label'], 'flex-row-center', 'flex-row-between')}>
        <span className={styles['wallet-label-text']}>{isFrom ? 'From' : 'To'}</span>
        <ConnectWallet wallet={wallet} chainType={chainType} />
      </div>
      <NetworkSelect isFrom={isFrom} wallet={wallet} />
    </div>
  );
}
