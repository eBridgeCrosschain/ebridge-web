import { basicActions } from 'contexts/utils';
import { WalletType } from 'types';
import { ConnectionType } from 'walletConnectors';

export declare type ChainState = {
  userERCChainId?: number;
  userELFChainId?: string;
  selectERCWallet?: ConnectionType;
  selectELFWallet?: WalletType;
};

export enum ChainActions {
  setSelectERCWallet = 'SET_SELECT_ERC_WALLET',
  setSelectELFWallet = 'SET_SELECT_ELF_WALLET',
  default = 'DEFAULT',
  destroy = 'DESTROY',
}

export const useChainView = {
  setSelectERCWallet: (selectERCWallet?: ConnectionType) => basicActions(ChainActions['default'], { selectERCWallet }),
  setUserERCChainId: (userERCChainId: string) => basicActions(ChainActions['default'], { userERCChainId }),
  setUserELFChainId: (userELFChainId: string) => basicActions(ChainActions['default'], { userELFChainId }),
  setSelectELFWallet: (selectELFWallet?: WalletType) =>
    basicActions(ChainActions['setSelectELFWallet'], { selectELFWallet }),
  chainProviderDestroy: () => basicActions(ChainActions['destroy']),
};

export const { setSelectERCWallet, setUserERCChainId, setUserELFChainId, chainProviderDestroy, setSelectELFWallet } =
  useChainView;
