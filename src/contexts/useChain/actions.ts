import { basicActions } from 'contexts/utils';
import { WalletType } from 'types';
import { ConnectionType } from 'walletConnectors';

export declare type ChainState = {
  userERCChainId?: number;
  userTRCChainId?: number;
  userELFChainId?: string;
  selectERCWallet?: ConnectionType;
  selectTRCWallet?: ConnectionType;
  selectELFWallet?: WalletType;
};

export enum ChainActions {
  setSelectERCWallet = 'SET_SELECT_ERC_WALLET',
  setSelectTRCWallet = 'SET_SELECT_TRC_WALLET',
  setSelectELFWallet = 'SET_SELECT_ELF_WALLET',
  default = 'DEFAULT',
  destroy = 'DESTROY',
}

export const useChainView = {
  setSelectERCWallet: (selectERCWallet?: ConnectionType) => basicActions(ChainActions['default'], { selectERCWallet }),
  setUserERCChainId: (userERCChainId: string) => basicActions(ChainActions['default'], { userERCChainId }),
  setSelectTRCWallet: (selectTRCWallet?: ConnectionType) => basicActions(ChainActions['default'], { selectTRCWallet }),
  setUserTRCChainId: (userTRCChainId: string) => basicActions(ChainActions['default'], { userTRCChainId }),
  setUserELFChainId: (userELFChainId: string) => basicActions(ChainActions['default'], { userELFChainId }),
  setSelectELFWallet: (selectELFWallet?: WalletType) =>
    basicActions(ChainActions['setSelectELFWallet'], { selectELFWallet }),
  chainProviderDestroy: () => basicActions(ChainActions['destroy']),
};

export const {
  setSelectERCWallet,
  setUserERCChainId,
  setSelectTRCWallet,
  setUserTRCChainId,
  setUserELFChainId,
  chainProviderDestroy,
  // setAELFType,
  setSelectELFWallet,
} = useChainView;
