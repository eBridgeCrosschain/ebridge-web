import CommonImage from 'components/CommonImage';
import styles from '../styles.module.less';
import { questionFilledIcon } from 'assets/images';
import clsx from 'clsx';
import { useLanguage } from 'i18n';
import CommonTooltipSwitchModal from 'components/CommonTooltipSwitchModal';

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
        {t(title)}
        <CommonTooltipSwitchModal modalProps={{ title: t(title) }} autoOpen tip={t(tooltipTitle)}>
          <CommonImage priority className={styles['question-icon']} src={questionFilledIcon} />
        </CommonTooltipSwitchModal>
      </div>
      <div className={clsx(styles['page-overview-data'], 'font-family-medium')}>{data ? t(data) : ''}</div>
    </div>
  );
}
