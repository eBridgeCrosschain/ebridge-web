import clsx from 'clsx';
import CommonImage from 'components/CommonImage';
import { changeEnd, changeWallet } from 'contexts/useWallet/actions';
import { useWalletActions } from 'contexts/useWallet/hooks';
import { useThrottleCallback } from 'hooks';
import { bridgeIcon } from 'assets/images';
import styles from './styles.module.less';

export default function ChangeIcon({ className }: { className?: string }) {
  const { dispatch } = useWalletActions();
  const onChange = useThrottleCallback(() => {
    dispatch(changeWallet());
    dispatch(changeEnd());
  }, [dispatch, changeWallet]);

  return (
    <div className={clsx('flex-center', styles['change-body'], className)}>
      <CommonImage
        priority
        className={clsx('cursor-pointer', styles['change-icon'])}
        src={bridgeIcon}
        onClick={() => onChange()}
      />
    </div>
  );
}
