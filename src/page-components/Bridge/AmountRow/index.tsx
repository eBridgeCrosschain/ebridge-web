import { useMemo } from 'react';
import { useLanguage } from 'i18n';
import TokenSelect from './TokenSelect';
import { useHomeContext } from '../HomeContext';
import { setFrom, setSelectModal } from '../HomeContext/actions';
import { useWallet } from 'contexts/useWallet/hooks';
import { unitConverter } from 'utils/converter';
import { formatSymbol } from 'utils/token';
import { getMaxAmount, parseInputChange } from 'utils/input';
import { divDecimals } from 'utils/calculate';
import { TBridgeChainId } from 'constants/chain';
import { ZERO } from 'constants/misc';
import CommonAmountRow from 'components/CommonAmountRow';

export default function AmountRow() {
  const { t } = useLanguage();
  const [{ selectToken, fromInput, fromBalance, crossMin, crossFee }, { dispatch }] = useHomeContext();
  const { fromWallet, changing } = useWallet();
  const { token, show } = fromBalance || {};
  const { chainId, account } = fromWallet || {};

  const min = useMemo(() => divDecimals(1, token?.decimals), [token?.decimals]);
  const max = getMaxAmount({ chainId, symbol: token?.symbol, balance: show, crossFee });

  const showError = useMemo(
    () => fromInput && account && (max.lt(fromInput) || (crossMin && ZERO.plus(crossMin).gt(fromInput))),
    [account, crossMin, fromInput, max],
  );

  return (
    <>
      <CommonAmountRow
        showBalance={!!account}
        showError={!!(!changing && showError)}
        value={fromInput}
        onClickMAX={() => dispatch(setFrom(parseInputChange(max.toFixed(), min, token?.decimals)))}
        onAmountInputChange={(e) => dispatch(setFrom(parseInputChange(e.target.value, min, token?.decimals)))}
        leftHeaderEle={t('Amount')}
        rightHeaderTitle={`${unitConverter(show)} ${formatSymbol(
          selectToken && selectToken[chainId as TBridgeChainId]?.symbol,
        )}`}
        rightInputEle={
          <TokenSelect
            title={selectToken && selectToken[chainId as TBridgeChainId]?.symbol}
            symbol={selectToken?.symbol}
            chainId={chainId}
            onClick={() =>
              dispatch(
                setSelectModal({
                  open: true,
                  type: 'to',
                }),
              )
            }
          />
        }
      />
    </>
  );
}
