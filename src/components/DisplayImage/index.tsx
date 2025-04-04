import styles from './styles.module.less';
import clsx from 'clsx';
import { useState } from 'react';
import CommonImage from 'components/CommonImage';

interface DisplayImageProps {
  name: string;
  src?: string;
  className?: string;
  defaultIconClassName?: string;
  width?: number;
  height?: number;
  alt?: string;
  isCircle?: boolean;
}

export default function DisplayImage({
  name,
  src,
  className,
  defaultIconClassName,
  width = 24,
  height = 24,
  alt,
  isCircle = true,
}: DisplayImageProps) {
  const [showIcon, setShowIcon] = useState<boolean>(true);

  return (
    <div
      className={clsx(styles['display-image'], isCircle && styles['display-image-circle'], className)}
      style={{ width, height }}>
      <div
        className={clsx('row-center', 'flex-shrink-0', styles['default-text'], defaultIconClassName)}
        style={{ width, height, lineHeight: height + 'px' }}>
        {name?.charAt(0)}
      </div>
      {showIcon && src && (
        <CommonImage
          className={styles['common-image']}
          loading="eager"
          src={src}
          alt={alt || `image-${name}`}
          style={{ width, height, zIndex: 2 }}
          onError={() => {
            setShowIcon(false);
          }}
        />
      )}
    </div>
  );
}
