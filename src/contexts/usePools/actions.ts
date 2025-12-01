import { basicActions } from 'contexts/utils';
import { APIPoolItem, TPoolOverview } from 'types/api';
export declare type PoolsState = {
  poolList?: {
    totalCount: number;
    items: APIPoolItem[];
  };
  poolOverview?: TPoolOverview;
};
export enum PoolsActions {
  destroy = 'DESTROY',
  setPoolList = 'SET_POOL_LIST',
  setPoolOverview = 'SET_POOL_OVERVIEW',
}

export const whitelistActions = {
  setPoolList: (poolList?: APIPoolItem[]) => basicActions(PoolsActions['setPoolList'], { poolList }),
  setPoolOverview: (poolOverview?: TPoolOverview) => basicActions(PoolsActions['setPoolOverview'], { poolOverview }),
};

export const { setPoolList, setPoolOverview } = whitelistActions;
