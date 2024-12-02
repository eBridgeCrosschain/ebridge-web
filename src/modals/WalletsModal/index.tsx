import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useLanguage } from 'i18n';
import Link from 'next/link';
import { useIsLogin, useLogin } from 'hooks/wallet';
import { useModal } from 'contexts/useModal';
import { setWalletsModal } from 'contexts/useModal/actions';
import { useWalletContext } from 'contexts/useWallet';
import { Button } from 'antd';
import CommonModal from '../../components/CommonModal';
import CommonImage from 'components/CommonImage';
import WalletList from '../../components/WalletList';
import { ethereumLogo, groupIcon, aelfChainLogo, checkFilledIcon, tonLogo } from 'assets/images';
import { ROUTE_PATHS } from 'constants/link';
import styles from './styles.module.less';
import { TonConnectButton } from '@tonconnect/ui-react';

const WALLET_STEP = {
  FROM: 0,
  TO: 1,
};

const STEP_ITEM_CONFIG = {
  ERC: {
    chainType: 'ERC',
    iconList: [ethereumLogo, groupIcon],
    text: 'External Chain',
  },
  ELF: {
    chainType: 'ELF',
    iconList: [aelfChainLogo],
    text: 'aelf',
  },
  TON: {
    chainType: 'TON',
    iconList: [tonLogo],
    text: 'External Chain',
  },
};

export default function WalletsModal() {
  const { t } = useLanguage();
  const login = useLogin();
  const isLogin = useIsLogin();
  const [{ walletsModal }, { dispatch }] = useModal();
  const [{ fromOptions, toOptions }] = useWalletContext();
  const [walletStep, setWalletStep] = useState(WALLET_STEP.FROM);

  const isFromELF = useMemo(() => fromOptions?.chainType === 'ELF', [fromOptions?.chainType]);

  const externalWallet = useMemo(
    () =>
      isFromELF
        ? toOptions?.chainType === 'ERC'
          ? STEP_ITEM_CONFIG.ERC
          : STEP_ITEM_CONFIG.TON
        : fromOptions?.chainType === 'ERC'
        ? STEP_ITEM_CONFIG.ERC
        : STEP_ITEM_CONFIG.TON,
    [fromOptions?.chainType, isFromELF, toOptions?.chainType],
  );

  const stepConfig = useMemo(() => {
    if (!isFromELF) {
      return [externalWallet, STEP_ITEM_CONFIG.ELF];
    } else {
      return [STEP_ITEM_CONFIG.ELF, externalWallet];
    }
  }, [externalWallet, isFromELF]);

  useEffect(() => {
    if (!walletsModal) {
      setWalletStep(WALLET_STEP.FROM);
    }
  }, [walletsModal]);

  const handleCloseModal = useCallback(() => {
    dispatch(setWalletsModal(false));
  }, [dispatch]);

  const handleConnectExternalWalletFinish = () => {
    if (!isFromELF) {
      setWalletStep(WALLET_STEP.TO);
    } else {
      handleCloseModal();
    }
  };

  const handleConnectAELFWallet = useCallback(async () => {
    await login();
  }, [login]);

  const handleConnectAELFWalletFinish = useCallback(() => {
    if (!isFromELF) {
      handleCloseModal();
    } else {
      setWalletStep(WALLET_STEP.TO);
    }
  }, [handleCloseModal, isFromELF]);

  useEffect(() => {
    if (isLogin) {
      handleConnectAELFWalletFinish();
    }
  }, [handleConnectAELFWalletFinish, isLogin]);

  return (
    <CommonModal
      width={438}
      open={walletsModal}
      title={t(stepConfig[walletStep].chainType !== 'ELF' ? 'Select your wallet' : 'Connect aelf wallet')}
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
        {stepConfig[walletStep].chainType !== 'ELF' ? (
          <WalletList
            onFinish={handleConnectExternalWalletFinish}
            chainType={stepConfig[walletStep].chainType === 'TON' ? stepConfig[walletStep].chainType : undefined}
          />
        ) : (
          <>
            <div className={clsx(styles['aelf-tip-wrap'], 'flex-column-center')}>
              <CommonImage className={styles['aelf-chain-logo']} src={aelfChainLogo} />
              <span>
                {t(
                  !isFromELF
                    ? 'Nice! Now let’s connect your aelf wallet.'
                    : 'Let’s connect your aelf wallet to get started.',
                )}
              </span>
            </div>
            <Button type="primary" onClick={handleConnectAELFWallet}>
              {t('Connect aelf Wallet')}
            </Button>
          </>
        )}
        {walletStep === WALLET_STEP.FROM && (
          <p className={styles.tip}>
            {t('By connecting a wallet, you agree to our')}
            <Link href={ROUTE_PATHS.TERMS_OF_SERVICE}>
              <a onClick={handleCloseModal}>{t('Terms of Service')}</a>
            </Link>
            .
          </p>
        )}
        {walletStep === WALLET_STEP.TO && (
          <Button className={styles['link-button']} type="link" onClick={handleCloseModal}>
            {t('Skip and enter address manually')}
          </Button>
        )}
      </div>
    </CommonModal>
  );
}
