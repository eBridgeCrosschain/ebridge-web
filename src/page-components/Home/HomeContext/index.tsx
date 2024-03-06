import { request } from 'api';
import storages from 'constants/storages';
import { useWallet } from 'contexts/useWallet/hooks';
import { BasicActions } from 'contexts/utils';
import { useBalances } from 'hooks/useBalances';
import useInterval from 'hooks/useInterval';
import { useUserAddedToken } from 'hooks/whitelist';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useCookie, usePrevious } from 'react-use';
import { isELFChain } from 'utils/aelfUtils';
import { divDecimals } from 'utils/calculate';
import { getChainIdToMap } from 'utils/chain';
import {
  DestroyModal,
  DestroyState,
  HomeActionsEnum,
  HomeState,
  setFrom,
  setHomeState,
  setReceiveId,
  setReceiveList,
  setSelectToken,
  setTo,
} from './actions';
import { parseCrossChainTransfers } from './utils';
import { DefaultWhitelistMap } from 'constants/index';
import { crossTokenMin } from 'constants/misc';
import { sliceDecimals } from 'utils/input';
import { useCrossFee } from 'hooks/useCrossFee';

const defaultSelectToken = {
  symbol: 'ELF',
  ...DefaultWhitelistMap.ELF,
};
const INITIAL_STATE = {
  selectToken: defaultSelectToken,
  toChecked: false,
  toAddress: '',
};
const HomeContext = createContext<any>(INITIAL_STATE);
const ExpirationTime = 1000 * 60 * 5;
export function useHomeContext(): [
  HomeState,
  BasicActions<HomeActionsEnum> & {
    addReceivedList: (s?: string) => void;
  },
] {
  return useContext(HomeContext);
}

//reducer
function reducer(state: HomeState, { type, payload }: { type: HomeActionsEnum; payload: any }) {
  switch (type) {
    case HomeActionsEnum.destroy: {
      return {};
    }
    case HomeActionsEnum.destroyState: {
      return Object.assign({}, state, DestroyState);
    }
    case HomeActionsEnum.destroyModal: {
      return Object.assign({}, state, DestroyModal);
    }
    default: {
      const { destroyModal } = payload;
      if (destroyModal) return Object.assign({}, state, DestroyModal, payload);
      return Object.assign({}, state, payload);
    }
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [HomeState, BasicActions<HomeActionsEnum>['dispatch']] = useReducer(reducer, INITIAL_STATE);
  const [receivedValue, updateReceivedList] = useCookie(storages.crossChainReceived);
  const { selectToken, fromInput, toInput, receiveList, receiveId } = state;
  const { fromWallet, toWallet } = useWallet();
  const { chainId: fromChainId, account: fromAccount } = fromWallet || {};
  const preFromAccount = usePrevious(fromAccount);
  const { chainId: toChainId, account: toAccount } = toWallet || {};
  const preToAccount = usePrevious(toAccount);
  const tokenInfo = useUserAddedToken(selectToken?.symbol);
  const tokens = useMemo(() => {
    if (!fromChainId) return;
    const { symbol, address, isNativeToken } = selectToken?.[fromChainId] || {};
    if (isELFChain(fromChainId)) return [symbol];
    if (isNativeToken) return [symbol];
    return [address];
  }, [fromChainId, selectToken]);
  const crossFee = useCrossFee();

  const [[balance]] = useBalances(fromWallet, tokens);
  useEffect(() => {
    if (selectToken && fromChainId && toChainId && (!selectToken[fromChainId] || !selectToken[toChainId])) {
      if (tokenInfo) {
        dispatch(setSelectToken(tokenInfo));
      } else {
        dispatch(setSelectToken(defaultSelectToken));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromChainId, toChainId, tokenInfo]);

  // auto fix token
  useEffect(() => {
    if (selectToken && fromChainId && toChainId) {
      const fromItem = selectToken?.[fromChainId];
      const toItem = selectToken?.[toChainId];
      const canForm = fromItem && !fromItem?.onlyTo;
      const canTo = toItem && !toItem?.onlyForm;
      if (!tokenInfo || !(canTo && canForm)) {
        dispatch(setSelectToken(defaultSelectToken));
      }
    }
  }, [fromChainId, selectToken, toChainId, tokenInfo]);
  useEffect(() => {
    dispatch(setTo(fromInput || ''));
  }, [fromInput]);
  useEffect(() => {
    const token = fromChainId ? selectToken?.[fromChainId] : undefined;
    if (token) {
      dispatch(setFrom(sliceDecimals(toInput, token?.decimals ?? 6)));
    } else {
      dispatch(setFrom(toInput || ''));
    }
  }, [fromChainId, selectToken, toInput]);
  useEffect(() => {
    if (preFromAccount !== fromAccount && preToAccount !== fromAccount) {
      dispatch(setHomeState({ fromInput: '', toInput: '' }));
    }
    if (preToAccount !== fromAccount) dispatch(setReceiveId(undefined));
  }, [fromAccount, preFromAccount, preToAccount]);
  const getReceiveList = useCallback(async () => {
    if (!toChainId || !toAccount) return;
    // TODO toAddress
    const req = await request.cross.getCrossChainTransfers({
      params: { toChainId: getChainIdToMap(toChainId), toAddress: toAccount, status: 1, maxResultCount: 100 },
    });
    const list = parseCrossChainTransfers(req);
    if (list) {
      const existed = list.some((i) => i.id === receiveId);
      if (!existed) dispatch(setReceiveId(undefined));
      dispatch(setReceiveList(list));
    }
  }, [receiveId, toAccount, toChainId]);
  useEffect(() => {
    dispatch(setReceiveId(undefined));
  }, [toChainId]);
  useInterval(
    () => {
      getReceiveList();
    },
    10000,
    [toChainId, toAccount, getReceiveList],
  );
  const receivedList = useMemo(() => {
    let list = [];
    try {
      if (receivedValue) {
        const tmpList = JSON.parse(receivedValue);
        if (Array.isArray(tmpList)) list = tmpList;
      }
    } catch (error) {
      console.debug(error, '=====error');
    }
    return list;
  }, [receivedValue]);
  const addReceivedList = useCallback(
    (id: string) => {
      let list: string[] = [];
      list = list.concat(receivedList);
      list.push(id);
      updateReceivedList(JSON.stringify(list), {
        expires: new Date(new Date().getTime() + ExpirationTime),
      });
    },
    [receivedList, updateReceivedList],
  );
  const actions = useMemo(() => ({ dispatch, addReceivedList }), [addReceivedList]);
  const receiveItem = useMemo(() => receiveList?.find((i) => i.id === receiveId), [receiveId, receiveList]);
  const tmpList = useMemo(() => receiveList?.filter((i) => !receivedList.includes(i.id)), [receiveList, receivedList]);
  const fromBalance = useMemo(() => {
    if (!fromChainId) return;
    const token = selectToken?.[fromChainId];
    if (!token) return;
    return { balance, show: divDecimals(balance, token.decimals), token };
  }, [balance, fromChainId, selectToken]);
  const crossMin = useMemo(() => {
    if (!isELFChain(fromChainId) && isELFChain(toChainId) && selectToken) return crossTokenMin[selectToken.symbol];
  }, [fromChainId, selectToken, toChainId]);

  return (
    <HomeContext.Provider
      value={useMemo(
        () => [{ ...state, receiveItem, receivedList, receiveList: tmpList, fromBalance, crossMin, crossFee }, actions],
        [state, receiveItem, receivedList, tmpList, fromBalance, crossMin, crossFee, actions],
      )}>
      {children}
    </HomeContext.Provider>
  );
}
