import { Col, Row } from 'antd';
import CommonButton from 'components/CommonButton';
import CommonModal from 'components/CommonModal';

import styles from './styles.module.less';
import { useLanguage } from 'i18n';
import { SupportedELFChainId } from 'constants/chain';
import { basicModalView } from 'contexts/useModal/actions';
import { useModal } from 'contexts/useModal';

export default function PortkeyNotConnectModal() {
  const { t } = useLanguage();
  const [{ portketNotConnectModal }, { dispatch }] = useModal();

  const closeModal = () =>
    dispatch(
      basicModalView.setPortketNotConnectModal({
        visible: false,
        chainId: undefined,
      }),
    );
  return (
    <CommonModal
      open={portketNotConnectModal?.visible}
      onCancel={closeModal}
      title={t('Please Notice')}
      className={styles['portkey-not-connect-modal']}>
      <Row gutter={[0, 24]} justify="center">
        <Col span={24} className={styles['text']}>
          <Row gutter={[0, 8]}>
            <Col span={24}>
              {t('Synchronising data on the chain 1', {
                chainType: t(
                  portketNotConnectModal?.chainId === SupportedELFChainId.AELF ? 'main chain' : 'side chain',
                ),
              })}
            </Col>
            <Col>{t('Synchronising data on the chain 2')}</Col>
          </Row>
        </Col>
        <Col span={24} className={styles['confirm-btn-box']}>
          <CommonButton type="primary" onClick={closeModal} className={styles['confirm-btn']}>
            {t('OK')}
          </CommonButton>
        </Col>
      </Row>
    </CommonModal>
  );
}
