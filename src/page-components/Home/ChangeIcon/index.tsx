import clsx from 'clsx';
import CommonImage from 'components/CommonImage';
import { changeEnd, changeWallet } from 'contexts/useWallet/actions';
import { useWalletActions } from 'contexts/useWallet/hooks';
import useDebounceCallback from 'hooks/useDebounceCallback';
import Change from 'assets/images/change.svg';
import styles from './styles.module.less';
export default function ChangeIcon() {
  const { dispatch } = useWalletActions();
  const onChange = useDebounceCallback(() => {
    dispatch(changeWallet());
    setTimeout(() => {
      dispatch(changeEnd());
    }, 0);
  }, [dispatch, changeWallet]);
  return (
    <div className={clsx('flex-center', styles['change-body'])}>
      <CommonImage
        priority
        className={clsx('cursor-pointer', styles['change-icon'])}
        src={Change}
        onClick={() => onChange()}
      />
    </div>
  );
}
