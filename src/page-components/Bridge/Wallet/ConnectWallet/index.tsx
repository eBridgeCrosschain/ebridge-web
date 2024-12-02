import clsx from 'clsx';
import { useLogin } from 'hooks/wallet';
import { Button } from 'antd';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { useLanguage } from 'i18n';
import { ChainType, Web3Type } from 'types';
import { setWalletModal } from 'contexts/useModal/actions';
import { shortenString } from 'utils';
import { isELFChain } from 'utils/aelfUtils';
import { formatAddress } from 'utils/chain';
import styles from './styles.module.less';
import { useTonConnectModal } from '@tonconnect/ui-react';

interface IConnectWalletProps {
  wallet?: Web3Type;
  chainType?: ChainType;
}

export default function ConnectWallet({ wallet, chainType }: IConnectWalletProps) {
  const { t } = useLanguage();
  const dispatch = useModalDispatch();
  const login = useLogin();

  const { open } = useTonConnectModal();

  const { walletType, chainId, account } = wallet || {};

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
        const isELF = chainType === 'ELF';
        const isTON = chainType === 'TON';
        if (isTON) {
          return open();
        }
        if (isELF) {
          return login();
        }
        dispatch(
          setWalletModal(true, {
            walletWalletType: walletType,
            walletChainType: chainType,
            walletChainId: chainId,
          }),
        );
      }}>
      {t('Connect')}
    </Button>
  );
}
