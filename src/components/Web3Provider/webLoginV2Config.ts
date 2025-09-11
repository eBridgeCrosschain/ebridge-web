import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyInnerWallet } from '@aelf-web-login/wallet-adapter-portkey-web';
import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import { SignInDesignEnum, TChainId } from '@aelf-web-login/wallet-adapter-base';
import { APP_NAME, EBRIDGE_PORTKEY_PROJECT_CODE } from 'constants/misc';
import { AELF_NODES, SHOW_V_CONSOLE, SupportedELFChain, TELEGRAM_BOT_ID, WEB_LOGIN_CONFIG } from 'constants/index';
import { devices } from '@portkey/utils';
import { TelegramPlatform } from 'utils/telegram/telegram';
import { FairyVaultDiscoverWallet } from '@aelf-web-login/wallet-adapter-fairy-vault-discover';

const defaultChainId = WEB_LOGIN_CONFIG.chainId as TChainId;

export const didConfig = {
  graphQLUrl: WEB_LOGIN_CONFIG.portkeyV2.graphQLUrl,
  connectUrl: WEB_LOGIN_CONFIG.portkeyV2.connectServer,
  serviceUrl: WEB_LOGIN_CONFIG.portkeyV2.apiServer,
  requestDefaults: {
    baseURL: WEB_LOGIN_CONFIG.portkeyV2.apiServer,
    timeout: 20 * 1000,
  },
  socialLogin: {
    Telegram: {
      botId: TELEGRAM_BOT_ID,
    },
  },
  networkType: WEB_LOGIN_CONFIG.portkeyV2.networkType,
  referralInfo: {
    referralCode: '',
    projectCode: EBRIDGE_PORTKEY_PROJECT_CODE,
  },
};

const baseConfig: IConfigProps['baseConfig'] = {
  showVconsole: SHOW_V_CONSOLE,
  networkType: WEB_LOGIN_CONFIG.portkeyV2.networkType,
  chainId: defaultChainId,
  sideChainId: defaultChainId,
  design: SignInDesignEnum.CryptoDesign,
  enableAcceleration: true,
  appName: APP_NAME,
  theme: 'light',
};

export function getConfig() {
  const isTelegramPlatform = TelegramPlatform.isTelegramPlatform();
  const portkeyInnerWallet = new PortkeyInnerWallet({
    networkType: WEB_LOGIN_CONFIG.portkeyV2.networkType,
    chainId: defaultChainId,
    disconnectConfirm: true,
  });
  const fairyVaultDiscoverWallet = new FairyVaultDiscoverWallet({
    networkType: WEB_LOGIN_CONFIG.portkeyV2.networkType,
    chainId: defaultChainId,
    autoRequestAccount: true, // If set to true, please contact Portkey to add whitelist
    autoLogoutOnDisconnected: true,
    autoLogoutOnNetworkMismatch: true,
    autoLogoutOnAccountMismatch: true,
    autoLogoutOnChainMismatch: true,
  });
  (fairyVaultDiscoverWallet as any).detect();
  const isMobileDevices = devices.isMobileDevices();
  const config: IConfigProps = {
    baseConfig,
    wallets: isTelegramPlatform
      ? [portkeyInnerWallet]
      : isMobileDevices
      ? [
          portkeyInnerWallet,
          fairyVaultDiscoverWallet,
          new PortkeyDiscoverWallet({
            networkType: WEB_LOGIN_CONFIG.portkeyV2.networkType,
            chainId: defaultChainId,
            autoRequestAccount: true,
            autoLogoutOnDisconnected: true,
            autoLogoutOnNetworkMismatch: true,
            autoLogoutOnAccountMismatch: true,
            autoLogoutOnChainMismatch: true,
            onPluginNotFound: (openStore) => {
              openStore();
            },
          }),
        ]
      : [
          portkeyInnerWallet,
          fairyVaultDiscoverWallet,
          new PortkeyDiscoverWallet({
            networkType: WEB_LOGIN_CONFIG.portkeyV2.networkType,
            chainId: defaultChainId,
            autoRequestAccount: true,
            autoLogoutOnDisconnected: true,
            autoLogoutOnNetworkMismatch: true,
            autoLogoutOnAccountMismatch: true,
            autoLogoutOnChainMismatch: true,
          }),
          new NightElfWallet({
            chainId: defaultChainId,
            appName: APP_NAME,
            connectEagerly: true,
            defaultRpcUrl: SupportedELFChain[defaultChainId].CHAIN_INFO.rpcUrl,
            nodes: AELF_NODES,
          }),
        ],
  };
  return config;
}
