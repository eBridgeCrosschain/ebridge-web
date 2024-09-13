import CommonModal from '../../components/CommonModal';
import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import clsx from 'clsx';
import AccountCard from './AccountCard';

function AccountModal() {
  const [{ accountModal }, { dispatch }] = useModal();
  return (
    <CommonModal
      open={accountModal}
      title="Account"
      width="auto"
      className={clsx('modals', 'account-modal')}
      onCancel={() => dispatch(basicModalView.setAccountModal(false))}>
      <AccountCard />
    </CommonModal>
  );
}

export default AccountModal;
