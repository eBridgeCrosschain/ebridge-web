import { basicActions } from 'contexts/utils';
import { CurrentWhitelistItem } from 'hooks/whitelist';
import { CrossChainItem } from 'types/api';
import BigNumber from 'bignumber.js';
import { TokenInfo } from 'types';

export enum HomeActionsEnum {
  setSelectModal = 'SET_SELECT_TOKEN_MODAL',
  setAddModal = 'SET_ACCOUNT_MODAL',
  setNetWorkDrawer = 'SET_NETWORK_DRAWER',
  setSelectToken = 'SET_SELECT_TOKEN',
  setFrom = 'SET_FROM',
  setTo = 'SET_TO',
  setToChecked = 'SET_TO_CHECKED',
  setToAddress = 'SET_TO_ADDRESS',
  setReceiveList = 'SET_RECEIVE_LIST',
  setReceiveId = 'SET_RECEIVE_ID',
  setActionLoading = 'SET_ACTION_LOADING',
  destroy = 'DESTROY',
  default = 'DEFAULT',
  destroyModal = 'DESTROY_MODAL',
  destroyState = 'DESTROY_STATE',
  setLimitAmountModal = 'SET_LIMIT_AMOUNT_MODAL',
  setLimitAmountDescModal = 'SET_LIMIT_AMOUNT_DESC_MODAL',
}

export type HomeState = {
  selectModal?: {
    open: boolean;
    type?: 'from' | 'to';
  };
  addModal?: boolean;
  selectToken?: CurrentWhitelistItem;
  fromInput?: string;
  toInput?: string;
  toChecked?: boolean;
  toAddress?: string;
  receiveList?: CrossChainItem[];
  receiveId?: string;
  receiveItem?: CrossChainItem;
  receivedList?: string[];
  fromBalance?: { balance: BigNumber; show: BigNumber; token: TokenInfo };
  actionLoading?: boolean;
  crossMin?: number;
  crossFee?: string;
  limitAmountModal?: boolean;
  limitAmountDescModal?: boolean;
};

export const DestroyModal = {
  selectModal: {
    open: false,
  },
  addModal: undefined,
};
export const DestroyState = {
  selectModal: {
    open: false,
  },
  addModal: undefined,
  fromInput: '',
  toInput: '',
  receiveList: undefined,
  receiveId: undefined,
  receiveItem: undefined,
  actionLoading: undefined,
};

export const HomeActions = {
  setSelectModal: (selectModal: HomeState['selectModal']) => {
    const obj: any = { selectModal };
    if (selectModal.open) {
      obj.destroyModal = true;
    }
    return basicActions(HomeActionsEnum['setSelectModal'], obj);
  },
  setAddModal: (addModal: boolean) => {
    const obj: any = { addModal };
    if (addModal) {
      obj.destroyModal = true;
    }
    return basicActions(HomeActionsEnum['setAddModal'], obj);
  },
  setSelectToken: (selectToken?: CurrentWhitelistItem) =>
    basicActions(HomeActionsEnum['setSelectToken'], { selectToken }),
  homeModalDestroy: () => basicActions(HomeActionsEnum['destroyModal']),
  homeStateDestroy: () => basicActions(HomeActionsEnum['destroyState']),
  setFrom: (input: string) => basicActions(HomeActionsEnum['setFrom'], { fromInput: input }),
  setTo: (input: string) => basicActions(HomeActionsEnum['setTo'], { toInput: input }),
  setToChecked: (checked: boolean) => basicActions(HomeActionsEnum['setToChecked'], { toChecked: checked }),
  setToAddress: (address: string) => basicActions(HomeActionsEnum['setToAddress'], { toAddress: address }),
  setActionLoading: (actionLoading?: boolean) => basicActions(HomeActionsEnum['setActionLoading'], { actionLoading }),
  setReceiveList: (receiveList: CrossChainItem[]) => basicActions(HomeActionsEnum['setReceiveList'], { receiveList }),
  setReceiveId: (receiveId?: string) => basicActions(HomeActionsEnum['setReceiveId'], { receiveId }),
  setHomeState: (state: HomeState) => basicActions(HomeActionsEnum['default'], state),
  homeDestroy: () => basicActions(HomeActionsEnum['destroy']),
  setLimitAmountModal: (limitAmountModal: boolean) =>
    basicActions(HomeActionsEnum['setLimitAmountModal'], { limitAmountModal }),
  setLimitAmountDescModal: (limitAmountDescModal: boolean) =>
    basicActions(HomeActionsEnum['setLimitAmountDescModal'], { limitAmountDescModal }),
};

export const {
  setActionLoading,
  setReceiveId,
  setReceiveList,
  setTo,
  setToChecked,
  setToAddress,
  setFrom,
  setSelectModal,
  setSelectToken,
  homeModalDestroy,
  setAddModal,
  homeDestroy,
  setHomeState,
  setLimitAmountModal,
  setLimitAmountDescModal,
} = HomeActions;
