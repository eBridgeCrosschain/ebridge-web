import clsx from 'clsx';
import { useLanguage } from 'i18n';
import { useWallet } from 'contexts/useWallet/hooks';
import { useHomeContext } from '../HomeContext';
import { formatSymbol } from 'utils/token';
import { sliceDecimals } from 'utils/input';
import styles from './styles.module.less';
import { useCheckTxnFeeEnoughAuto } from 'hooks/checkTxnFee';

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
  const { isHomogeneous, toWallet } = useWallet();
  const { chainId } = toWallet || {};
  const token = chainId ? selectToken?.[chainId] : undefined;

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
      <InfoRow label={t('Expected time')} value={`~40 ${t('minutes')}`} />
    </div>
  );
}
