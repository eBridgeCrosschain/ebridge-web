import { BasicActions } from 'contexts/utils';
import { createContext, useContext, useMemo, useReducer } from 'react';
import { PoolsActions, PoolsState } from './actions';

const INITIAL_STATE = {};

const PoolsContext = createContext<any>([INITIAL_STATE]);

export function usePools(): [PoolsState, BasicActions<PoolsActions>] {
  return useContext(PoolsContext);
}

const reducer = (state: PoolsState, { type, payload }: { type: PoolsActions; payload: any }) => {
  switch (type) {
    case PoolsActions.destroy: {
      return {};
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
};

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [PoolsState, BasicActions<PoolsActions>['dispatch']] = useReducer(reducer, INITIAL_STATE);
  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  return (
    <PoolsContext.Provider value={useMemo(() => [state, actions], [actions, state])}>{children}</PoolsContext.Provider>
  );
}
