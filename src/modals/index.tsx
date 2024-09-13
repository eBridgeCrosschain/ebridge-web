import dynamic from 'next/dynamic';
import WalletModal from './WalletModal';
import WalletsModal from './WalletsModal';
import PortkeyNotConnectModal from './PortkeyNotConnectModal';
const AccountModal = dynamic(import('./AccountModal'), { ssr: false });
export default function Modals() {
  return (
    <>
      <WalletModal />
      <WalletsModal />
      <AccountModal />
      <PortkeyNotConnectModal />
    </>
  );
}
