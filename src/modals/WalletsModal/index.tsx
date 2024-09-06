import { Fragment, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useLanguage } from 'i18n';
import Link from 'next/link';
import { useWebLogin, useWebLoginEvent, WebLoginEvents } from 'aelf-web-login';
import { useModal } from 'contexts/useModal';
import { setWalletsModal } from 'contexts/useModal/actions';
import { useWalletContext } from 'contexts/useWallet';
import { Button } from 'antd';
import CommonModal from '../../components/CommonModal';
import CommonImage from 'components/CommonImage';
import WalletList from '../../components/WalletList';
import { ethereumLogo, groupIcon, aelfChainLogo, checkFilledIcon } from 'assets/images';
import { ROUTE_PATHS } from 'constants/link';
import styles from './styles.module.less';

const WALLET_STEP = {
  FROM: 0,
  TO: 1,
};

const STEP_ITEM_CONFIG = {
  ERC: {
    chainType: 'ERC',
    iconList: [ethereumLogo, groupIcon],
    text: 'Ethereum/BNB Smart Chain',
  },
  ELF: {
    chainType: 'ELF',
    iconList: [aelfChainLogo],
    text: 'aelf',
  },
};

export default function WalletsModal() {
  const { t } = useLanguage();
  const { login } = useWebLogin();
  const [{ walletsModal }, { dispatch }] = useModal();
  const [{ fromOptions }] = useWalletContext();
  const [walletStep, setWalletStep] = useState(WALLET_STEP.FROM);

  const isFromERC = useMemo(() => fromOptions?.chainType === 'ERC', []);

  const stepConfig = useMemo(() => {
    if (isFromERC) {
      return [STEP_ITEM_CONFIG.ERC, STEP_ITEM_CONFIG.ELF];
    } else {
      return [STEP_ITEM_CONFIG.ELF, STEP_ITEM_CONFIG.ERC];
    }
  }, []);

  useEffect(() => {
    if (!walletsModal) {
      setWalletStep(WALLET_STEP.FROM);
    }
  }, [walletsModal]);

  const handleCloseModal = () => {
    dispatch(setWalletsModal(false));
  };

  const handleConnectExternalWalletFinish = () => {
    if (isFromERC) {
      setWalletStep(WALLET_STEP.TO);
    } else {
      handleCloseModal();
    }
  };

  const handleConnectAELFWallet = () => {
    login();
  };

  const handleConnectAELFWalletFinish = () => {
    if (isFromERC) {
      handleCloseModal();
    } else {
      setWalletStep(WALLET_STEP.TO);
    }
  };

  useWebLoginEvent(WebLoginEvents.LOGINED, handleConnectAELFWalletFinish);

  return (
    <CommonModal
      width={438}
      visible={walletsModal}
      title={t('Select your wallet')}
      onCancel={handleCloseModal}
      className={clsx('modals', styles['wallets-modal'])}
      type="pop-bottom">
      <div className={clsx(styles['modal-content'], 'flex-column')}>
        <div className={clsx(styles['steps-wrap'], 'flex-row-center')}>
          {stepConfig.map((config, index) => {
            const isNotCurrentStep = walletStep !== index;
            return (
              <Fragment key={index}>
                {index !== 0 && <div className={styles['step-line']} />}
                <div
                  className={clsx(
                    styles['step-item'],
                    isNotCurrentStep && styles['step-item-not-current'],
                    'flex-row-center',
                  )}>
                  {isNotCurrentStep && index < walletStep ? (
                    <CommonImage className={styles['check-icon']} src={checkFilledIcon} />
                  ) : (
                    <div className={clsx(styles['chain-icon-list'], 'flex-row-center')}>
                      {config.iconList.map((icon, idx) => (
                        <CommonImage key={idx} className={styles['chian-icon']} src={icon} />
                      ))}
                    </div>
                  )}
                  <span className={styles['chain-text']}>{config.text}</span>
                </div>
              </Fragment>
            );
          })}
        </div>
        {stepConfig[walletStep].chainType === 'ERC' ? (
          <WalletList onFinish={handleConnectExternalWalletFinish} />
        ) : (
          <>
            <div className={clsx(styles['aelf-tip-wrap'], 'flex-column-center')}>
              <CommonImage className={styles['aelf-chain-logo']} src={aelfChainLogo} />
              <span>Let’s connect your aelf wallet to get started.</span>
            </div>
            <Button type="primary" onClick={handleConnectAELFWallet}>
              Connect aelf Wallet
            </Button>
          </>
        )}
        {walletStep === WALLET_STEP.FROM && (
          <p className={styles.tip}>
            By connecting a wallet, you agree to our{' '}
            <Link href={ROUTE_PATHS.TERMS_OF_SERVICE}>
              <a onClick={handleCloseModal}>Terms of Service</a>
            </Link>
            .
          </p>
        )}
        {walletStep === WALLET_STEP.TO && (
          <Button className={styles['link-button']} type="link" onClick={handleCloseModal}>
            Skip and enter address manually
          </Button>
        )}
      </div>
    </CommonModal>
  );
}
