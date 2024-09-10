import { useLanguage } from 'i18n';
import { useModal } from 'contexts/useModal';
import { setWalletModal } from 'contexts/useModal/actions';
import CommonModal from '../../components/CommonModal';
import WalletList from '../../components/WalletList';
export default function WalletModal() {
  const { t } = useLanguage();
  const [{ walletModal }, { dispatch }] = useModal();
  const handleCloseModal = () => dispatch(setWalletModal(false));
  return (
    <CommonModal
      width="auto"
      visible={walletModal}
      title={t('Select your wallet')}
      onCancel={handleCloseModal}
      className="modals">
      <WalletList onFinish={handleCloseModal} />
    </CommonModal>
  );
}
