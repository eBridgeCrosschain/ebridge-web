import { ButtonProps } from 'antd';
import clsx from 'clsx';
import CommonButton from 'components/CommonButton';
import CommonPopover from 'components/CommonPopover';
import IconFont from 'components/IconFont';
import TokenLogo from 'components/TokenLogo';
import { useWallet } from 'contexts/useWallet/hooks';
import { useLanguage } from 'i18n';
import { Trans } from 'react-i18next';
import { ChainId } from 'types';
import styles from './styles.module.less';
import { useHomeContext } from '../HomeContext';
import { formatSymbol } from 'utils/token';
export function Content() {
  return (
    <div className={clsx(styles['popover-content'])}>
      <p>
        {' '}
        <Trans>Tips</Trans>
      </p>
      <p>
        {' '}
        1. <Trans>Connect the recipient wallet</Trans>
      </p>
      <p>
        {' '}
        2. <Trans>Select a Receipt ID2</Trans>
      </p>
      <p>
        {' '}
        3. <Trans>Click the button to receive the token(s) transferred</Trans>
      </p>
    </div>
  );
}
export function FromHeader() {
  const [{ crossFee }] = useHomeContext();
  const { isHomogeneous } = useWallet();
  return (
    <div className={clsx('flex-row-between', styles['title-row'])}>
      <div className="font-family-medium">
        <Trans>From</Trans>
      </div>
      {isHomogeneous || !crossFee ? null : (
        <div className={clsx(styles['fee-tip'])}>
          <Trans tOptions={{ fee: `${crossFee || 0} ${formatSymbol('ELF')}` }}>Estimated transaction fee</Trans>
        </div>
      )}
    </div>
  );
}
export function ToHeader() {
  const { t } = useLanguage();
  return (
    <div className={clsx('flex-row-between', styles['title-row'])}>
      <div className="font-family-medium">{t('To')}</div>
      <div className={clsx(styles['a-tip'])}>
        <CommonPopover className="cursor-pointer" content={<Content />} placement="topRight">
          {t('Token not received?')}
        </CommonPopover>
      </div>
    </div>
  );
}

export function SelectButton({
  onClick,
  title,
  chainId,
  symbol,
}: {
  onClick?: ButtonProps['onClick'];
  title?: string;
  chainId?: ChainId;
  symbol?: string;
}) {
  return (
    <CommonButton onClick={onClick} type="select" className={clsx('flex-row-center', styles['select-token-btn'])}>
      <TokenLogo className={styles['select-token-img']} chainId={chainId} symbol={symbol} />
      <div className={clsx('flex-1', 'flex-row-center', 'flex-row-between', styles['token-title-row'])}>
        <div className={styles['token-title']}>{formatSymbol(title)}</div>
        <div>
          <IconFont type="Search" />
        </div>
      </div>
    </CommonButton>
  );
}
