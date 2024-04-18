import { basicActions } from 'contexts/utils';
import type { ChainId, ChainType, Web3Type } from 'types';

export type Options = {
  chainType: ChainType;
  chainId?: ChainId;
  isPortkey?: boolean;
};

export enum WalletActions {
  setFromWallet = 'SET_FROM_WALLET',
  setToWallet = 'SET_TO_WALLET',
  changeWallet = 'CHANGE_WALLET',
  changeEnd = 'CHANGE_END',
  destroy = 'DESTROY',
  setSwitchChainInConnectPortkey = 'SET_SWITCH_CHAIN_IN_CONNECT_PORTKEY',
}

export type ModalState = {
  fromWallet?: Web3Type;
  toWallet?: Web3Type;
  fromOptions?: Options;
  toOptions?: Options;
  changing?: boolean;
  isHomogeneous?: boolean;
  switchChainInConnectPortkey?: {
    status: boolean;
    chainId?: ChainId;
  };
};

export const basicWalletActions = {
  setFromWallet: (options: Options) => basicActions(WalletActions['setFromWallet'], { fromOptions: options }),
  setToWallet: (options: Options) => basicActions(WalletActions['setToWallet'], { toOptions: options }),
  changeWallet: () => basicActions(WalletActions.changeWallet),
  changeEnd: () => basicActions(WalletActions.changeEnd),
  web3ProviderDestroy: () => basicActions(WalletActions['destroy']),
  setSwitchChainInConnectPortkey: (info: { status: boolean; chainId?: ChainId }) =>
    basicActions(WalletActions['setSwitchChainInConnectPortkey'], info),
};

export const {
  setFromWallet,
  setToWallet,
  web3ProviderDestroy,
  changeWallet,
  changeEnd,
  setSwitchChainInConnectPortkey,
} = basicWalletActions;
