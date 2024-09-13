import { useMemo } from 'react';
import { Col, Row, Button } from 'antd';
import CommonModal from 'components/CommonModal';
import { useLanguage } from 'i18n';
import { useHomeContext } from '../../HomeContext';
import useMediaQueries from 'hooks/useMediaQueries';
import { getNameByChainId, getIconByChainId } from 'utils/chain';
import { useWallet } from 'contexts/useWallet/hooks';
import IconFont from 'components/IconFont';
import styles from './styles.module.less';

export default function CheckToFillAddressModal({
  visible: propsVisible,
  setVisible: propsSetVisible,
  onSuccess,
}: {
  visible: boolean;
  setVisible: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  const { t } = useLanguage();
  const { toWallet } = useWallet();
  const [{ toAddress }] = useHomeContext();
  const { chainId } = toWallet || {};
  const isMD = useMediaQueries('md');
  const name = getNameByChainId(chainId);

  const visible = useMemo(() => propsVisible, [propsVisible]);
  const iconProps = useMemo(() => {
    if (!chainId) return undefined;
    return getIconByChainId(chainId);
  }, [chainId]);

  const IconName = useMemo(() => {
    const props = { nameSize: 16, marginRight: 12 };
    if (isMD) {
      props.nameSize = 14;
      props.marginRight = 8;
    }
    return (
      <Row className="flex-row-center" style={{ fontSize: props.nameSize }}>
        <IconFont
          type={iconProps?.type || ''}
          style={{ marginRight: props.marginRight, fontSize: isMD ? '24px' : '28px' }}
        />
        <span style={{ fontSize: '14px' }}>{name || 'Wrong Network'}</span>
      </Row>
    );
  }, [iconProps?.type, isMD, name]);

  const onCancel = () => propsSetVisible(false);

  const onConfirm = () => onSuccess?.();

  return (
    <CommonModal
      className={styles['confirm-modal']}
      width="auto"
      title={t("Please confirm the recipient's address")}
      open={visible}
      onCancel={() => propsSetVisible(false)}>
      <div>
        <div className={styles['confirm-modal-content']}>
          {IconName}
          <div className={styles['confirm-modal-address']}>{toAddress}</div>
        </div>
        <Col span={24}>
          <Row justify="space-between" className={styles['confirm-modal-button']}>
            <Button type="default" onClick={onCancel}>
              {t('Cancel')}
            </Button>
            <Button type="primary" onClick={onConfirm}>
              {t('Confirm3')}
            </Button>
          </Row>
        </Col>
      </div>
    </CommonModal>
  );
}
