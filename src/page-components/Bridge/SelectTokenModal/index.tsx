import { useMemo } from 'react';
import CommonSelectTokenModal from 'components/CommonSelectTokenModal';
import { useWallet } from 'contexts/useWallet/hooks';
import { useCurrentWhitelist } from 'hooks/whitelist';
import { useHomeContext } from '../HomeContext';
import { setSelectModal, setSelectToken, homeModalDestroy } from '../HomeContext/actions';
import { TBridgeChainId } from 'constants/chain';

export default function SelectTokenModal() {
  const [{ selectModal, selectToken }, { dispatch }] = useHomeContext();
  const { fromWallet, toWallet } = useWallet();
  const { chainId } = fromWallet || {};
  const { chainId: toChainId } = toWallet || {};
  const allWhitelist = useCurrentWhitelist();

  const tokenList = useMemo(() => {
    return allWhitelist.map((item) => ({
      ...item,
      displaySymbol: item[(selectModal?.type === 'from' ? chainId : toChainId) as TBridgeChainId]?.symbol,
    }));
  }, [allWhitelist, chainId, selectModal?.type, toChainId]);

  return (
    <CommonSelectTokenModal
      open={selectModal?.open}
      chainId={chainId}
      tokenList={tokenList}
      selectSymbol={selectToken?.symbol}
      onSelect={(item) => {
        dispatch(setSelectToken(item));
        dispatch(homeModalDestroy());
      }}
      onClose={() => dispatch(setSelectModal({ open: false }))}
    />
  );
}
