import { useLanguage } from 'i18n';
import clsx from 'clsx';
import { Button, InputProps } from 'antd';
import styles from './styles.module.less';
import AmountInput from './AmountInput';
import { ReactNode } from 'react';

export type TCommonAmountRowProps = {
  onClickMAX?: () => void;
  showBalance?: boolean;
  leftHeaderTitle?: string;
  rightHeaderTitle?: string;
  leftHeaderEle?: ReactNode;
  rightInputEle?: ReactNode;
  rightHeaderEle?: ReactNode;
  value?: InputProps['value'];
  onAmountInputChange?: InputProps['onChange'];
  showError?: boolean;
};

export default function CommonAmountRow({
  onClickMAX,
  showBalance,
  leftHeaderTitle,
  rightHeaderTitle,
  leftHeaderEle,
  rightHeaderEle,
  rightInputEle,
  value,
  showError,
  onAmountInputChange,
}: TCommonAmountRowProps) {
  const { t } = useLanguage();

  return (
    <div className={clsx(styles['amount-row'], 'flex-column')}>
      <div className={clsx(styles['amount-label-wrap'], 'flex-row-between', 'flex-row-center')}>
        {leftHeaderEle ? leftHeaderEle : <span className={styles['amount-label']}>{leftHeaderTitle}</span>}
        {showBalance && (
          <div className={clsx(styles['balance-wrap'], 'flex-row-center')}>
            {rightHeaderEle ? rightHeaderEle : <span className={styles.balance}>{rightHeaderTitle}</span>}
            <Button className={styles['max-button']} type="link" onClick={onClickMAX}>
              {t('MAX')}
            </Button>
          </div>
        )}
      </div>
      <div className={clsx(styles['amount-input-wrap'], 'flex-row-center')}>
        <AmountInput
          className={clsx({ [styles['amount-input-red']]: showError })}
          value={value}
          onChange={onAmountInputChange}
        />
        {rightInputEle ? (
          <>
            <div className={styles.divider} />
            {rightInputEle}
          </>
        ) : null}
      </div>
    </div>
  );
}
