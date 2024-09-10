import { useMemo } from 'react';
import { useLanguage } from 'i18n';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { Button } from 'antd';
import AmountInput from './AmountInput';
import TokenSelect from './TokenSelect';
import { useHomeContext } from '../HomeContext';
import { setFrom, setSelectModal } from '../HomeContext/actions';
import { useWallet } from 'contexts/useWallet/hooks';
import { unitConverter } from 'utils/converter';
import { formatSymbol } from 'utils/token';
import { parseInputChange } from 'utils/input';
import { divDecimals } from 'utils/calculate';
import { isELFChain } from 'utils/aelfUtils';
import { SupportedChainId, SupportedELFChainId } from 'constants/chain';
import { ZERO } from 'constants/misc';
import styles from './styles.module.less';

export default function AmountRow() {
  const { t } = useLanguage();
  const [{ selectToken, fromInput, fromBalance, crossMin, crossFee }, { dispatch }] = useHomeContext();
  const { fromWallet, changing } = useWallet();
  const { token, show } = fromBalance || {};
  const { chainId, account } = fromWallet || {};

  const min = useMemo(() => divDecimals(1, token?.decimals), [token?.decimals]);
  const max = useMemo(() => {
    let value = ZERO;
    const isELF = isELFChain(chainId);
    if (!isELF || token?.symbol !== 'ELF') {
      value = ZERO.plus(show || '0');
    } else {
      value = BigNumber.max(
        ZERO.plus(show || '0')
          .minus(crossFee || '0')
          .minus(0.0041),
        0,
      );
    }
    return value;
  }, [chainId, crossFee, show, token?.symbol]);

  const showError = useMemo(
    () => fromInput && account && (max.lt(fromInput) || (crossMin && ZERO.plus(crossMin).gt(fromInput))),
    [account, crossMin, fromInput, max],
  );

  return (
    <div className={clsx(styles['amount-row'], 'flex-column')}>
      <div className={clsx(styles['amount-label-wrap'], 'flex-row-between', 'flex-row-center')}>
        <span className={styles['amount-label']}>{t('Amount')}</span>
        {account && (
          <div className={clsx(styles['balance-wrap'], 'flex-row-center')}>
            <span className={styles.balance}>
              {unitConverter(show)}{' '}
              {formatSymbol(selectToken && selectToken[chainId as SupportedChainId | SupportedELFChainId]?.symbol)}
            </span>
            <Button
              className={styles['max-button']}
              type="link"
              onClick={() => {
                dispatch(setFrom(parseInputChange(max.toFixed(), min, token?.decimals)));
              }}>
              {t('MAX')}
            </Button>
          </div>
        )}
      </div>
      <div className={clsx(styles['amount-input-wrap'], 'flex-row-center')}>
        <AmountInput
          className={clsx({ [styles['amount-input-red']]: !changing && showError })}
          value={fromInput}
          onChange={(e) => {
            dispatch(setFrom(parseInputChange(e.target.value, min, token?.decimals)));
          }}
        />
        <div className={styles.divider} />
        <TokenSelect
          title={selectToken && selectToken[chainId as SupportedChainId | SupportedELFChainId]?.symbol}
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
      </div>
    </div>
  );
}
