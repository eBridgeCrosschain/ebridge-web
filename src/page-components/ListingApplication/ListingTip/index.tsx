import { infoCircleIcon } from 'assets/images';
import CommonTooltipSwitchModal, { ICommonTooltipSwitchModalRef } from 'components/CommonTooltipSwitchModal';
import { useRef } from 'react';
import styles from './styles.module.less';
import CommonImage from 'components/CommonImage';

export default function ListingTip({ tip, title }: { tip: React.ReactNode; title?: string }) {
  const tooltipSwitchModalsRef = useRef<ICommonTooltipSwitchModalRef | null>(null);

  return (
    <CommonTooltipSwitchModal
      ref={(ref) => {
        tooltipSwitchModalsRef.current = ref;
      }}
      modalProps={{ title }}
      tip={tip}>
      <div className={styles['tip-title']} onClick={() => tooltipSwitchModalsRef.current?.open()}>
        <CommonImage className={styles['tip-title-icon']} src={infoCircleIcon} />
        <span className={styles['tip-title-text']}>{title}</span>
      </div>
    </CommonTooltipSwitchModal>
  );
}
