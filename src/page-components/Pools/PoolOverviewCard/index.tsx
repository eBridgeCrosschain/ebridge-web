import { Tooltip } from 'antd';
import CommonImage from 'components/CommonImage';
import styles from '../styles.module.less';
import { questionFilledIcon } from 'assets/images';
import clsx from 'clsx';
import { useLanguage } from 'i18n';

export type TPoolOverviewCardProps = {
  title: string;
  tooltipTitle: string;
  data?: string;
};

export default function PoolOverviewCard({ title, tooltipTitle, data }: TPoolOverviewCardProps) {
  const { t } = useLanguage();
  return (
    <div className={styles['page-overview-card']}>
      <div className={clsx('flex-row-center', styles['page-overview-title-row'])}>
        {t(title)}&nbsp;
        <Tooltip trigger="hover" placement="topLeft" arrowPointAtCenter title={t(tooltipTitle)}>
          <CommonImage priority className={styles['question-icon']} src={questionFilledIcon} />
        </Tooltip>
      </div>
      <div className={styles['page-overview-data']}>{data ? t(data) : ''}</div>
    </div>
  );
}
