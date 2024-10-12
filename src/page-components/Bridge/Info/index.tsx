import clsx from 'clsx';
import { useLanguage } from 'i18n';
import { useWallet } from 'contexts/useWallet/hooks';
import { useHomeContext } from '../HomeContext';
import { formatSymbol } from 'utils/token';
import { sliceDecimals } from 'utils/input';
import styles from './styles.module.less';
import { useCheckTxnFeeEnoughAuto } from 'hooks/checkTxnFee';
import { getCrossChainTime } from 'utils/time';
import { useMemo } from 'react';

function InfoRow({ label, value, valueClassName }: { label: string; value?: string; valueClassName?: string }) {
  return (
    <div className={clsx(styles['info-row'], 'flex-row-center', 'flex-row-between')}>
      <div>{label}</div>
      <div className={valueClassName}>{value || '--'}</div>
    </div>
  );
}

export default function Info() {
  const { t } = useLanguage();
  const [{ crossFee, fromInput, toInput, selectToken }] = useHomeContext();
  const { isHomogeneous, toWallet, fromWallet } = useWallet();
  const { chainId: toChainId } = toWallet || {};
  const { chainId: fromChainId } = fromWallet || {};
  const token = toChainId ? selectToken?.[toChainId] : undefined;

  const time = useMemo(() => getCrossChainTime(fromChainId, toChainId), [toChainId, fromChainId]);

  const isShowTxnFeeEnoughTip = useCheckTxnFeeEnoughAuto();

  if (!fromInput) {
    return null;
  }

  return (
    <div className={clsx(styles.info, 'flex-column')}>
      <InfoRow
        label={t("You'll receive")}
        value={`${sliceDecimals(toInput, token?.decimals ?? 6)} ${formatSymbol(token?.symbol)}`}
      />
      {isHomogeneous || !crossFee ? null : (
        <InfoRow
          label={t('Estimated transaction fee')}
          value={`${crossFee} ${formatSymbol('ELF')}`}
          valueClassName={isShowTxnFeeEnoughTip ? styles['error-display'] : ''}
        />
      )}
      <InfoRow label={t('Expected time')} value={`~${time} ${t('minutes')}`} />
    </div>
  );
}
