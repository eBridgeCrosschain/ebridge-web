import { infoCircleIcon } from 'assets/images';
import CommonTooltipSwitchModal, { ICommonTooltipSwitchModalRef } from 'components/CommonTooltipSwitchModal';
import { useRef } from 'react';
import styles from './styles.module.less';
import CommonImage from 'components/CommonImage';

export default function ListingTip({
  tip,
  title,
  modalTitle,
  customChildren,
}: {
  tip: React.ReactNode;
  title?: string;
  modalTitle?: string;
  customChildren?: React.ReactNode;
}) {
  const tooltipSwitchModalsRef = useRef<ICommonTooltipSwitchModalRef | null>(null);

  return (
    <CommonTooltipSwitchModal
      ref={(ref) => {
        tooltipSwitchModalsRef.current = ref;
      }}
      tooltipProps={{ overlayClassName: styles['tip-tooltip'] }}
      modalProps={{ title: modalTitle || title, zIndex: 1001 }}
      modalWidth={377}
      tip={tip}>
      {customChildren ? (
        <div onClick={() => tooltipSwitchModalsRef.current?.open()}>{customChildren}</div>
      ) : (
        <div className={styles['tip-title']} onClick={() => tooltipSwitchModalsRef.current?.open()}>
          <CommonImage className={styles['tip-title-icon']} src={infoCircleIcon} />
          <span className={styles['tip-title-text']}>{title}</span>
        </div>
      )}
    </CommonTooltipSwitchModal>
  );
}
