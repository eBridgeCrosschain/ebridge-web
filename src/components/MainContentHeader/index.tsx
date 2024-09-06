import { useState } from 'react';
import clsx from 'clsx';
import { Tooltip } from 'antd';
import CommonImage from 'components/CommonImage';
import { infoCircleIcon } from 'assets/images';
import styles from './styles.module.less';

interface IMainContentHeaderProps {
  title: string;
  tipConfig?: {
    label: string;
  } & ({ content: React.ReactNode; onClick?: never } | { content?: never; onClick?: () => void });
}

export default function MainContentHeader({ title, tipConfig }: IMainContentHeaderProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleTipClick = () => {
    if (tipConfig?.onClick) {
      tipConfig.onClick();
    } else {
      setIsTooltipOpen(true);
    }
  };

  return (
    <div className={clsx(styles['main-content-header'], 'flex-row-center', 'flex-row-between')}>
      <div className={styles['header-title']}>{title}</div>
      {tipConfig && (
        <div className={clsx(styles['header-tip'], 'flex-row-center', 'cursor-pointer')} onClick={handleTipClick}>
          <Tooltip
            trigger="click"
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
