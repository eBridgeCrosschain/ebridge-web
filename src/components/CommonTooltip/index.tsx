import { Tooltip, TooltipProps } from 'antd';
import clsx from 'clsx';
import styles from './styles.module.less';

export default function CommonTooltip({ overlayClassName, ...props }: TooltipProps) {
  return <Tooltip {...props} overlayClassName={clsx(styles['common-tooltip-overlay'], overlayClassName)} />;
}
