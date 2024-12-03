import Network from 'components/Network';
import { NetworkList } from 'constants/index';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { setFromWallet, setToWallet } from 'contexts/useWallet/actions';
import { useWalletActions } from 'contexts/useWallet/hooks';
import { usePortkey, useWeb3 } from 'hooks/web3';
import { memo, useCallback, useMemo } from 'react';
import { NetworkType, Web3Type } from 'types';
import { isELFChain } from 'utils/aelfUtils';
import { switchChain } from 'utils/network';
import { useChain } from 'contexts/useChain';
import { isSelectPortkey } from 'utils/portkey';
import { Accounts, ChainId } from '@portkey/provider-types';
import CommonMessage from 'components/CommonMessage';
import { useHomeContext } from '../../HomeContext';
import { IS_ONLY_SIDE_CHAIN_LIST } from 'constants/misc';
import { SupportedELFChainId } from 'constants/chain';
import { isTonChain } from 'utils';

function NetworkSelect({ wallet, isFrom }: { wallet?: Web3Type; isFrom?: boolean }) {
  const { dispatch } = useWalletActions();
  const { connector: web3Connector, chainId: web3ChainId, account: web3Account } = useWeb3();
  const [{ selectToken }] = useHomeContext();

  const { chainId, connector } = wallet || {};
  const portkeyWallet = usePortkey();
  const [{ selectELFWallet }] = useChain();
  const modalDispatch = useModalDispatch();

  const onChange = useCallback(
    async (info: NetworkType['info']) => {
      const _wallet = portkeyWallet;
      const selectPortkey = isSelectPortkey(selectELFWallet);
      if (selectPortkey && _wallet?.isActive && isELFChain(info.chainId)) {
        const accounts = (_wallet as { accounts: Accounts }).accounts;

        if (!accounts?.[info.chainId as ChainId]) {
          modalDispatch(
            basicModalView.setPortketNotConnectModal({
              visible: true,
              chainId: info.chainId,
            }),
          );
          return;
        }
      }
      const setWallet = isFrom ? setFromWallet : setToWallet;
      if (typeof info.chainId === 'string') {
        dispatch(
          setWallet({ chainType: 'ELF', chainId: info.chainId, isPortkey: selectPortkey && portkeyWallet.isActive }),
        );
      } else {
        if (isTonChain(info.chainId)) {
          dispatch(setWallet({ chainType: 'TON' }));
        } else {
          dispatch(setWallet({ chainType: 'ERC' }));
          try {
            await switchChain(info, !isELFChain(info.chainId) ? web3Connector : connector, !!web3Account, web3ChainId);
          } catch (error: any) {
            CommonMessage.error(error.message);
          }
        }
      }
    },
    [
      connector,
      dispatch,
      isFrom,
      modalDispatch,
      portkeyWallet,
      selectELFWallet,
      web3Account,
      web3ChainId,
      web3Connector,
    ],
  );

  const networkList = useMemo(() => {
    let _list = NetworkList.filter((item) => !isELFChain(item.info.chainId));
    const selectPortkey = isSelectPortkey(selectELFWallet) && portkeyWallet.isActive;
    if (!selectPortkey || isELFChain(wallet?.chainId)) {
      _list = NetworkList;
    } else if (isELFChain(chainId)) {
      _list = NetworkList.filter((item) => isELFChain(item.info.chainId));
    }
    const isOnlySideChain = IS_ONLY_SIDE_CHAIN_LIST.includes(selectToken?.symbol || '');
    return _list.filter((i) => (isOnlySideChain ? i.info.chainId !== SupportedELFChainId.AELF : true));
  }, [chainId, portkeyWallet.isActive, selectELFWallet, selectToken, wallet?.chainId]);

  console.log(networkList, chainId, '====networkList');

  return <Network chainId={chainId} networkList={networkList} onChange={onChange} />;
}

export default memo(NetworkSelect);
