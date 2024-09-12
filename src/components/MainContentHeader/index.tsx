import { useState } from 'react';
import clsx from 'clsx';
import { Tooltip } from 'antd';
import CommonImage from 'components/CommonImage';
import { infoCircleIcon } from 'assets/images';
import { isMobileDevices } from 'utils/isMobile';
import styles from './styles.module.less';

interface IMainContentHeaderProps {
  className?: string;
  wrap?: boolean;
  title: string;
  tipConfig?: {
    label: string;
  } & ({ content: React.ReactNode; onClick?: never } | { content?: never; onClick?: () => void });
}

export default function MainContentHeader({ className, wrap, title, tipConfig }: IMainContentHeaderProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const isMobile = isMobileDevices();

  const handleTipClick = () => {
    if (tipConfig?.onClick) {
      tipConfig.onClick();
    } else if (isMobile) {
      setIsTooltipOpen(true);
    }
  };

  const handleMouseEnter = () => {
    if (!tipConfig?.onClick) {
      setIsTooltipOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!tipConfig?.onClick) {
      setIsTooltipOpen(false);
    }
  };

  return (
    <div
      className={clsx(
        styles['main-content-header'],
        wrap ? styles['main-content-header-wrap'] : styles['main-content-header-nowrap'],
        className,
      )}>
      <div className={styles['header-title']}>{title}</div>
      {tipConfig && (
        <div
          className={clsx(styles['header-tip'], 'flex-row-center', 'cursor-pointer')}
          onClick={handleTipClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          <Tooltip
            trigger="hover"
            placement="topLeft"
            arrowPointAtCenter
            title={tipConfig.content}
            open={isTooltipOpen}
            onOpenChange={(open) => setIsTooltipOpen(open)}>
            <CommonImage className={styles['info-icon']} src={infoCircleIcon} />
          </Tooltip>
          <span>{tipConfig.label}</span>
        </div>
      )}
    </div>
  );
}
