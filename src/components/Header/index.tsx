import styles from './styles.module.less';
import logo from './images/logo.svg';
import testLogo from './images/testLogo.svg';
import {
  translateIcon,
  translateBlueIcon,
  arrowGrayIcon,
  arrowBlueIcon,
  checkBlueIcon,
  menuIcon,
  closeIcon,
  communityIcon,
  legalIcon,
  aelfLogo,
  listingIcon,
} from 'assets/images';
import clsx from 'clsx';
import { Button, Drawer, Dropdown, Menu } from 'antd';
import { LOCAL_LANGUAGE } from 'i18n/config';
import { useLanguage } from 'i18n';
import useMediaQueries from 'hooks/useMediaQueries';
import { useEffect, useMemo, useState } from 'react';
import CommonImage from 'components/CommonImage';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { IS_MAINNET } from 'constants/index';
import { NAV_LIST, HEADER_COMMUNITY_CONFIG, LEGAL_MENU_CONFIG, ROUTE_PATHS, LISTING_MENU_CONFIG } from 'constants/link';
import { setAccountModal, setWalletsModal } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { useWallet } from 'contexts/useWallet/hooks';
import { AElfConnectorId, ChainType, EVMConnectorId, TONConnectorId } from 'types';
import { useAelfLogin } from 'hooks/wallet';
import WalletIcon from 'components/WalletIcon';
import { shortenString } from 'utils';
import { isELFChain } from 'utils/aelfUtils';
import { formatAddress } from 'utils/chain';
import { isPortkey } from 'utils/portkey';
import { useConnect } from 'hooks/useConnect';
import { isMobileDevices } from 'utils/isMobile';

function SelectLanguage() {
  const { language, changeLanguage } = useLanguage();
  const menu = (
    <Menu
      selectedKeys={[language]}
      items={LOCAL_LANGUAGE.map((item) => {
        return {
          key: item.language,
          label: item.title,
          onClick: () => changeLanguage(item.language),
        };
      })}
    />
  );
  const showText = LOCAL_LANGUAGE.find((item) => item.language === language)?.title || LOCAL_LANGUAGE[0].title;
  return (
    <Dropdown
      className={clsx(styles.dropdown, 'cursor-pointer')}
      overlayClassName={styles['dropdown-overlay']}
      overlay={menu}
      trigger={['click']}
      getPopupContainer={(triggerNode) => triggerNode}>
      <div className={clsx(styles['language-selector'], 'flex-row-center', 'cursor-pointer')}>
        <CommonImage className={styles['language-selector-translate-icon']} src={translateBlueIcon} priority />
        <span>{showText}</span>
        <CommonImage className={styles['language-selector-arrow-icon']} src={arrowBlueIcon} priority />
      </div>
    </Dropdown>
  );
}

function Logo({ clickable = false }: { clickable?: boolean }) {
  const { push } = useRouter();
  return (
    <CommonImage
      priority
      style={{ width: IS_MAINNET ? 96 : 119, height: 32, cursor: clickable ? 'pointer' : 'default' }}
      src={IS_MAINNET ? logo : testLogo}
      alt="logo"
      onClick={() => {
        if (clickable) {
          push(ROUTE_PATHS.BRIDGE);
        }
      }}
    />
  );
}

function ConnectWalletsButton() {
  const { t } = useLanguage();
  const dispatch = useModalDispatch();
  const login = useAelfLogin();
  const { isHomogeneous } = useWallet();

  return (
    <Button
      type="primary"
      onClick={() => {
        if (isHomogeneous) {
          login();
        } else {
          dispatch(setWalletsModal(true));
        }
      }}>
      {t(isHomogeneous ? 'Connect Wallet' : 'Connect Wallets')}
    </Button>
  );
}

function WalletButton({ chainType }: { chainType?: ChainType }) {
  const isMd = useMediaQueries('md');
  const { t } = useLanguage();
  const dispatch = useModalDispatch();
  const connect = useConnect();

  const { fromWallet, toWallet, fromOptions } = useWallet();
  const wallet = fromOptions?.chainType === chainType ? fromWallet : toWallet;
  const { walletType, chainId, account, connectorId } = wallet || {};
  const isELF = chainType === 'ELF';
  return account ? (
    <Button
      className={clsx(styles['account-button'], 'flex-row-center')}
      onClick={() =>
        dispatch(
          setAccountModal(true, {
            accountWalletType: walletType,
            accountChainId: chainId,
          }),
        )
      }>
      <WalletIcon connectorId={connectorId} className={styles['wallet-icon']} />
      {isMd ? (
        <CommonImage priority className={styles['wallet-arrow-icon']} src={arrowBlueIcon} />
      ) : (
        <div className={styles['wallet-address']}>
          {isELFChain(chainId) ? shortenString(formatAddress(chainId, account), 7, 8) : shortenString(account, 5, 3)}
        </div>
      )}
    </Button>
  ) : (
    <Button type="primary" onClick={() => connect(chainType, chainId)}>
      {isMd ? (
        <div className={clsx(styles['mobile-wallet-button-content'], 'flex-row-center')}>
          {isELF ? (
            <WalletIcon connectorId={AElfConnectorId.PORTKEY} className={styles['wallet-icon']} />
          ) : chainType === 'TON' ? (
            <WalletIcon connectorId={TONConnectorId.TON} className={styles['wallet-icon']} type="ton-wallet-white" />
          ) : (
            <div className="flex-row-center">
              {!isPortkey() && !isMobileDevices() && (
                <WalletIcon connectorId={EVMConnectorId.METAMASK} className={styles['wallet-icon']} />
              )}
              <WalletIcon connectorId={EVMConnectorId.WALLET_CONNECT} className={styles['wallet-icon']} />
              {!isPortkey() && (
                <WalletIcon connectorId={EVMConnectorId.COINBASE_WALLET} className={styles['wallet-icon']} />
              )}
            </div>
          )}
          <span>{t('Connect')}</span>
        </div>
      ) : (
        t(isELF ? 'Connect aelf Wallet' : 'Connect External Wallet')
      )}
    </Button>
  );
}

function WalletButtonList() {
  const { fromWallet, toWallet, fromOptions, toOptions } = useWallet();
  const { account: fromAccount } = fromWallet || {};
  const { account: toAccount } = toWallet || {};
  if (!fromAccount && !toAccount) {
    return <ConnectWalletsButton />;
  } else {
    return (
      <div className={clsx(styles['wallet-button-list'], 'flex-row')}>
        <WalletButton chainType={fromOptions?.chainType} />
        <WalletButton chainType={toOptions?.chainType} />
      </div>
    );
  }
}

interface IMobileDrawerMenuItem {
  icon?: any;
  label: string;
  link?: string;
  checked?: boolean;
  onClick?: () => void;
}

interface IMobileDrawerMenuConfigItem {
  icon: any;
  label: string;
  children: IMobileDrawerMenuItem[];
}

function MobileDrawerMenu({ isDrawerVisible, onCloseDrawer }: { isDrawerVisible: boolean; onCloseDrawer(): void }) {
  const { t } = useLanguage();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const { language, changeLanguage } = useLanguage();

  useEffect(() => {
    if (!isDrawerVisible) {
      setOpenKeys([]);
    }
  }, [isDrawerVisible]);

  const mobileDrawerMenuConfig: IMobileDrawerMenuConfigItem[] = useMemo(
    () => [
      {
        icon: translateIcon,
        label: 'Language',
        children: LOCAL_LANGUAGE.map((item) => ({
          label: item.title,
          checked: item.language === language,
          onClick: () => changeLanguage(item.language),
        })),
      },
      {
        icon: listingIcon,
        label: 'Listing',
        children: LISTING_MENU_CONFIG,
      },
      {
        icon: communityIcon,
        label: 'Community',
        children: HEADER_COMMUNITY_CONFIG,
      },
      {
        icon: legalIcon,
        label: 'Legal',
        children: LEGAL_MENU_CONFIG,
      },
    ],
    [changeLanguage, language],
  );

  const items = useMemo(
    () =>
      mobileDrawerMenuConfig.map(({ icon, label, children }) => ({
        key: label,
        label: (
          <div className={clsx(styles['mobile-drawer-menu-label-wrap'], 'flex-row-center')}>
            {icon && <CommonImage className={styles['menu-item-icon']} src={icon} />}
            <span className={styles['menu-item-text']}>{t(label)}</span>
            <CommonImage
              className={clsx(styles['menu-expand-icon'], {
                [styles['menu-expand-icon-rotate']]: openKeys.includes(label),
              })}
              src={arrowGrayIcon}
            />
          </div>
        ),
        children: children?.map((child) => {
          const isExternalLink = child.link?.startsWith('https:');
          return {
            key: child.label,
            label: (
              <Link href={child.link || ''}>
                <a
                  className={clsx(styles['mobile-drawer-menu-label-wrap'], 'flex-row-center')}
                  target={isExternalLink ? '_blank' : '_self'}
                  onClick={isExternalLink ? undefined : () => onCloseDrawer()}>
                  {child.icon && <CommonImage className={styles['menu-item-icon']} src={child.icon} />}
                  <span className={styles['menu-item-text']}>{t(child.label)}</span>
                  {child.checked && <CommonImage className={styles['menu-checked-icon']} src={checkBlueIcon} />}
                </a>
              </Link>
            ),
            onClick: child.onClick,
          };
        }),
      })),
    [mobileDrawerMenuConfig, onCloseDrawer, openKeys, t],
  );

  return (
    <Menu
      className={styles['mobile-drawer-menu']}
      mode="inline"
      selectable={false}
      expandIcon={<></>}
      items={items}
      openKeys={openKeys}
      onOpenChange={(keys) => setOpenKeys(keys)}
    />
  );
}

function MobileHeader() {
  const [visible, setVisible] = useState<boolean>(false);
  const { pathname, push } = useRouter();
  const { t } = useLanguage();
  return (
    <>
      <div className={clsx(styles['mobile-header-left'], 'flex-row-center')}>
        <CommonImage
          priority
          className={clsx(styles['menu-icon'], 'cursor-pointer')}
          src={menuIcon}
          onClick={() => setVisible(true)}
        />
      </div>
      <WalletButtonList />
      <Drawer
        className={styles['mobile-drawer']}
        width={'100%'}
        closable={false}
        onClose={() => setVisible(false)}
        open={visible}>
        <div className={clsx(styles['mobile-drawer-header'], 'flex-row-center', 'flex-row-between')}>
          <Logo />
          <CommonImage
            className={clsx(styles['close-icon'], 'cursor-pointer')}
            src={closeIcon}
            onClick={() => setVisible(false)}
          />
        </div>
        {NAV_LIST.map((item, index) => {
          const isSelected = pathname === item.href;
          return (
            <div
              key={index}
              className={clsx(styles['mobile-drawer-nav-item'], 'flex-row-center', 'cursor-pointer', {
                [styles['mobile-drawer-nav-item-selected']]: isSelected,
              })}
              onClick={() => {
                push(item.href);
                setVisible(false);
              }}>
              <CommonImage className={styles['nav-item-icon']} src={isSelected ? item.selectedIcon : item.icon} />
              <span>{t(item.title)}</span>
            </div>
          );
        })}
        <div className={styles.divider} />
        <div className={styles['mobile-drawer-menu-wrap']}>
          <MobileDrawerMenu isDrawerVisible={visible} onCloseDrawer={() => setVisible(false)} />
        </div>
        <div className={clsx(styles['mobile-drawer-footer'], 'flex-row-content-center')}>
          <span>Powered by</span>
          <CommonImage className={styles['aelf-logo']} priority src={aelfLogo} />
        </div>
      </Drawer>
    </>
  );
}

export default function Header() {
  const isMd = useMediaQueries('md');
  return (
    <div
      className={clsx(
        'flex-row-center',
        'flex-row-between',
        {
          [styles['md-header']]: isMd,
        },
        styles.header,
      )}>
      {!isMd ? (
        <>
          <Logo clickable />
          <div className={clsx(styles['header-right'], 'flex-row-center')}>
            <SelectLanguage />
            <WalletButtonList />
          </div>
        </>
      ) : (
        <MobileHeader />
      )}
    </div>
  );
}
