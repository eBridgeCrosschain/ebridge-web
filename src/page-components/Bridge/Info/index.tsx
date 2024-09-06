import clsx from 'clsx';
import { useLanguage } from 'i18n';
import { useWallet } from 'contexts/useWallet/hooks';
import { useHomeContext } from '../HomeContext';
import { formatSymbol } from 'utils/token';
import { sliceDecimals } from 'utils/input';
import styles from './styles.module.less';

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className={clsx(styles['info-row'], 'flex-row-center', 'flex-row-between')}>
      <div>{label}</div>
      <div>{value || '--'}</div>
    </div>
  );
}

export default function Info() {
  const { t } = useLanguage();
  const [{ crossFee, fromInput, toInput, selectToken }] = useHomeContext();
  const { isHomogeneous, toWallet } = useWallet();
  const { chainId } = toWallet || {};
  const token = chainId ? selectToken?.[chainId] : undefined;

  if (!fromInput) {
    return null;
  }

  return (
    <div className={clsx(styles.info, 'flex-column')}>
      <InfoRow
        label={t('You’ll receive')}
        value={`${sliceDecimals(toInput, token?.decimals ?? 6)} ${formatSymbol(token?.symbol)}`}
      />
      {!isHomogeneous && (
        <InfoRow label={t('Estimated transaction fee')} value={`${crossFee || '0'} ${formatSymbol('ELF')}`} />
      )}
      <InfoRow label={t('Expected time')} value={`~40 ${t('minutes')}`} />
    </div>
  );
}
