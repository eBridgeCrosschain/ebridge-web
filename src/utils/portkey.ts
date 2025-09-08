import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { PORTKEY_WEB_WALLET_INFO_KEY } from 'constants/misc';
import { TWalletConnectorId } from 'types';

export function compareVersions(v1: string, v2: string) {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    if (v1Part < v2Part) {
      return -1;
    } else if (v1Part > v2Part) {
      return 1;
    }
  }
  return 0;
}
export function isPortkey() {
  if (typeof window === 'object') return window.navigator.userAgent.includes('Portkey');
}

export function isPortkeyConnectEagerly() {
  if (!isPortkey()) return false;
  const regex = /PortkeyV(\d+\.\d+\.\d+)/;
  const match = window.navigator.userAgent.match(regex);
  if (match && match[1]) {
    const version = match[1];
    return compareVersions(version, '1.4.0') >= 0;
  }
  return false;
}

export function isPortkeyConnector(connectorId?: TWalletConnectorId) {
  return connectorId === 'PORTKEY';
}

export function isSelectPortkey(type?: string) {
  return type?.includes('PORTKEY');
}
export type TPortkeyWebWalletWalletInfo = {
  caAddress: string;
  caHash: string;
  managerAddress: string;
  managerPubkey: string;
  originChainId: string;
};
export function getPortkeyWebWalletInfo() {
  const portkeyWebWalletInfo = localStorage.getItem(PORTKEY_WEB_WALLET_INFO_KEY);
  if (!portkeyWebWalletInfo) return;
  try {
    return JSON.parse(portkeyWebWalletInfo) as TPortkeyWebWalletWalletInfo;
  } catch (error) {
    return;
  }
}

export function checkConnectedWallet() {
  try {
    if (localStorage.getItem('connectedWallet') === WalletTypeEnum.aa) localStorage.removeItem('connectedWallet');
  } catch (error) {
    console.log(error, '====checkConnectedWallet');
  }
}
