import { Col, Modal, ModalProps, Row } from 'antd';
import clsx from 'clsx';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import { ReactNode } from 'react';
import useMediaQueries from 'hooks/useMediaQueries'; // Cannot import useMobile
import { prefixCls } from 'constants/misc';
import CommonImage from 'components/CommonImage';
import { closeIcon } from 'assets/images';
import { TelegramPlatform } from 'utils/telegram/telegram';

export interface ICommonModalProps extends ModalProps {
  children?: any;
  className?: string;
  leftCallBack?: () => void;
  leftElement?: ReactNode;
  transitionName?: string;
  type?: 'pop-bottom' | 'default';
}

export default function CommonModal(props: ICommonModalProps) {
  const { leftCallBack, width, title, leftElement, transitionName, type } = props;
  const isMd = useMediaQueries('md');
  return (
    <Modal
      closeIcon={<CommonImage className={clsx('common-modal-close-icon', 'cursor-pointer')} src={closeIcon} />}
      maskClosable={false}
      centered={props.centered ? props.centered : !isMd}
      destroyOnClose
      footer={null}
      {...props}
      width={width ? width : '800px'}
      className={clsx(
        'common-modals',
        {
          'common-modal-center': isMd && props.centered,
          'common-bottom-modals': type === 'pop-bottom',
          'tg-common-modals': TelegramPlatform.isTelegramPlatform(),
          'tg-common-bottom-modals': type === 'pop-bottom' && TelegramPlatform.isTelegramPlatform(),
        },
        props.className,
      )}
      transitionName={transitionName ?? isMd ? `${prefixCls}-move-down` : undefined}
      title={
        <Row justify="space-between">
          {leftCallBack || leftElement ? (
            <Col className="common-modal-left-icon" flex={1} onClick={leftCallBack}>
              {leftElement || <LeftOutlined />}
            </Col>
          ) : null}
          <Col flex={2} style={{ textAlign: 'center' }}>
            {title}
          </Col>
          {leftCallBack || leftElement ? <Col flex={1} /> : null}
        </Row>
      }
    />
  );
}
