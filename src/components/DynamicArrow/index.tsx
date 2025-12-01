import { useMemo } from 'react';
import clsx from 'clsx';
import CommonImage from 'components/CommonImage';
import { downBigIcon, downIcon, downSmallIcon } from 'assets/images';
import styles from './styles.module.less';

export type TDynamicArrowSize = 'Big' | 'Normal' | 'Small';

type TDynamicArrow = {
  className?: string;
  iconClassName?: string;
  isExpand?: boolean;
  size?: TDynamicArrowSize;
};

export default function DynamicArrow({ className, iconClassName, isExpand = false, size = 'Normal' }: TDynamicArrow) {
  const arrowIcon = useMemo(() => {
    if (size === 'Big') {
      return downBigIcon;
    }
    if (size === 'Small') {
      return downSmallIcon;
    }
    return downIcon;
  }, [size]);

  return (
    <span
      className={clsx(
        'flex-center',
        styles['dynamic-arrow'],
        {
          [styles['dynamic-arrow-big']]: size === 'Big',
          [styles['dynamic-arrow-small']]: size === 'Small',
        },
        className,
      )}>
      <CommonImage
        className={clsx(styles['dynamic-arrow-icon'], isExpand && styles['dynamic-arrow-icon-rotate'], iconClassName)}
        src={arrowIcon}
      />
    </span>
  );
}
