import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyAAWallet } from '@aelf-web-login/wallet-adapter-portkey-aa';
import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import { SignInDesignEnum, TChainId } from '@aelf-web-login/wallet-adapter-base';
import { APP_NAME, EBRIDGE_PORTKEY_PROJECT_CODE } from 'constants/misc';
import { AELF_NODES, SHOW_V_CONSOLE, SupportedELFChain, TELEGRAM_BOT_ID, WEB_LOGIN_CONFIG } from 'constants/index';
import { devices } from '@portkey/utils';
import { TelegramPlatform } from 'utils/telegram/telegram';

const defaultChainId = WEB_LOGIN_CONFIG.chainId as TChainId;

const didConfig = {
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

const baseConfig = {
  showVconsole: SHOW_V_CONSOLE,
  networkType: WEB_LOGIN_CONFIG.portkeyV2.networkType,
  chainId: defaultChainId,
  keyboard: true,
  noCommonBaseModal: false,
  design: SignInDesignEnum.CryptoDesign,
};

const isTelegramPlatform = TelegramPlatform.isTelegramPlatform();
const portkeyAAWallet = new PortkeyAAWallet({
  appName: APP_NAME,
  chainId: defaultChainId,
  autoShowUnlock: true,
});
const isMobileDevices = devices.isMobileDevices();

export const config: IConfigProps = {
  didConfig,
  baseConfig,
  wallets: isTelegramPlatform
    ? [portkeyAAWallet]
    : isMobileDevices
    ? [
        portkeyAAWallet,
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
        portkeyAAWallet,
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
