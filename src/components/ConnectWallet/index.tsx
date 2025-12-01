import clsx from 'clsx';
import { Button } from 'antd';
import { useLanguage } from 'i18n';
import { ChainType, Web3Type } from 'types';
import { shortenString } from 'utils';
import { isELFChain } from 'utils/aelfUtils';
import { formatAddress } from 'utils/chain';
import styles from './styles.module.less';
import { useConnect } from 'hooks/useConnect';
import { TBridgeChainId } from 'constants/chain';

interface IConnectWalletProps {
  wallet?: Web3Type;
  chainType?: ChainType;
  chainId?: TBridgeChainId;
  account?: string;
  buttonText?: string;
}

export default function ConnectWallet({ wallet, chainType, chainId, account, buttonText }: IConnectWalletProps) {
  const { t } = useLanguage();
  const connect = useConnect();
  const { chainId: walletChainId, account: walletAccount } = wallet || {};
  const currentChainId = chainId || walletChainId;
  const currentAccount = account || walletAccount;

  return currentAccount ? (
    <div className={clsx(styles['wallet-address-wrap'], 'flex-row-center')}>
      <div className={styles.dot} />
      <div className={styles['wallet-address']}>
        {isELFChain(currentChainId)
          ? shortenString(formatAddress(currentChainId, currentAccount), 7, 8)
          : shortenString(currentAccount, 5, 3)}
      </div>
    </div>
  ) : (
    <Button
      className={styles['connect-button']}
      type="link"
      onClick={() => {
        connect(chainType, currentChainId);
      }}>
      {buttonText || t('Connect')}
    </Button>
  );
}
