import { AElfAddress } from '@aelf-react/types';
import { Accounts, ChainIds, IPortkeyProvider } from '@portkey/provider-types';
import { WalletInfo, WalletType } from 'aelf-web-login';
import type { ReactNode, Dispatch } from 'react';
import { ChainId } from 'types';

export enum Actions {
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
  CHANGE = 'CHANGE',
}

export type PortkeyNode = {
  chainId: string;
};

export interface ILoginWalletProviderProps {
  children: ReactNode;
  // appName: string;
  // networkType: NetworkType;
  // nodes?: {
  //   [key: string]: PortkeyNode;
  // };
}

export interface ILoginWalletContextState {
  name?: string;
  chainId?: string;
  chainIds?: ChainIds;
  account?: AElfAddress;
  accounts?: Accounts;
  provider?: IPortkeyProvider;
  version?: 'v1' | 'v2';
  loginWalletType?: WalletType;
  wallet?: WalletInfo;
  // is connected
  isActive: boolean;
}

export interface ILoginWalletContextType extends ILoginWalletContextState {
  activate: () => Promise<true>;
  deactivate: () => Promise<true>;
  // try eagerly connection
  connectEagerly: () => Promise<true>;
  getWalletManagerStatus: (chainId: ChainId) => Promise<boolean>;
}

export type ReducerAction = {
  type: Actions;
  payload?: any;
};

export interface PortkeyContextDefine {
  state: ILoginWalletContextState;
  dispatch: Dispatch<ReducerAction>;
}
