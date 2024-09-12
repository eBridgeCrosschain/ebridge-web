import type { Accounts, IPortkeyProvider } from '@portkey/provider-types';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { AElfDappBridge } from '@aelf-react/types';

export type TAelfAccounts = {
  AELF?: string;
  tDVV?: string;
  tDVW?: string;
};

export interface WebLoginWalletInfo {
  name?: string;
  address: string;
  extraInfo: ExtraInfoForDiscover | ExtraInfoForPortkeyAA | ExtraInfoForNightElf;
}

export interface ExtraInfoForDiscover {
  accounts: Accounts;
  nickName: string;
  provider: IPortkeyProvider;
}

export interface ExtraInfoForPortkeyAA {
  publicKey: string;
  portkeyInfo: PortkeyDid.DIDWalletInfo & {
    accounts: TAelfAccounts;
    nickName: string;
  };
}

export interface ExtraInfoForNightElf {
  publicKey: string;
  nightElfInfo: {
    name: string;
    // appPermission;
    defaultAElfBridge?: AElfDappBridge;
    aelfBridges?: {
      [key: string]: AElfDappBridge;
    };
    nodes?: {
      [key: string]: TAelfNode;
    };
  };
}
export declare type TAelfNode = {
  rpcUrl: string;
  chainId: string;
};
