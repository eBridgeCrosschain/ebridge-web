import storages from 'constants/storages';
import { BasicActions } from 'contexts/utils';
import useStorageReducer from 'hooks/useStorageReducer';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { eventBus } from 'utils';
import { ChainActions, ChainState, setUserELFChainId, setUserERCChainId, setUserTRCChainId } from './actions';

const INITIAL_STATE = { userERCChainId: undefined, userTRCChainId: undefined };

const ChainContext = createContext<any>([INITIAL_STATE]);

export function useChain(): [ChainState, BasicActions<ChainActions>] {
  return useContext(ChainContext);
}

export function useChainDispatch() {
  const [, { dispatch }] = useChain();
  return useCallback(dispatch, [dispatch]);
}

const reducer = (state: ChainState, { type, payload }: { type: ChainActions; payload: any }) => {
  switch (type) {
    case ChainActions.destroy: {
      return {};
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
};

const options = { key: storages.useChain };
export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [ChainState, BasicActions<ChainActions>['dispatch']] = useStorageReducer(
    reducer,
    INITIAL_STATE,
    options,
  );
  const Listeners = useMemo(() => {
    return [
      { eventName: storages.userERCChainId, listener: (id: string) => dispatch(setUserERCChainId(id)) },
      { eventName: storages.userTRCChainId, listener: (id: string) => dispatch(setUserTRCChainId(id)) },
      { eventName: storages.userELFChainId, listener: (id: string) => dispatch(setUserELFChainId(id)) },
    ];
  }, [dispatch]);

  useEffect(() => {
    Listeners.forEach(({ eventName, listener }) => {
      eventBus.addListener(eventName, listener);
    });
    return () => {
      Listeners.forEach(({ eventName, listener }) => {
        eventBus.removeListener(eventName, listener);
      });
    };
  }, [Listeners]);
  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  return (
    <ChainContext.Provider value={useMemo(() => [state, actions], [actions, state])}>{children}</ChainContext.Provider>
  );
}
