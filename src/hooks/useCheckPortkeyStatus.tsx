// import { useChain } from 'contexts/useChain';
// import { useModal } from 'contexts/useModal';
// import { usePortkeyReact } from 'contexts/usePortkey/provider';
// import { useCallback } from 'react';
// import { ChainId } from 'types';
// import { isSelectPortkey } from 'utils/portkey';
// import { basicModalView } from 'contexts/useModal/actions';

// export default function useCheckPortkeyStatus() {
//   const { getWalletManagerStatus } = usePortkeyReact();
//   const [{ selectELFWallet }] = useChain();
//   const [, { dispatch }] = useModal();

//   const checkPortkeyConnect = useCallback(
//     async (chainId: ChainId) => {
//       if (!isSelectPortkey(selectELFWallet)) {
//         return true;
//       }

//       const status = await getWalletManagerStatus(chainId);

//       if (!status) {
//         dispatch(
//           basicModalView.setPortketNotConnectModal({
//             visible: true,
//             chainId,
//           }),
//         );
//       }

//       return status;
//     },
//     [getWalletManagerStatus, dispatch, selectELFWallet],
//   );

//   return { checkPortkeyConnect };
// }
