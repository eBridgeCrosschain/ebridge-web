import { useMemo, useState, useImperativeHandle, forwardRef, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { TooltipProps } from 'antd';
import CommonTooltip from 'components/CommonTooltip';
import CommonModal, { ICommonModalProps } from 'components/CommonModal';
import { GOT_IT } from 'constants/misc';
import styles from './styles.module.less';
import { closeIcon } from 'assets/images';
import CommonImage from 'components/CommonImage';
import useMediaQueries from 'hooks/useMediaQueries';

export interface ICommonTooltipSwitchModalRef {
  open: () => void;
}

interface ICommonTooltipSwitchModalProps {
  tooltipProps?: Pick<TooltipProps, 'className'>;
  modalProps?: Pick<ICommonModalProps, 'className' | 'title'>;
  modalWidth?: number;
  tip: React.ReactNode;
  children: React.ReactNode;
  modalFooterClassName?: string; // TODO
}

const CommonTooltipSwitchModal = forwardRef<ICommonTooltipSwitchModalRef, ICommonTooltipSwitchModalProps>(
  ({ tooltipProps, modalProps, modalWidth = 335, tip, children }, ref) => {
    const isMd = useMediaQueries('md');

    const isTooltip = useMemo(() => !isMd, [isMd]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleModalOpen = useCallback(() => {
      if (!isTooltip) {
        setIsModalOpen(true);
      }
    }, [isTooltip]);

    const handleModalClose = useCallback(() => {
      setIsModalOpen(false);
    }, []);

    useImperativeHandle(ref, () => ({
      open: handleModalOpen,
    }));

    useEffect(() => {
      if (!isMd) {
        handleModalClose();
      }
    }, [handleModalClose, isMd]);

    return (
      <>
        <CommonTooltip {...tooltipProps} placement="top" title={isTooltip && tip}>
          {children}
        </CommonTooltip>
        <CommonModal
          {...modalProps}
          className={clsx(styles['common-tooltip-switch-modal'], modalProps?.className)}
          // footerClassName={clsx(styles['common-tooltip-switch-modal-footer'], modalFooterClassName)}
          width={modalWidth}
          closeIcon={<CommonImage src={closeIcon} />}
          // hideCancelButton
          okText={GOT_IT}
          open={isModalOpen}
          onOk={handleModalClose}
          onCancel={handleModalClose}>
          <div>{tip}</div>
        </CommonModal>
      </>
    );
  },
);

CommonTooltipSwitchModal.displayName = 'CommonTooltipSwitchModal';

export default CommonTooltipSwitchModal;
