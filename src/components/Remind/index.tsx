import clsx from 'clsx';
import styles from './styles.module.less';
import CommonImage from 'components/CommonImage';
import { errorFilledIcon, infoCircleFillIcon } from 'assets/images';

export enum RemindType {
  BRAND = 'brand',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

const ICON_SRC = {
  [RemindType.BRAND]: infoCircleFillIcon,
  [RemindType.INFO]: infoCircleFillIcon,
  [RemindType.WARNING]: infoCircleFillIcon,
  [RemindType.ERROR]: errorFilledIcon,
};

export default function Remind({
  className,
  iconClassName,
  isShowIcon = true,
  isCard = true,
  isBorder = true,
  type = RemindType.BRAND,
  children,
}: {
  className?: string;
  iconClassName?: string;
  isShowIcon?: boolean;
  isCard?: boolean;
  isBorder?: boolean;
  type?: RemindType;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        isCard ? styles['remind-card'] : styles['remind-text'],
        isBorder && styles['remind-border'],
        styles[`remind-${type}`],
        className,
      )}>
      {isShowIcon && (
        <CommonImage className={clsx('flex-shrink-0', styles['icon'], iconClassName)} src={ICON_SRC[type]} />
      )}
      <div className={styles['text']}>{children}</div>
    </div>
  );
}
