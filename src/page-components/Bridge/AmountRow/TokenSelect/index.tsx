import clsx from 'clsx';
import { ButtonProps } from 'antd';
import CommonImage from 'components/CommonImage';
import TokenLogo from 'components/TokenLogo';
import { formatSymbol } from 'utils/token';
import { ChainId } from 'types';
import { arrowIcon } from 'assets/images';
import styles from './styles.module.less';

export default function TokenSelect({
  title,
  chainId,
  symbol,
  onClick,
}: {
  title?: string;
  chainId?: ChainId;
  symbol?: string;
  onClick?: ButtonProps['onClick'];
}) {
  return (
    <div className={clsx('flex-row-center', 'cursor-pointer', styles['token-select'])} onClick={onClick}>
      <TokenLogo className={styles['token-img']} chainId={chainId} symbol={symbol} />
      <div className={clsx('flex-1', 'flex-row-center', 'flex-row-between', styles['token-title-row'])}>
        <div className={styles['token-title']}>{formatSymbol(title)}</div>
        <CommonImage className={styles['arrow-icon']} src={arrowIcon} />
      </div>
    </div>
  );
}
