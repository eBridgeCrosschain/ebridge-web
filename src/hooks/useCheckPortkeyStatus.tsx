import { useChain } from 'contexts/useChain';
import { useModal } from 'contexts/useModal';
import { useCallback } from 'react';
import { ChainId } from 'types';
import { isSelectPortkey } from 'utils/portkey';
import { basicModalView } from 'contexts/useModal/actions';
import { useLoginWalletContext } from 'contexts/useLoginWallet/provider';

export default function useCheckPortkeyStatus() {
  const { getWalletManagerStatus } = useLoginWalletContext();
  const [{ selectELFWallet }] = useChain();
  const [, { dispatch }] = useModal();

  const checkPortkeyConnect = useCallback(
    async (chainId: ChainId) => {
      if (!isSelectPortkey(selectELFWallet)) {
        return true;
      }

      const status = await getWalletManagerStatus(chainId);
      console.log('getWalletManagerStatus', status);

      if (!status) {
        dispatch(
          basicModalView.setPortketNotConnectModal({
            visible: true,
            chainId,
          }),
        );
      }

      return status;
    },
    [dispatch, getWalletManagerStatus, selectELFWallet],
  );

  return { checkPortkeyConnect };
}
